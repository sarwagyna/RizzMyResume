/** Template 002 — piped header, datedline rows, tabular skills (variables-style layout). */
const BODY_FONT = `\\setmainfont{texgyrepagella-regular.otf}[
  BoldFont=texgyrepagella-bold.otf,
  ItalicFont=texgyrepagella-italic.otf,
  BoldItalicFont=texgyrepagella-bolditalic.otf
]`;

const PAGE_GEOMETRY = `\\usepackage[
  left=0.75in,
  right=0.75in,
  top=0.65in,
  bottom=0.65in
]{geometry}`;

const RESUME_MACROS = `\\newcommand{\\datedline}[2]{%
  \\noindent #1 \\hfill #2 \\par}
\\newcommand{\\resumeItem}[1]{\\item #1}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=1.4em, itemsep=2pt, topsep=4pt, parsep=0pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}}
\\newcommand{\\resumeProjectListStart}{\\begin{itemize}[leftmargin=1.4em, itemsep=4pt, topsep=4pt, parsep=0pt]}
\\newcommand{\\resumeProjectListEnd}{\\end{itemize}}`;

const SHARED_BODY = `${PAGE_GEOMETRY}
\\usepackage{fontspec}
${BODY_FONT}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage[protrusion=true, expansion=false]{microtype}
\\usepackage[parfill]{parskip}
\\usepackage[hidelinks]{hyperref}

\\hypersetup{colorlinks=false, hidelinks}
\\pagestyle{empty}
\\pagenumbering{gobble}

\\titleformat{\\section}
  {\\bfseries\\large}
  {}
  {0em}
  {}
  [\\vspace{-4pt}\\rule{\\linewidth}{0.6pt}]
\\titlespacing*{\\section}{0pt}{10pt}{4pt}

${RESUME_MACROS}`;

export const TEMPLATE_002_LATEX_PREAMBLE = `\\documentclass[11pt, letterpaper]{article}

${SHARED_BODY}`;

export const TEMPLATE_002_FALLBACK_PREAMBLE = `\\documentclass[11pt, letterpaper]{article}

${PAGE_GEOMETRY}
\\usepackage{fontspec}
${BODY_FONT}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}
\\pagenumbering{gobble}
\\newcommand{\\datedline}[2]{\\noindent #1 \\hfill #2 \\par}
\\newcommand{\\resumeItem}[1]{\\item #1}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}}
\\newcommand{\\resumeProjectListStart}{\\begin{itemize}}
\\newcommand{\\resumeProjectListEnd}{\\end{itemize}}`;
