from pathlib import Path

src = Path(r"c:\Users\SARWAN NANDH\Desktop\Rizzmyresume\prompts\v5_4_prompt.txt")
lines = src.read_text(encoding="utf-8", errors="replace").splitlines()
body = "\n".join(lines[5:351])
footer = """

---

*V5.4 | Resume Decoded | Sarwagyna Private Limited*

---

## API OUTPUT FORMAT (MANDATORY)

Return ONLY valid JSON. No markdown fences. No text outside JSON.

{
  "latex_code": "Complete ready-to-compile LaTeX document per LATEX OUTPUT SPECIFICATION",
  "what_changed": "WHAT I CHANGED AND WHY - numbered list covering bullets, projects, skills, ATS, defensibility, missing info",
  "ats_score": 0,
  "ats_tips": ["tip1", "tip2"],
  "jd_keywords_matched": ["keyword"],
  "jd_keywords_missed": ["keyword"],
  "input_flags": ["INPUT QUALITY WARNING if weak, else empty array"]
}

Run SELF-CHECK internally before responding. Do not output the checklist.
Student raw input, target role, and JD are provided in the user message.
"""
out = body + footer
for dest in [
    Path(r"c:\Users\SARWAN NANDH\Desktop\Rizzmyresume\prompts\v5_4_prompt.txt"),
    Path(r"c:\Users\SARWAN NANDH\Desktop\Rizzmyresume\supabase\functions\_shared\v5_4_prompt.txt"),
]:
    dest.write_text(out, encoding="utf-8")
print("Wrote", len(out), "chars")

import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sync_prompt_ts import sync_from_txt

sync_from_txt(
    Path(r"c:\Users\SARWAN NANDH\Desktop\Rizzmyresume\supabase\functions\_shared\v5_4_prompt.txt"),
    Path(r"c:\Users\SARWAN NANDH\Desktop\Rizzmyresume\supabase\functions\_shared\v5_4_prompt.ts"),
)
