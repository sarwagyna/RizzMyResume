import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";
import { SYSTEM_PROMPT } from "./v5_4_prompt.ts";
import { scoreGeneratedResume } from "./atsScoring.ts";
import {
  getTemplatePromptSpec,
  resolveTemplateId,
  type ResumeTemplateId,
} from "./templates/index.ts";

export interface ClaudeOutput {
  latex_code: string;
  latex_body?: string;
  what_changed: string;
  ats_score: number;
  ats_tips: string[];
  jd_keywords_matched: string[];
  jd_keywords_missed: string[];
  input_flags: string[];
}

const RETURN_RESUME_TOOL = {
  name: "return_resume",
  description:
    "Submit the generated resume LaTeX and ATS metadata. Always call this tool — never return raw JSON text.",
  input_schema: {
    type: "object",
    properties: {
      latex_code: {
        type: "string",
        description:
          "Complete ready-to-compile LaTeX document (\\documentclass through \\end{document})",
      },
      what_changed: {
        type: "string",
        description: "Numbered list of changes and rationale",
      },
      ats_score: {
        type: "number",
        description:
          "Honest ATS score 0–100 for the generated latex_code resume only — never score raw student input; target ≥90 when input quality allows",
      },
      ats_tips: {
        type: "array",
        items: { type: "string" },
        description:
          "Only issues that cannot be fixed in the resume without more student info — leave empty when all fixable ATS issues are resolved in latex_code",
      },
      jd_keywords_matched: { type: "array", items: { type: "string" } },
      jd_keywords_missed: { type: "array", items: { type: "string" } },
      input_flags: { type: "array", items: { type: "string" } },
    },
    required: [
      "latex_code",
      "what_changed",
      "ats_score",
      "ats_tips",
      "jd_keywords_matched",
      "jd_keywords_missed",
      "input_flags",
    ],
  },
} as const;

function normalizeOutput(raw: Record<string, unknown>): ClaudeOutput {
  const latexCode =
    (raw.latex_code as string) || (raw.latex_body as string) || "";

  if (!latexCode) {
    throw new Error("Claude response missing latex_code");
  }

  return {
    latex_code: latexCode,
    latex_body: raw.latex_body as string | undefined,
    what_changed: String(raw.what_changed ?? ""),
    ats_score: Number(raw.ats_score ?? 0),
    ats_tips: Array.isArray(raw.ats_tips) ? raw.ats_tips.map(String) : [],
    jd_keywords_matched: Array.isArray(raw.jd_keywords_matched)
      ? raw.jd_keywords_matched.map(String)
      : [],
    jd_keywords_missed: Array.isArray(raw.jd_keywords_missed)
      ? raw.jd_keywords_missed.map(String)
      : [],
    input_flags: Array.isArray(raw.input_flags)
      ? raw.input_flags.map(String)
      : [],
  };
}

function extractLatexDocument(text: string): string | null {
  const match = text.match(/\\documentclass[\s\S]*?\\end\{document\}/);
  return match?.[0] ?? null;
}

function extractJsonStringField(text: string, field: string): string {
  const marker = `"${field}"`;
  const keyIdx = text.indexOf(marker);
  if (keyIdx === -1) return "";

  const colonIdx = text.indexOf(":", keyIdx + marker.length);
  if (colonIdx === -1) return "";

  let i = colonIdx + 1;
  while (i < text.length && /\s/.test(text[i]!)) i++;
  if (text[i] !== '"') return "";

  i++;
  let out = "";
  while (i < text.length) {
    const ch = text[i]!;
    if (ch === "\\") {
      const next = text[i + 1];
      if (next === undefined) break;
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else if (next === "r") out += "\r";
      else out += next;
      i += 2;
      continue;
    }
    if (ch === '"') break;
    out += ch;
    i++;
  }
  return out;
}

function extractJsonArrayField(text: string, field: string): string[] {
  const marker = `"${field}"`;
  const keyIdx = text.indexOf(marker);
  if (keyIdx === -1) return [];

  const openIdx = text.indexOf("[", keyIdx);
  if (openIdx === -1) return [];

  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i]!;
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        try {
          const parsed = JSON.parse(text.slice(openIdx, i + 1));
          return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
          return [];
        }
      }
    }
  }
  return [];
}

function extractJsonNumberField(text: string, field: string): number {
  const re = new RegExp(`"${field}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`);
  const match = text.match(re);
  return match ? Number(match[1]) : 0;
}

function parseClaudeJson(text: string): ClaudeOutput {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    return normalizeOutput(JSON.parse(cleaned));
  } catch {
    // Greedy JSON object match often fails on LaTeX strings — try field extraction.
  }

  const latexFromDoc = extractLatexDocument(cleaned);
  const latexFromField = extractJsonStringField(cleaned, "latex_code");
  const latexCode = latexFromDoc || latexFromField;

  if (latexCode) {
    return normalizeOutput({
      latex_code: latexCode,
      what_changed: extractJsonStringField(cleaned, "what_changed"),
      ats_score: extractJsonNumberField(cleaned, "ats_score"),
      ats_tips: extractJsonArrayField(cleaned, "ats_tips"),
      jd_keywords_matched: extractJsonArrayField(
        cleaned,
        "jd_keywords_matched"
      ),
      jd_keywords_missed: extractJsonArrayField(cleaned, "jd_keywords_missed"),
      input_flags: extractJsonArrayField(cleaned, "input_flags"),
    });
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return normalizeOutput(JSON.parse(match[0]));
    } catch {
      // fall through
    }
  }

  throw new Error("Failed to parse Claude response as JSON");
}

function parseClaudeResponse(
  content: Anthropic.Messages.ContentBlock[]
): ClaudeOutput {
  const toolBlock = content.find(
    (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
  );

  if (toolBlock?.name === "return_resume") {
    return normalizeOutput(toolBlock.input as Record<string, unknown>);
  }

  const textBlock = content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in Claude response");
  }

  return parseClaudeJson(textBlock.text);
}

function buildSystemPrompt(templateId: ResumeTemplateId): string {
  const spec = getTemplatePromptSpec(templateId);
  const marker = "## ═══ LATEX OUTPUT SPECIFICATION ═══";
  const apiMarker = "## API OUTPUT FORMAT (MANDATORY)";
  const start = SYSTEM_PROMPT.indexOf(marker);
  const end = SYSTEM_PROMPT.indexOf(apiMarker);
  if (start === -1 || end === -1) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT.slice(0, start)}${spec}\n\n---\n\n${SYSTEM_PROMPT.slice(end)}`;
}

const TARGET_ATS_SCORE = 90;
const MAX_GENERATION_ATTEMPTS = 1;

function applyComputedAtsScore(output: ClaudeOutput, jd: string): ClaudeOutput {
  const scored = scoreGeneratedResume(output.latex_code, jd);
  return {
    ...output,
    ats_score: scored.score,
    jd_keywords_matched: scored.matched,
    jd_keywords_missed: scored.missed,
    ats_tips: scored.score >= TARGET_ATS_SCORE ? [] : scored.tips,
  };
}

function needsAtsOptimization(output: ClaudeOutput, jd: string): boolean {
  if (output.ats_score < TARGET_ATS_SCORE) return true;
  if (output.ats_tips.length > 0) return true;
  if (jd.trim() && output.jd_keywords_missed.length > 0) return true;
  return false;
}

function buildAtsOptimizationFeedback(output: ClaudeOutput): string {
  const lines = [
    "ATS optimization failed — the generated resume still scores too low.",
    `Computed score: ${output.ats_score}/100 (target ${TARGET_ATS_SCORE}+).`,
    "Rewrite the FULL resume in latex_code. Fix every issue below before calling return_resume again.",
    "Score ONLY the resume you generate — never the raw student input.",
  ];

  if (output.jd_keywords_missed.length > 0) {
    lines.push(
      `MISSING JD KEYWORDS — add naturally to skills and bullets: ${output.jd_keywords_missed.join(", ")}`
    );
  }

  if (output.ats_tips.length > 0) {
    lines.push(
      `FIX IN RESUME:\n${output.ats_tips.map((tip, i) => `${i + 1}. ${tip}`).join("\n")}`
    );
  }

  if (output.input_flags.length > 0) {
    lines.push(
      `INPUT LIMITS (work around honestly):\n${output.input_flags.map((flag, i) => `${i + 1}. ${flag}`).join("\n")}`
    );
  }

  lines.push(
    "Return return_resume with a completely rewritten, higher-scoring resume. Empty ats_tips when fixable issues are resolved."
  );

  return lines.join("\n");
}

function buildInitialUserContent(
  rawInput: string,
  jd: string,
  targetRole: string | undefined,
  extra = ""
): string {
  return `## RAW INPUT FROM STUDENT
${rawInput}

## TARGET ROLE
${targetRole || "NOT PROVIDED"}

## TARGET JOB DESCRIPTION
${jd || "NOT PROVIDED"}

Build and optimize the resume for ATS score ${TARGET_ATS_SCORE}+. Weave JD keywords into the generated resume — the score is computed from your latex_code output, not this raw input.${extra}`;
}

async function callClaudeWithMessages(
  client: Anthropic,
  templateId: ResumeTemplateId,
  messages: Anthropic.Messages.MessageParam[]
): Promise<Anthropic.Messages.Message> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: buildSystemPrompt(templateId),
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [RETURN_RESUME_TOOL],
    tool_choice: { type: "tool", name: "return_resume" },
    messages,
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("Claude response truncated — output exceeded token limit");
  }

  return response;
}

export async function generateResumeContent(
  rawInput: string,
  jd: string,
  targetRole?: string,
  templateId: ResumeTemplateId = "template-001",
  retry = false
): Promise<ClaudeOutput> {
  const client = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
  });

  const resolvedTemplateId = resolveTemplateId(templateId);

  try {
    let lastOutput: ClaudeOutput | null = null;

    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: buildInitialUserContent(
          rawInput,
          jd,
          targetRole,
          retry ? "\n\nIMPORTANT: Call return_resume with complete latex_code." : ""
        ),
      },
    ];

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const response = await callClaudeWithMessages(
        client,
        resolvedTemplateId,
        messages
      );

      let output = applyComputedAtsScore(
        parseClaudeResponse(response.content),
        jd
      );
      lastOutput = output;

      if (!needsAtsOptimization(output, jd)) {
        return output;
      }

      if (attempt >= MAX_GENERATION_ATTEMPTS - 1) {
        break;
      }

      const toolBlock = response.content.find(
        (block): block is Anthropic.Messages.ToolUseBlock =>
          block.type === "tool_use"
      );
      if (!toolBlock) break;

      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolBlock.id,
            content: buildAtsOptimizationFeedback(output),
          },
        ],
      });
    }

    return lastOutput!;
  } catch (err) {
    if (!retry) {
      return generateResumeContent(
        rawInput,
        jd,
        targetRole,
        resolvedTemplateId,
        true
      );
    }
    throw err;
  }
}

export function formatRawInput(input: Record<string, unknown>): string {
  return JSON.stringify(input, null, 2);
}
