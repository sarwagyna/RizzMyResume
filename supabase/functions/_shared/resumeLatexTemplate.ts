/** Harshibar-style resume template — Times New Roman, one-page, LaTeXLite / XeLaTeX. */
const TIMES_FONT = `\\setmainfont{texgyretermes-regular.otf}[
  BoldFont=texgyretermes-bold.otf,
  ItalicFont=texgyretermes-italic.otf,
  BoldItalicFont=texgyretermes-bolditalic.otf
]`;

const ONE_PAGE_GEOMETRY = `\\usepackage[
  top=0.45in,
  bottom=0.45in,
  left=0.5in,
  right=0.5in
]{geometry}`;

const RESUME_MACROS = `\\newlength{\\resumeDateColWidth}
\\setlength{\\resumeDateColWidth}{1.25in}
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubheading}[4]{%
  \\vspace{2pt}\\item
  \\noindent
  \\begin{minipage}[t]{\\dimexpr\\textwidth-\\resumeDateColWidth-4pt\\relax}
    \\raggedright\\textbf{#1}\\\\[2pt]
    \\textit{#3}
  \\end{minipage}%
  \\hfill
  \\begin{minipage}[t]{\\resumeDateColWidth}
    \\raggedleft{\\color{dark-grey}\\small #2}\\\\[2pt]
    \\raggedleft{\\color{dark-grey}\\small #4}
  \\end{minipage}\\par\\vspace{2pt}}
\\newcommand{\\resumeProjectHeading}[2]{%
  \\item
  \\noindent
  \\begin{minipage}[t]{\\dimexpr\\textwidth-\\resumeDateColWidth-4pt\\relax}
    \\raggedright #1
  \\end{minipage}%
  \\hfill
  \\begin{minipage}[t]{\\resumeDateColWidth}
    \\raggedleft{\\color{dark-grey}\\small #2}
  \\end{minipage}\\par\\vspace{2pt}}
\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}, topsep=0pt, itemsep=0pt, parsep=0pt]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[topsep=2pt, itemsep=1pt, parsep=0pt, partopsep=0pt, leftmargin=0.15in]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{2pt}}`;

export const HARSHIBAR_LATEX_PREAMBLE = `\\documentclass[letterpaper,11pt]{article}

${ONE_PAGE_GEOMETRY}
\\usepackage{fontspec}
${TIMES_FONT}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\setlist{nosep, topsep=0pt, itemsep=0pt, parsep=0pt, partopsep=0pt}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{contour}
\\usepackage[normalem]{ulem}

\\definecolor{light-grey}{gray}{0.83}
\\definecolor{dark-grey}{gray}{0.3}
\\definecolor{text-grey}{gray}{.08}

\\renewcommand{\\ULdepth}{1.8pt}
\\contourlength{0.8pt}
\\newcommand{\\myuline}[1]{%
  \\uline{\\phantom{#1}}%
  \\llap{\\contour{white}{#1}}%
}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\pagenumbering{gobble}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\parskip}{0pt}
\\setlength{\\parindent}{0pt}
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{%
  \\bfseries \\vspace{2pt} \\raggedright \\large%
}{}{0em}{}[\\color{light-grey} {\\titlerule[2pt]} \\vspace{-2pt}]

${RESUME_MACROS}
\\color{text-grey}`;

export const HARSHIBAR_FALLBACK_PREAMBLE = `\\documentclass[letterpaper,11pt]{article}

${ONE_PAGE_GEOMETRY}
\\usepackage{fontspec}
${TIMES_FONT}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\setlist{nosep, topsep=0pt, itemsep=0pt, parsep=0pt}
\\usepackage[hidelinks]{hyperref}
\\usepackage{tabularx}
\\definecolor{dark-grey}{gray}{0.3}
\\definecolor{text-grey}{gray}{.08}
\\pagestyle{empty}
\\pagenumbering{gobble}
\\raggedright
\\setlength{\\parskip}{0pt}
\\setlength{\\parindent}{0pt}
\\newcommand{\\myuline}[1]{#1}
${RESUME_MACROS}
\\color{text-grey}`;
