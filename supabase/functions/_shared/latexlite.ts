import {
  getTemplate,
  resolveTemplateId,
  usesPipedContactHeader,
  type ResumeTemplateId,
} from "./templates/index.ts";

function hasListItem(content: string): boolean {
  return /\\(?:item|resumeItem)\b/.test(content);
}

/** Empty itemize / resumeItemList blocks cause "missing \\item" on LaTeXLite. */
function removeEmptyListEnvironments(body: string): string {
  let result = body;
  let previous = "";

  while (result !== previous) {
    previous = result;

    result = result.replace(
      /\\resumeItemListStart\s*\\resumeItemListEnd/g,
      ""
    );
    result = result.replace(
      /\\resumeProjectListStart\s*\\resumeProjectListEnd/g,
      ""
    );

    result = result.replace(
      /\\resumeItemListStart([\s\S]*?)\\resumeItemListEnd/g,
      (match, inner) => (hasListItem(inner) ? match : "")
    );
    result = result.replace(
      /\\resumeProjectListStart([\s\S]*?)\\resumeProjectListEnd/g,
      (match, inner) => (hasListItem(inner) ? match : "")
    );

    result = result.replace(
      /\\begin\{itemize\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{itemize\}/g,
      (match, inner) => (hasListItem(inner) ? match : "")
    );
  }

  return result;
}

/** Map CSS-style rgb(...) color refs to valid xcolor syntax. */
function fixInvalidColorReferences(body: string): string {
  const mapColorCmd = (cmd: "color" | "textcolor", rgb: string): string => {
    const parts = rgb.split(",").map((n) => n.trim()).filter(Boolean);
    if (parts.length !== 3 || !parts.every((n) => /^\d{1,3}$/.test(n))) {
      return `\\${cmd}{black}`;
    }
    const key = parts.join(",");
    if (key === "31,73,125") return `\\${cmd}{sectionbar}`;
    if (key === "80,80,80") return `\\${cmd}{accentgray}`;
    return `\\${cmd}[RGB]{${parts.join(",")}}`;
  };

  return body
    .replace(/\\textcolor\{rgb\(\s*([^)]+)\s*\)\}/gi, (_, rgb) =>
      mapColorCmd("textcolor", rgb)
    )
    .replace(/\\color\{rgb\(\s*([^)]+)\s*\)\}/gi, (_, rgb) =>
      mapColorCmd("color", rgb)
    )
    .replace(
      /\\definecolor\{([^}]+)\}\{rgb\}\{([^}]+)\}/gi,
      (_, name, vals) => `\\definecolor{${name}}{RGB}{${vals}}`
    );
}

/** Map common AI-invented section commands to standard LaTeX. */
function fixHallucinatedLatexCommands(body: string): string {
  return body.replace(
    /\\(?:sectionheader|sectionheading|sectiontitle|resumesection|cvsection)\s*\{/gi,
    "\\section{"
  );
}

/** AI sometimes glues standard commands to the next word (e.g. \\noindentLeadFlow, \\LARGESarwan). */
function fixGluedLatexCommands(body: string): string {
  const commands = [
    "noindent",
    "hfill",
    "hspace",
    "vspace",
    "textbf",
    "textit",
    "textrm",
    "emph",
    "quad",
    "qquad",
    "enspace",
    "tiny",
    "scriptsize",
    "footnotesize",
    "small",
    "normalsize",
    "large",
    "Large",
    "LARGE",
    "huge",
    "Huge",
    "bfseries",
    "mdseries",
    "itshape",
    "rmfamily",
    "sffamily",
    "ttfamily",
    "centering",
    "par",
  ];

  let result = body;
  for (const cmd of commands) {
    result = result.replace(
      new RegExp(`\\\\${cmd}(?=[A-Za-z])`, "g"),
      `\\${cmd} `
    );
  }
  return result;
}

/** Remove AI-generated name/contact header — compiler injects a trusted header. */
function stripAiGeneratedHeader(body: string): string {
  return body
    .replace(/\\begin\{center\}[\s\S]*?\\end\{center\}/g, "")
    .replace(/^\s*\\vspace\{[^}]*\}\s*/m, "");
}

/** \\datedline already emits \\noindent — strip duplicate inside arguments. */
function stripRedundantNoindentInDatedline(body: string): string {
  return body.replace(/\\datedline\{\s*\\noindent\s+/g, "\\datedline{");
}

function fixCommonLatexTypos(body: string): string {
  return stripRedundantNoindentInDatedline(
    fixGluedLatexCommands(fixHallucinatedLatexCommands(body))
  );
}

function skipLatexControlSequence(body: string, index: number): number {
  let i = index;
  if (body[i] !== "\\") return i;

  i++;
  if (i < body.length && body[i] === "%") {
    while (i < body.length && body[i] !== "\n") i++;
    return i;
  }

  if (i < body.length && (body[i] === "{" || body[i] === "}")) {
    return i + 1;
  }

  while (i < body.length && /[a-zA-Z@*]/.test(body[i]!)) {
    i++;
  }

  return i;
}

/** Index after the closing `}` of a group that opens at openBraceIndex, or -1. */
function readBalancedGroupEnd(body: string, openBraceIndex: number): number {
  if (body[openBraceIndex] !== "{") return -1;

  let depth = 0;
  let i = openBraceIndex;

  while (i < body.length) {
    const ch = body[i]!;

    if (ch === "\\") {
      i = skipLatexControlSequence(body, i);
      continue;
    }

    if (ch === "{") {
      depth++;
      i++;
      continue;
    }

    if (ch === "}") {
      depth--;
      i++;
      if (depth === 0) return i;
      continue;
    }

    i++;
  }

  return -1;
}

function startsWithMacro(body: string, index: number, macro: string): boolean {
  const token = `\\${macro}`;
  if (!body.startsWith(token, index)) return false;
  const next = body[index + token.length];
  return next === undefined || !/[a-zA-Z]/.test(next);
}

/** AI sometimes emits a standalone `}` line between list items or macro rows. */
function stripStandaloneClosingBraceLines(body: string): string {
  return body.replace(/^\s*\}\s*$/gm, "");
}

/** Drop orphan closing braces and close any unclosed groups. */
function balanceLatexBraces(body: string): string {
  let depth = 0;
  let out = "";
  let i = 0;

  while (i < body.length) {
    const ch = body[i]!;

    if (ch === "\\") {
      const next = i + 1 < body.length ? body[i + 1] : "";
      if (next === "{" || next === "}") {
        out += ch + next;
        i += 2;
        continue;
      }

      const nextI = skipLatexControlSequence(body, i);
      out += body.slice(i, nextI);
      i = nextI;
      continue;
    }

    if (ch === "{") {
      depth++;
      out += ch;
      i++;
      continue;
    }

    if (ch === "}") {
      if (depth > 0) {
        depth--;
        out += ch;
      }
      i++;
      continue;
    }

    out += ch;
    i++;
  }

  while (depth > 0) {
    out += "}";
    depth--;
  }

  return out;
}

/** Escape % and & in LaTeX argument text (inside {...}). */
function escapeLatexArgumentChars(body: string): string {
  let depth = 0;
  let out = "";
  let i = 0;

  while (i < body.length) {
    const ch = body[i]!;

    if (ch === "\\") {
      const next = i + 1 < body.length ? body[i + 1] : "";
      if (next === "{" || next === "}") {
        out += ch + next;
        i += 2;
        continue;
      }

      const nextI = skipLatexControlSequence(body, i);
      out += body.slice(i, nextI);
      i = nextI;
      continue;
    }

    if (ch === "{") {
      depth++;
      out += ch;
      i++;
      continue;
    }

    if (ch === "}") {
      if (depth > 0) {
        depth--;
        out += ch;
      }
      i++;
      continue;
    }

    if (depth > 0) {
      if (ch === "%") {
        out += "\\%";
        i++;
        continue;
      }
      if (ch === "&") {
        out += "\\&";
        i++;
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

function stripMacroBraceAware(body: string, macro: string): string {
  let result = "";
  let i = 0;

  while (i < body.length) {
    if (!startsWithMacro(body, i, macro)) {
      result += body[i];
      i++;
      continue;
    }

    const openBrace = i + macro.length + 1;
    if (body[openBrace] !== "{") {
      result += body[i];
      i++;
      continue;
    }

    const end = readBalancedGroupEnd(body, openBrace);
    if (end === -1) {
      result += body[i];
      i++;
      continue;
    }

    result += body.slice(openBrace + 1, end - 1);
    i = end;
  }

  return result;
}

function stripTextbfBraceAware(body: string): string {
  return stripMacroBraceAware(body, "textbf");
}

/** Plain-text macro argument — strips nested formatting and orphan braces. */
function flattenMacroArgumentContent(inner: string): string {
  let text = inner;
  for (const macro of [
    "textbf",
    "textit",
    "emph",
    "textrm",
    "textsc",
    "textmd",
    "textsf",
    "texttt",
    "myuline",
    "underline",
  ]) {
    text = stripMacroBraceAware(text, macro);
  }
  text = balanceLatexBraces(text);
  text = text.replace(/(?<!\\)\{/g, "").replace(/(?<!\\)\}/g, "");
  return stripLineBreaksFromPlainText(text);
}

/** AI sometimes misspells resume list macros with wrong casing. */
function normalizeResumeMacroNames(body: string): string {
  return body
    .replace(/\\resumeitemliststart\b/gi, "\\resumeItemListStart")
    .replace(/\\resumeitemlistend\b/gi, "\\resumeItemListEnd")
    .replace(/\\resumeprojectliststart\b/gi, "\\resumeProjectListStart")
    .replace(/\\resumeprojectlistend\b/gi, "\\resumeProjectListEnd")
    .replace(/\\resumeitem\b/gi, "\\resumeItem");
}

/** Convert raw \\item rows inside list blocks to flattened \\resumeItem{...}. */
function convertItemLinesToResumeItems(body: string): string {
  return body.replace(
    /(\\resume(?:Item|Project)ListStart|\\begin\{itemize\}(?:\[[^\]]*\])?)([\s\S]*?)(\\resume(?:Item|Project)ListEnd|\\end\{itemize\})/g,
    (_match, open: string, inner: string, close: string) => {
      const fixed = inner.replace(
        /^\s*\\item(?!\[[^\]]*\])\s+([^\n]*)/gm,
        (lineMatch, raw: string) => {
          if (/\\resumeItem\b/.test(lineMatch)) return lineMatch;
          const text = flattenMacroArgumentContent(raw.trim());
          if (!text) return "";
          return `\n  \\resumeItem{${text}}`;
        }
      );
      return `${open}${fixed}${close}`;
    }
  );
}

function stripLineBreaksFromPlainText(text: string): string {
  return text
    .replace(/\\(?:\\|\[[^\]]*\])/g, " ")
    .replace(/\\(?:newline|linebreak|pagebreak)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const LATEX_LINE_BREAK = /\\(?:\\|\[[^\]]*\])/g;

/** A matched tabular/tabularx environment (the only place \\ is legal). */
const TABULAR_BLOCK =
  /\\begin\{(?:tabular|tabularx)\}[\s\S]*?\\end\{(?:tabular|tabularx)\}/g;

/** A single row break: \\ optionally starred and/or with [spacing]. */
const TABULAR_ROW_BREAK = String.raw`\\\\\*?(?:\[[^\]]*\])?`;

/**
 * Inside a tabular, a leading row break (before any cell content) or empty
 * consecutive rows trigger "There's no line here to end." Collapse them while
 * keeping the row breaks that actually separate content rows.
 */
function sanitizeTabularBlock(block: string): string {
  const begin = block.match(/^\\begin\{(?:tabular|tabularx)\}/);
  const end = block.match(/\\end\{(?:tabular|tabularx)\}\s*$/);
  if (!begin || !end) return block;

  let pos = begin[0].length;
  while (pos < block.length) {
    while (pos < block.length && /\s/.test(block[pos]!)) pos++;
    if (block[pos] === "[") {
      const close = block.indexOf("]", pos);
      if (close === -1) break;
      pos = close + 1;
      continue;
    }
    if (block[pos] === "{") {
      const groupEnd = readBalancedGroupEnd(block, pos);
      if (groupEnd === -1) break;
      pos = groupEnd;
      continue;
    }
    break;
  }

  const header = block.slice(0, pos);
  const footer = end[0];
  let inner = block.slice(pos, block.length - footer.length);

  inner = inner
    .replace(
      new RegExp(`(${TABULAR_ROW_BREAK})(?:\\s*${TABULAR_ROW_BREAK})+`, "g"),
      "$1"
    )
    .replace(new RegExp(`^(\\s*)(?:${TABULAR_ROW_BREAK}\\s*)+`), "$1")
    .replace(new RegExp(`(?:\\s*${TABULAR_ROW_BREAK})+(\\s*)$`), "$1");

  return `${header}${inner}${footer}`;
}

/**
 * Outside a matched tabular block, any \begin/\end{tabular...} is an orphan
 * (unbalanced) delimiter that would crash the compiler — drop it along with
 * the column-spec argument groups that follow an orphan \begin.
 */
function stripOrphanTabularDelimiters(segment: string): string {
  const withoutEnds = segment.replace(
    /\\end\{(?:tabular|tabularx)\}/g,
    ""
  );

  let out = "";
  let i = 0;
  const beginRe = /^\\begin\{(?:tabular|tabularx)\}/;

  while (i < withoutEnds.length) {
    const match = beginRe.exec(withoutEnds.slice(i));
    if (!match) {
      out += withoutEnds[i];
      i++;
      continue;
    }

    i += match[0].length;
    while (i < withoutEnds.length) {
      while (i < withoutEnds.length && /\s/.test(withoutEnds[i]!)) i++;
      if (withoutEnds[i] === "[") {
        const close = withoutEnds.indexOf("]", i);
        if (close === -1) break;
        i = close + 1;
        continue;
      }
      if (withoutEnds[i] === "{") {
        const end = readBalancedGroupEnd(withoutEnds, i);
        if (end === -1) break;
        i = end;
        continue;
      }
      break;
    }
  }

  return out;
}

/** Remove every \\ / \newline from text outside tabular (vertical mode). */
function scrubOutsideTabular(segment: string): string {
  const out: string[] = [];

  for (const line of stripOrphanTabularDelimiters(segment).split("\n")) {
    const cleaned = line
      .replace(LATEX_LINE_BREAK, " ")
      .replace(/\\(?:newline|linebreak|pagebreak)\b/g, " ")
      .replace(/\\noindent\s+CGPA\s+(?!\\,)/gi, "\\noindent CGPA\\,--\\, ")
      .replace(/\s{2,}/g, " ")
      .trimEnd();

    if (cleaned.trim()) {
      out.push(cleaned);
    }
  }

  return out.join("\n");
}

function scrubLineBreaks(body: string): string {
  let result = "";
  let lastIndex = 0;

  for (const match of body.matchAll(TABULAR_BLOCK)) {
    const start = match.index ?? 0;
    result += scrubOutsideTabular(body.slice(lastIndex, start));
    result += `\n${sanitizeTabularBlock(match[0])}\n`;
    lastIndex = start + match[0].length;
  }
  result += scrubOutsideTabular(body.slice(lastIndex));

  return result.replace(/\n{3,}/g, "\n\n").trim();
}

/** Remove stray \\\\ outside tabular — causes "There's no line here to end." */
function fixInvalidLineBreaks(body: string): string {
  return scrubLineBreaks(body);
}

function removeEmptyResumeRows(body: string): string {
  return body
    .replace(/\\datedline\{\s*\}\{\s*\}\s*\n?/g, "")
    .replace(/\\jobentry\{\s*\}\{\s*\}\{\s*\}\s*\n?/g, "")
    .replace(/\\eduentry\{\s*\}\{\s*\}\{\s*\}\{\s*\}\s*\n?/g, "")
    .replace(/\\resumeItem\{\s*\}\s*\n?/g, "");
}

function macroArgsAreEmpty(values: string[]): boolean {
  return values.every((value) => !value.trim());
}

/** Skip any run of orphan `}` immediately following a fully parsed macro call. */
function skipSpuriousClosingBraces(body: string, index: number): number {
  let i = index;
  while (i < body.length && body[i] === "}") i++;
  return i;
}

/** Drop orphan `}` on \\item lines (AI sometimes uses \\item instead of \\resumeItem). */
function fixItemLineTrailingBraces(body: string): string {
  return body
    .split("\n")
    .map((line) => {
      if (!/\\item\b/.test(line)) return line;

      let depth = 0;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]!;
        if (ch === "\\") {
          i = skipLatexControlSequence(line, i) - 1;
          continue;
        }
        if (ch === "{") depth++;
        if (ch === "}") depth--;
      }

      let trimmed = line;
      while (depth < 0 && trimmed.endsWith("}")) {
        trimmed = trimmed.slice(0, -1);
        depth++;
      }
      return trimmed;
    })
    .join("\n");
}

/**
 * Re-parse braced resume macros and re-emit with flattened arguments.
 * Eliminates spurious `}` after \\resumeItem{...}, \\datedline{...}, etc.
 */
function rebuildBracedMacroCalls(body: string, flattenArgs = true): string {
  const specs: Array<{ name: string; args: number; flatten: boolean }> = [
    { name: "resumeItem", args: 1, flatten: true },
    { name: "section", args: 1, flatten: true },
    { name: "jobentry", args: 3, flatten: true },
    { name: "eduentry", args: 4, flatten: true },
    { name: "datedline", args: 2, flatten: true },
    { name: "href", args: 2, flatten: false },
    { name: "textcolor", args: 1, flatten: false },
  ];

  let result = body;

  for (const { name, args, flatten } of specs) {
    let out = "";
    let i = 0;

    while (i < result.length) {
      if (!startsWithMacro(result, i, name)) {
        out += result[i];
        i++;
        continue;
      }

      const token = `\\${name}`;
      out += token;
      i += token.length;

      const argValues: string[] = [];
      let readArgs = 0;

      while (readArgs < args && i < result.length) {
        while (i < result.length && /\s/.test(result[i]!)) i++;
        if (result[i] !== "{") break;

        const end = readBalancedGroupEnd(result, i);
        if (end === -1) {
          out += result.slice(i);
          i = result.length;
          break;
        }

        const rawArg = result.slice(i + 1, end - 1);
        argValues.push(
          flattenArgs && flatten
            ? flattenMacroArgumentContent(rawArg)
            : balanceLatexBraces(rawArg)
        );
        i = end;
        readArgs++;

        if (readArgs < args) {
          while (i < result.length && /\s/.test(result[i]!)) i++;
          i = skipSpuriousClosingBraces(result, i);
        }
      }

      const scanStart = i - token.length;
      const emitStart = out.length - token.length;

      if (readArgs === args) {
        if (!macroArgsAreEmpty(argValues)) {
          for (const value of argValues) {
            out += `{${value}}`;
          }
        } else {
          out = out.slice(0, emitStart);
        }
        i = skipSpuriousClosingBraces(result, i);
        continue;
      }

      if (readArgs > 0) {
        while (argValues.length < args) {
          argValues.push("");
        }
        if (!macroArgsAreEmpty(argValues)) {
          for (const value of argValues) {
            out += `{${value}}`;
          }
        } else {
          out = out.slice(0, emitStart);
        }
        i = skipSpuriousClosingBraces(result, i);
        continue;
      }

      out = out.slice(0, emitStart);
      out += result[scanStart];
      i = scanStart + 1;
      continue;
    }

    result = out;
  }

  return result;
}

function extractRawLatexBody(latexCode: string): string {
  const trimmed = latexCode.trim();
  const fromDocument = extractDocumentBody(trimmed);
  if (fromDocument) return stripAiGeneratedHeader(fromDocument);

  if (/\\documentclass/i.test(trimmed)) {
    return stripAiGeneratedHeader(
      trimmed
        .replace(/^\\documentclass[\s\S]*?\\begin\{document\}/i, "")
        .replace(/\\end\{document\}\s*$/i, "")
        .trim()
    );
  }

  return stripAiGeneratedHeader(trimmed);
}

function runSanitizePass(body: string, flattenArgs: boolean): string {
  return removeEmptyListEnvironments(
    balanceLatexBraces(
      rebuildBracedMacroCalls(
        fixItemLineTrailingBraces(
          stripStandaloneClosingBraceLines(
            escapeLatexArgumentChars(body)
          )
        ),
        flattenArgs
      )
    )
  );
}

function sanitizeLatexBody(body: string, aggressive = false): string {
  const preprocessed = normalizeResumeMacroNames(
    convertItemLinesToResumeItems(
      fixCommonLatexTypos(
        body
          .replace(/\\fa[A-Za-z]+\*?/g, "")
          .replace(/\\hspace\{3pt\}/g, "\\hspace{1pt}")
          .replace(/(\$|\$)\s*\|\s*\$[\s\n]*(\$|\$)\s*\|\s*/g, " $|$ ")
      )
    )
  );

  let result = runSanitizePass(
    fixInvalidColorReferences(preprocessed),
    true
  );

  if (aggressive) {
    result = runSanitizePass(
      stripTextbfBraceAware(result).replace(/\\myuline\{([^}]*)\}/g, "$1"),
      true
    );
  }

  for (let pass = 0; pass < 3; pass++) {
    const next = balanceLatexBraces(rebuildBracedMacroCalls(result, true));
    if (next === result) break;
    result = next;
  }

  return fixInvalidLineBreaks(
    removeEmptyResumeRows(balanceLatexBraces(result))
  );
}

function stripTabularBlocks(body: string): string {
  return body.replace(
    /\\begin\{(?:tabular|tabularx)\}[\s\S]*?\\end\{(?:tabular|tabularx)\}/g,
    ""
  );
}

function stripFragileBodyCommands(body: string): string {
  return sanitizeLatexBody(body, true);
}

export function buildLatexDocument(
  latexBody: string,
  fullName: string,
  email: string,
  phone: string,
  simplified = false,
  templateId: ResumeTemplateId = "template-001",
  city = "",
  state = ""
): string {
  const escapedName = escapeLatex(fullName);
  const escapedEmail = escapeLatex(email);
  const escapedPhone = escapeLatex(phone);
  const template = getTemplate(templateId);
  const preamble = simplified
    ? template.fallbackPreamble
    : template.preamble;

  const location = [city, state].filter(Boolean).join(", ");
  const escapedLocation = escapeLatex(location);

  if (usesPipedContactHeader(templateId)) {
    const vspaceAfterHeader =
      templateId === "template-002" ? "\\vspace{4pt}" : "\\vspace{2pt}";
    const nameBreak =
      templateId === "template-002" ? "\\par\\vspace{5pt}" : "\\par\\vspace{4pt}";
    const pipeSep = templateId === "template-002"
      ? " \\enspace$|$\\enspace "
      : " \\quad$|$\\quad ";

    return `${preamble}
\\begin{document}
\\begin{center}
  {\\LARGE\\bfseries ${escapedName}}${nameBreak}
  {\\small
    ${escapedLocation}${pipeSep}
    ${escapedPhone}${pipeSep}
    \\href{mailto:${escapedEmail}}{${escapedEmail}}
  }
\\end{center}
${vspaceAfterHeader}
${latexBody}
\\end{document}`;
  }

  return `${preamble}
\\begin{document}
\\begin{center}
  {\\LARGE\\bfseries ${escapedName}}\\par\\vspace{4pt}
  {\\small
    ${escapedLocation} \\quad$|$\\quad
    ${escapedPhone} \\quad$|$\\quad
    \\href{mailto:${escapedEmail}}{${escapedEmail}}
  }
\\end{center}
\\vspace{2pt}
${latexBody}
\\end{document}`;
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (m) => `\\${m}`)
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function extractDocumentBody(latexCode: string): string | null {
  const match = latexCode.match(
    /\\begin\{document\}([\s\S]*?)\\end\{document\}/
  );
  return match ? match[1].trim() : null;
}

export interface ResumeContactInfo {
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
}

export interface CompileLatexContext {
  sourceLatex: string;
  contact: ResumeContactInfo;
}

export function prepareResumeForCompile(
  latexCode: string,
  templateId: ResumeTemplateId = "template-001",
  contact: ResumeContactInfo,
  options: {
    aggressive?: boolean;
    simplified?: boolean;
    stripTabular?: boolean;
  } = {}
): string {
  let body = sanitizeLatexBody(
    extractRawLatexBody(latexCode),
    options.aggressive ?? true
  );

  if (options.stripTabular) {
    body = scrubLineBreaks(stripTabularBlocks(body));
  }

  const doc = buildLatexDocument(
    body,
    contact.fullName || "Candidate",
    contact.email || "",
    contact.phone || "",
    options.simplified ?? false,
    templateId,
    contact.city || "",
    contact.state || ""
  );

  return doc.replace(
    /\\begin\{document\}([\s\S]*?)\\end\{document\}/,
    (_, inner) => `\\begin{document}${scrubLineBreaks(inner)}\\end{document}`
  );
}

export function normalizeLatexDocument(
  latexCode: string,
  templateId: ResumeTemplateId = "template-001"
): string {
  let latex = latexCode.trim();
  const template = getTemplate(templateId);

  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{inputenc\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{T1\}\{fontenc\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{tgheros\}\s*\n?/g, "");
  latex = latex.replace(/\\renewcommand\*\\familydefault\{\\sfdefault\}\s*\n?/g, "");
  latex = latex.replace(/\\renewcommand\*\\familydefault\{\\rmdefault\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{fullpage\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{babel\}\s*\n?/g, "");
  latex = latex.replace(/\\pdfgentounicode=[^\n]*\n?/g, "");
  latex = latex.replace(/^\\setmainfont[\s\S]*?\n(?=\\[a-zA-Z@])/gm, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{newtxtext\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{newtxmath\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{microtype\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{parskip\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{palatino\}\s*\n?/g, "");
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{fontawesome5\}\s*\n?/g, "");
  latex = latex.replace(/\\fa[A-Za-z]+\*?/g, "");
  latex = fixCommonLatexTypos(latex);
  latex = fixInvalidColorReferences(latex);

  const body = sanitizeLatexBody(extractRawLatexBody(latex));
  return `${template.preamble}
\\begin{document}
${body}
\\end{document}`;
}

export async function compileLatex(
  latexCode: string,
  attempt = 0,
  templateId: ResumeTemplateId = "template-001",
  context?: CompileLatexContext
): Promise<Uint8Array> {
  const resolvedTemplateId = resolveTemplateId(templateId);
  const template = getTemplate(resolvedTemplateId);

  const response = await fetch("https://latexlite.com/v1/renders-sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("LATEXLITE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ template: latexCode }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const error = await response.text();

    if (context && attempt === 0) {
      return compileLatex(
        prepareResumeForCompile(
          context.sourceLatex,
          resolvedTemplateId,
          context.contact,
          { aggressive: true, simplified: true }
        ),
        1,
        resolvedTemplateId,
        context
      );
    }

    if (context && attempt === 1) {
      return compileLatex(
        prepareResumeForCompile(
          context.sourceLatex,
          resolvedTemplateId,
          context.contact,
          { aggressive: true, simplified: true, stripTabular: true }
        ),
        2,
        resolvedTemplateId,
        context
      );
    }

    if (context && attempt === 2) {
      throw new Error(
        `LaTeXLite compilation failed: ${error}`
      );
    }

    if (attempt === 0) {
      return compileLatex(
        normalizeLatexDocument(latexCode, resolvedTemplateId),
        1,
        resolvedTemplateId,
        context
      );
    }

    if (attempt === 1) {
      const body = extractRawLatexBody(latexCode);
      return compileLatex(
        `${template.preamble}
\\begin{document}
${sanitizeLatexBody(body, true)}
\\end{document}`,
        2,
        resolvedTemplateId,
        context
      );
    }

    if (attempt === 2) {
      const body = extractRawLatexBody(latexCode);
      return compileLatex(
        `${template.fallbackPreamble}
\\begin{document}
${stripFragileBodyCommands(body)}
\\end{document}`,
        3,
        resolvedTemplateId,
        context
      );
    }

    throw new Error(`LaTeXLite compilation failed: ${error}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export function pdfFilename(fullName: string): string {
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]}_${parts[parts.length - 1]}_resume.pdf`;
  }
  return `${parts[0] || "resume"}_resume.pdf`;
}
