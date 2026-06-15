export const TEMPLATE_001_LATEX_SPEC = `## ═══ LATEX OUTPUT SPECIFICATION ═══

Always output a complete \\\\begin{document}...\\\\end{document} body using
Template 001 (resume_template_2.docx / Palatino professional). EXACTLY ONE PAGE.

Font: Palatino 10pt (texgyrepagella). Section titles: centred bold with blue rule via \\\\color{sectionbar} — never rgb(...) syntax.

Macros (preamble injected): \\\\jobentry, \\\\eduentry, \\\\resumeItem, \\\\resumeItemListStart/End

HEADER is injected by compiler — do NOT repeat. Never emit \\\\begin{center} name blocks or glue font commands to the name (wrong: \\\\LARGESarwan; correct: {\\\\LARGE\\\\bfseries Sarwan Name}).

Use input.summary, input.skills, input.experience, input.education, input.languageEntries,
input.projects, input.certifications exactly.

SECTION ORDER: Summary → Skills → Experience → Education and Training → Languages → Certifications

SUMMARY:
\\\\section{Summary}
[input.summary verbatim — plain paragraph, no bullet list]

SKILLS — split input.skills into two balanced comma-separated columns (plain text, no itemize):
\\\\section{Skills}
\\\\begin{tabularx}{\\\\linewidth}{@{} X X @{}}
  skill1, skill2, skill3 &
  skill4, skill5, skill6
\\\\end{tabularx}
If fewer than 4 skills, put all in the left column and leave the right cell empty — never use empty \\\\begin{itemize}.

EXPERIENCE — \\\\jobentry{Role Title}{MM/YYYY -- Present or end}{Company, Location} then bullets from input.experience[].bullets:
\\\\section{Experience}
\\\\jobentry{Role}{Date range}{Company, location from input.experience[].location}
\\\\resumeItemListStart
  \\\\resumeItem{\\\\textbf{key phrase} rest of bullet — use input bullets exactly}
\\\\resumeItemListEnd

Bold the leading impact phrase inside each bullet (matches DOCX).

EDUCATION:
\\\\section{Education and Training}
\\\\eduentry{Degree: Field}{MM/YYYY from endMonth+endYear}{Institution, city}{CGPA: X.XX if provided}
\\\\vspace{6pt}
\\\\textbf{Academic Projects}
\\\\resumeItemListStart
  \\\\resumeItem{\\\\textbf{Project Name} -- description from input.projects}
\\\\resumeItemListEnd

LANGUAGES — 4-column tabularx, pairs per row from input.languageEntries:
\\\\section{Languages}
\\\\begin{tabularx}{\\\\linewidth}{@{} X X X X @{}}
  \\\\textbf{English} & C1 Advanced & \\\\textbf{Telugu} & Native \\\\\\\\[2pt]
  \\\\textbf{Tamil} & B2 Upper-Inter & \\\\textbf{Hindi} & B1 Intermediate \\\\
\\\\end{tabularx}

Use language, level, and label fields from input.languageEntries.

CERTIFICATIONS:
\\\\section{Certifications}
\\\\resumeItemListStart
  \\\\resumeItem{Name -- Issuer from input.certifications}
\\\\resumeItemListEnd

RULES:
- Section headings: ONLY \\\\section{Title} — never \\\\sectiontitle, \\\\sectionheader, \\\\resumesection, or custom macros
- Every { must have a matching } — never add stray closing braces after sentences or \\\\resumeItem{...} bullets (wrong: .}} at end of a bullet); never put a lone \\\\} on its own line
- Escape special chars in user text: % as \\\\%, & as \\\\& inside bullets and summary
- Colors: use \\\\color{sectionbar} or \\\\textcolor{accentgray} — never \\\\color{rgb(...)}
- Centred \\\\section{} titles only — never ALL CAPS in \\\\section argument
- No LinkedIn/GitHub in header
- No fontawesome or icons
- Never emit empty \\\\begin{itemize} or \\\\resumeItemListStart/End — omit the section or bullets instead
- Must compile on LaTeXLite with zero errors
- EXACTLY ONE PAGE`;

export const TEMPLATE_003_LATEX_SPEC = TEMPLATE_001_LATEX_SPEC;

export const TEMPLATE_002_LATEX_SPEC = `## ═══ LATEX OUTPUT SPECIFICATION ═══

Always output a complete \\\\begin{document}...\\\\end{document} body using
Template 002 (variables-style professional layout). EXACTLY ONE PAGE.

Font: 11pt serif (texgyrepagella). Section headings: bold \\\\large with full-width rule below.

Macros (preamble injected): \\\\datedline, \\\\resumeItem, \\\\resumeItemListStart/End,
\\\\resumeProjectListStart/End

HEADER is injected by compiler — piped City | Phone | mailto email. No LinkedIn/GitHub. Never glue font commands to the name (wrong: \\\\LARGESarwan).

Use input fields exactly. SECTION ORDER:
Summary → Skills → Experience → Education and Training → Academic Projects → Languages → Certifications

SUMMARY:
\\\\section{Summary}
[input.summary verbatim]

SKILLS — two-column tabularx, up to 8 skills from input.skills (pad empty cells if fewer):
\\\\section{Skills}
\\\\begin{tabularx}{\\\\linewidth}{X X}
  skill1 & skill5 \\\\\\\\[2pt]
  skill2 & skill6 \\\\\\\\[2pt]
  skill3 & skill7 \\\\\\\\[2pt]
  skill4 & skill8 \\\\
\\\\end{tabularx}

EXPERIENCE — \\\\datedline per job, then bullets with \\\\textbf{key phrase} lead:
\\\\section{Experience}
\\\\datedline{\\\\textbf{Role Title from input.experience[].role}}{Start to End dates}
\\\\datedline{\\\\textit{Company Name}}{City from input.experience[].location}
\\\\resumeItemListStart
  \\\\resumeItem{\\\\textbf{Key phrase} — rest of bullet from input.experience[].bullets}
\\\\resumeItemListEnd
Repeat block for each experience entry.

EDUCATION:
\\\\section{Education and Training}
\\\\datedline{Degree: Field from input.education[]}{\\\\textbf{MM/YYYY from endMonth+endYear}}
\\\\datedline{\\\\textit{Institution Name}}{City from input.education[].city}
\\\\noindent CGPA\\\\,--\\\\,X.XX if provided

ACADEMIC PROJECTS — separate section from input.projects:
\\\\section{Academic Projects}
\\\\resumeProjectListStart
  \\\\resumeItem{\\\\textbf{Project Name} -- description from input.projects}
\\\\resumeProjectListEnd

LANGUAGES — 2×2 tabularx from input.languageEntries (up to 4):
\\\\section{Languages}
\\\\begin{tabularx}{\\\\linewidth}{X X}
  Language1:\\\\quad \\\\textit{level label} & Language2:\\\\quad \\\\textit{level label} \\\\\\\\[4pt]
  Language3:\\\\quad \\\\textit{level label} & Language4:\\\\quad \\\\textit{level label} \\\\
\\\\end{tabularx}

CERTIFICATIONS:
\\\\section{Certifications}
\\\\resumeItemListStart
  \\\\resumeItem{Name -- Issuer from input.certifications}
\\\\resumeItemListEnd

RULES:
- Section headings: ONLY \\\\section{Title} — never \\\\sectiontitle, \\\\sectionheader, \\\\resumesection, or custom macros
- Every { must have a matching } — never add stray closing braces after sentences or \\\\resumeItem{...} bullets (wrong: .}} at end of a bullet); never put a lone \\\\} on its own line
- Escape special chars in user text: % as \\\\%, & as \\\\& inside bullets and summary
- Colors: use \\\\color{sectionbar} or \\\\textcolor{accentgray} — never \\\\color{rgb(...)}
- Title Case \\\\section{} names (Summary, Skills, etc.)
- Use \\\\datedline for experience/education date rows — never left-column minipage layout
- \\\\datedline already includes \\\\noindent — never write \\\\noindent inside \\\\datedline{...}; always leave a space after \\\\noindent when used elsewhere (wrong: \\\\noindentLeadFlow)
- Academic Projects is its own section — not nested under Education
- Never emit empty \\\\begin{itemize} or \\\\resumeItemListStart/End — omit the section or bullets instead
- Must compile on LaTeXLite with zero errors
- EXACTLY ONE PAGE`;
