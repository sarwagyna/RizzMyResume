/** Template 001 — Palatino professional layout (resume_template_2.docx), LaTeXLite / XeLaTeX. */
const PAGELLA_FONT = `\\setmainfont{texgyrepagella-regular.otf}[
  BoldFont=texgyrepagella-bold.otf,
  ItalicFont=texgyrepagella-italic.otf,
  BoldItalicFont=texgyrepagella-bolditalic.otf
]`;

const PAGE_GEOMETRY = `\\usepackage[
  top=0.65in,
  bottom=0.65in,
  left=0.60in,
  right=0.60in
]{geometry}`;

const RESUME_MACROS = `\\definecolor{sectionbar}{RGB}{31, 73, 125}
\\definecolor{accentgray}{RGB}{80, 80, 80}
\\newcommand{\\jobentry}[3]{%
  \\noindent
  \\textbf{#1}\\hfill{\\small\\textcolor{accentgray}{#2}}\\par
  {\\small\\textcolor{accentgray}{#3}}\\par\\vspace{2pt}}
\\newcommand{\\eduentry}[4]{%
  \\noindent
  \\textbf{#1}\\hfill{\\small\\textcolor{accentgray}{#2}}\\par
  {\\small\\textcolor{accentgray}{#3}}\\par
  {\\small #4}\\par\\vspace{2pt}}
\\newcommand{\\resumeItem}[1]{\\item #1}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}}`;

const SHARED_PREAMBLE_BODY = `${PAGE_GEOMETRY}
\\usepackage{fontspec}
${PAGELLA_FONT}
\\usepackage{microtype}
\\usepackage{array}
\\usepackage{tabularx}
\\usepackage[parfill]{parskip}
\\usepackage{enumitem}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}

\\hypersetup{
  colorlinks = true,
  urlcolor   = sectionbar,
  linkcolor  = sectionbar
}

\\pagestyle{empty}
\\pagenumbering{gobble}

\\titleformat{\\section}
  {\\normalsize\\bfseries\\centering}
  {}
  {0pt}
  {}
  [{\\color{sectionbar}\\titlerule[0.6pt]}]

\\titlespacing*{\\section}{0pt}{8pt}{4pt}

\\setlist[itemize]{
  leftmargin = 1.4em,
  itemsep    = 1pt,
  parsep     = 0pt,
  topsep     = 3pt,
  label      = \\textbullet
}

${RESUME_MACROS}`;

export const TEMPLATE_001_LATEX_PREAMBLE = `\\documentclass[10pt, letterpaper]{article}

${SHARED_PREAMBLE_BODY}`;

export const TEMPLATE_001_FALLBACK_PREAMBLE = `\\documentclass[10pt, letterpaper]{article}

${PAGE_GEOMETRY}
\\usepackage{fontspec}
${PAGELLA_FONT}
\\usepackage{array}
\\usepackage{tabularx}
\\usepackage{enumitem}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}
\\pagenumbering{gobble}
\\definecolor{sectionbar}{RGB}{31, 73, 125}
\\definecolor{accentgray}{RGB}{80, 80, 80}
\\newcommand{\\jobentry}[3]{%
  \\noindent\\textbf{#1}\\hfill{\\small #2}\\par{\\small #3}\\par}
\\newcommand{\\eduentry}[4]{%
  \\noindent\\textbf{#1}\\hfill{\\small #2}\\par{\\small #3}\\par{\\small #4}\\par}
\\newcommand{\\resumeItem}[1]{\\item #1}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}}`;
