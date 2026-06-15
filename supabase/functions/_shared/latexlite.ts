import {
  HARSHIBAR_FALLBACK_PREAMBLE,
  HARSHIBAR_LATEX_PREAMBLE,
} from "./resumeLatexTemplate.ts";

function sanitizeLatexBody(body: string): string {
  return body
    .replace(/\\fa[A-Za-z]+\*?/g, "")
    .replace(/\\hspace\{3pt\}/g, "\\hspace{1pt}")
    .replace(/(\$|\$)\s*\|\s*\$[\s\n]*(\$|\$)\s*\|\s*/g, " $|$ ");
}

function stripFragileBodyCommands(body: string): string {
  return sanitizeLatexBody(body).replace(/\\myuline\{([^}]*)\}/g, "$1");
}

export function buildLatexDocument(
  latexBody: string,
  fullName: string,
  email: string,
  phone: string,
  simplified = false
): string {
  const escapedName = escapeLatex(fullName);
  const escapedEmail = escapeLatex(email);
  const escapedPhone = escapeLatex(phone);
  const preamble = simplified ? HARSHIBAR_FALLBACK_PREAMBLE : HARSHIBAR_LATEX_PREAMBLE;

  return `${preamble}
\\begin{document}
\\begin{center}
  \\textbf{\\Large ${escapedName}} \\\\ \\vspace{2pt}
  \\small \\texttt{${escapedPhone}} \\hspace{1pt} $|$
  \\hspace{1pt} \\texttt{${escapedEmail}}
\\end{center}
\\vspace{-2pt}
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

export function normalizeLatexDocument(latexCode: string): string {
  let latex = latexCode.trim();

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
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{fontawesome5\}\s*\n?/g, "");
  latex = latex.replace(/\\fa[A-Za-z]+\*?/g, "");

  const rawBody = extractDocumentBody(latex);
  const body = rawBody ? sanitizeLatexBody(rawBody) : null;
  if (body) {
    return `${HARSHIBAR_LATEX_PREAMBLE}
\\begin{document}
${body}
\\end{document}`;
  }

  return latex;
}

export async function compileLatex(
  latexCode: string,
  attempt = 0
): Promise<Uint8Array> {
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

    if (attempt === 0) {
      return compileLatex(normalizeLatexDocument(latexCode), 1);
    }

    if (attempt === 1) {
      const body = extractDocumentBody(latexCode);
      if (body) {
        return compileLatex(
          `${HARSHIBAR_LATEX_PREAMBLE}
\\begin{document}
${sanitizeLatexBody(body)}
\\end{document}`,
          2
        );
      }
    }

    if (attempt === 2) {
      const body = extractDocumentBody(latexCode);
      if (body) {
        return compileLatex(
          `${HARSHIBAR_FALLBACK_PREAMBLE}
\\begin{document}
${stripFragileBodyCommands(body)}
\\end{document}`,
          3
        );
      }
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
