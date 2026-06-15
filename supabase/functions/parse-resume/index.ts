import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";
import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  getAuthUser,
} from "../_shared/utils.ts";

const EXTRACT_PROMPT = `You extract structured resume data from uploaded documents.

Return ONLY valid JSON matching this schema (use empty strings/arrays for missing fields):

{
  "fullName": "",
  "email": "",
  "phone": "",
  "linkedinUrl": "",
  "githubUrl": "",
  "city": "",
  "state": "",
  "education": [{ "institution": "", "degree": "", "field": "", "startYear": "", "endYear": "", "cgpa": "" }],
  "skills": ["skill1"],
  "softSkills": ["communication"],
  "languages": ["English (Fluent)"],
  "interests": ["interest1"],
  "projects": [{ "name": "", "description": "", "technologies": "", "link": "", "startDate": "", "endDate": "" }],
  "experience": [{ "company": "", "role": "", "startDate": "", "endDate": "", "description": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "", "credential": "" }],
  "targetRole": "",
  "jdText": "",
  "warnings": ["fields that could not be found or need user review"]
}

Rules:
- Extract only what is clearly present — never invent experience or projects
- Phone: digits only or +91 format for India
- URLs must be full https:// links or empty string
- Max 4 projects, max 10 skills, max 5 languages, max 5 interests
- Project descriptions: copy from resume even if short
- Extract project start/end dates as timeline (e.g. Jan 2024 – Mar 2024)
- Extract certification credential IDs or verification URLs when present
- Separate spoken languages from technical skills
- Separate soft skills (communication, leadership) from technical skills — only if evidenced in input
- Extract interests/hobbies into interests array (not skills)
- warnings: list missing critical fields (LinkedIn, GitHub, CGPA, project links, languages, interests, etc.)`;

interface ParseBody {
  content_base64?: string;
  media_type?: string;
  text?: string;
  filename?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  const user = await getAuthUser(req);
  if (!user?.id) return errorResponse("Unauthorized", 401);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return errorResponse("Resume parsing is not configured yet", 503);
  }

  const body: ParseBody = await req.json();

  if (!body.text && !body.content_base64) {
    return errorResponse("No resume content provided");
  }

  const client = new Anthropic({ apiKey });

  const userContent: Array<Record<string, unknown>> = [];

  if (body.content_base64 && body.media_type === "application/pdf") {
    userContent.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: body.content_base64,
      },
    });
  } else if (body.text) {
    userContent.push({
      type: "text",
      text: `RESUME TEXT (${body.filename ?? "upload"}):\n\n${body.text}`,
    });
  }

  userContent.push({
    type: "text",
    text: EXTRACT_PROMPT,
  });

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return errorResponse("No response from parser", 500);
    }

    const cleaned = textBlock.text.replace(/```json\n?|\n?```/g, "").trim();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) return errorResponse("Failed to parse resume data", 500);
      parsed = JSON.parse(match[0]);
    }

    const { warnings, ...form } = parsed;

    return jsonResponse({
      form,
      warnings: Array.isArray(warnings) ? warnings.map(String) : [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Parse failed";
    return errorResponse(message, 500);
  }
});
