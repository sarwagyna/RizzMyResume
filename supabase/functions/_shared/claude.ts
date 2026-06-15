import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";
import { SYSTEM_PROMPT } from "./v5_4_prompt.ts";

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
      ats_score: { type: "number" },
      ats_tips: { type: "array", items: { type: "string" } },
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

export async function generateResumeContent(
  rawInput: string,
  jd: string,
  targetRole?: string,
  retry = false
): Promise<ClaudeOutput> {
  const client = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
  });

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [RETURN_RESUME_TOOL],
      tool_choice: { type: "tool", name: "return_resume" },
      messages: [
        {
          role: "user",
          content: `## RAW INPUT FROM STUDENT
${rawInput}

## TARGET ROLE
${targetRole || "NOT PROVIDED"}

## TARGET JOB DESCRIPTION
${jd || "NOT PROVIDED"}${retry ? "\n\nIMPORTANT: Call return_resume with complete latex_code." : ""}`,
        },
      ],
    });

    if (response.stop_reason === "max_tokens") {
      throw new Error("Claude response truncated — output exceeded token limit");
    }

    return parseClaudeResponse(response.content);
  } catch (err) {
    if (!retry) {
      return generateResumeContent(rawInput, jd, targetRole, true);
    }
    throw err;
  }
}

export function formatRawInput(input: Record<string, unknown>): string {
  return JSON.stringify(input, null, 2);
}
