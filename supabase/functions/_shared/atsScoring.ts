export interface AtsScoreResult {
  score: number;
  matched: string[];
  missed: string[];
  tips: string[];
}

const BANNED_PHRASES = [
  "responsible for",
  "worked on",
  "helped with",
  "assisted in",
  "participated in",
  "was involved in",
  "supported the team",
  "utilized",
  "leveraged",
  "facilitated",
  "sought to",
  "aimed to",
  "results-driven",
  "passionate",
  "passion",
  "hardworking",
  "dedicated student",
  "dynamic",
  "innovative thinker",
  "detail-oriented",
  "fast learner",
  "seeking an opportunity",
  "eager to apply",
  "excited to join",
  "enthusiastic",
  "strong communication skills",
  "team player",
  "adaptable",
];

const STRONG_VERBS = [
  "built",
  "engineered",
  "designed",
  "deployed",
  "automated",
  "implemented",
  "optimised",
  "optimized",
  "reduced",
  "delivered",
  "analysed",
  "analyzed",
  "coordinated",
  "refactored",
  "scaled",
  "launched",
  "integrated",
  "structured",
  "established",
  "generated",
  "configured",
  "migrated",
];

const SKILL_PATTERNS: RegExp[] = [
  /\b(?:machine learning|deep learning|data (?:science|engineering|analysis)|full[- ]?stack|front[- ]?end|back[- ]?end|cloud computing|devops|ci\/cd|artificial intelligence)\b/gi,
  /\b(?:python|java(?:script)?|typescript|react(?:\.js)?|node\.?js|sql|postgresql|mongodb|aws|azure|gcp|docker|kubernetes|git|agile|scrum|rest(?:ful)?|api|html|css|tensorflow|pytorch|pandas|numpy|spark|kafka|redis|graphql|next\.?js|vue|angular|spring|django|fastapi|flask|\.net|c\+\+|golang|\bgo\b|rust|ruby|php|swift|kotlin|linux|etl|nlp|tableau|power bi|excel)\b/gi,
];

const REQUIRED_SECTIONS = ["EDUCATION", "SKILLS"];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Strip LaTeX markup to plain searchable text. */
export function latexToPlainText(latex: string): string {
  let text = latex;
  // \textbf{content} and similar single-arg commands
  for (let i = 0; i < 8; i++) {
    text = text.replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, "$1");
  }
  text = text
    .replace(/\\[a-zA-Z@]+/g, " ")
    .replace(/[{}\\%$&#_^~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordInText(keyword: string, text: string): boolean {
  const normalized = keyword.toLowerCase().trim();
  if (!normalized) return false;
  const flexible = escapeRegExp(normalized).replace(/\\ /g, "\\s+");
  return new RegExp(`\\b${flexible}\\b`, "i").test(text);
}

/** Pull likely JD keywords for ATS matching. */
export function extractJdKeywords(jd: string): string[] {
  const keywords = new Set<string>();

  for (const pattern of SKILL_PATTERNS) {
    const matches = jd.match(pattern) ?? [];
    for (const match of matches) {
      keywords.add(match.toLowerCase().replace(/\s+/g, " ").trim());
    }
  }

  const caps = jd.match(
    /\b[A-Z][a-zA-Z+#.]{1,}(?:\s+[A-Z][a-zA-Z+#.]{1,})*\b/g
  ) ?? [];
  for (const term of caps) {
    const lower = term.toLowerCase();
    if (lower.length >= 3 && lower.length <= 40) {
      keywords.add(lower);
    }
  }

  const words = jd.toLowerCase().match(/\b[a-z][a-z0-9+#.]{2,}\b/g) ?? [];
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  for (const [word, count] of freq) {
    if (count >= 2 && word.length >= 4) keywords.add(word);
  }

  return [...keywords].slice(0, 12);
}

function findBannedPhrases(text: string): string[] {
  return BANNED_PHRASES.filter((phrase) => text.includes(phrase));
}

function countStrongVerbs(text: string): number {
  return STRONG_VERBS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, "i").test(text)
  ).length;
}

function scoreFormat(latex: string): { points: number; tips: string[] } {
  let points = 25;
  const tips: string[] = [];

  if (/\\begin\{tabular\}|\\begin\{multicols\}|\\begin\{minipage\}/i.test(latex)) {
    points -= 12;
    tips.push("Remove tables or multi-column layout for ATS compatibility");
  }

  if (/\\includegraphics/i.test(latex)) {
    points -= 8;
    tips.push("Remove images or icons from the resume body");
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!latex.toUpperCase().includes(section)) {
      points -= 6;
      tips.push(`Add a standard ${section} section heading`);
    }
  }

  return { points: Math.max(0, points), tips };
}

function scoreKeywords(
  text: string,
  jd: string
): { points: number; matched: string[]; missed: string[]; tips: string[] } {
  const tips: string[] = [];

  if (!jd.trim()) {
    const techHits = (text.match(
      /\b(?:python|java|react|node|sql|api|aws|docker|git|typescript|javascript|cloud|data|ml|ai)\b/gi
    ) ?? []).length;
    const points = clamp(18 + Math.min(techHits * 2, 12));
    return { points, matched: [], missed: [], tips };
  }

  const keywords = extractJdKeywords(jd);
  if (keywords.length === 0) {
    return { points: 20, matched: [], missed: [], tips };
  }

  const matched: string[] = [];
  const missed: string[] = [];

  for (const keyword of keywords) {
    if (keywordInText(keyword, text)) matched.push(keyword);
    else missed.push(keyword);
  }

  const ratio = matched.length / keywords.length;
  const points = ratio * 30;

  if (missed.length > 0) {
    tips.push(
      `Weave these JD keywords into bullets or skills: ${missed.slice(0, 6).join(", ")}`
    );
  }

  return { points, matched, missed, tips };
}

function scoreContent(text: string): { points: number; tips: string[] } {
  let points = 25;
  const tips: string[] = [];

  const banned = findBannedPhrases(text);
  points -= Math.min(banned.length * 6, 24);
  for (const phrase of banned.slice(0, 3)) {
    tips.push(`Replace banned phrase "${phrase}" with a strong action verb`);
  }

  const verbCount = countStrongVerbs(text);
  if (verbCount < 3) {
    points -= 8;
    tips.push("Open more bullets with strong action verbs (Built, Engineered, Deployed, etc.)");
  } else if (verbCount >= 6) {
    points = Math.min(25, points + 3);
  }

  return { points: Math.max(0, points), tips };
}

function scoreStructure(latex: string, jd: string): { points: number; tips: string[] } {
  let points = 20;
  const tips: string[] = [];
  const upper = latex.toUpperCase();

  if (jd.trim() && !/\\section\{.*(?:EXPERIENCE|PROJECTS)/i.test(latex)) {
    points -= 4;
    tips.push("Lead with experience or projects when a job description is provided");
  }

  if (!/\\section\{.*PROJECT/i.test(upper) && !/\\section\{.*EXPERIENCE/i.test(upper)) {
    points -= 6;
    tips.push("Add an Experience or Projects section with measurable bullets");
  }

  if (/\\section\{.*SUMMARY/i.test(upper)) {
    points -= 2;
  }

  return { points: Math.max(0, points), tips };
}

/** Deterministic ATS score from generated resume content — not raw user input. */
export function scoreGeneratedResume(
  latex: string,
  jd: string
): AtsScoreResult {
  const text = latexToPlainText(latex);

  const format = scoreFormat(latex);
  const keywords = scoreKeywords(text, jd);
  const content = scoreContent(text);
  const structure = scoreStructure(latex, jd);

  const score = clamp(
    format.points + keywords.points + content.points + structure.points
  );

  const tips = [
    ...format.tips,
    ...keywords.tips,
    ...content.tips,
    ...structure.tips,
  ].slice(0, 6);

  return {
    score,
    matched: keywords.matched,
    missed: keywords.missed,
    tips,
  };
}
