"""Generate v5_4_prompt.ts from v5_4_prompt.txt for Supabase edge bundling."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHARED = ROOT / "supabase" / "functions" / "_shared"


def txt_to_ts(text: str) -> str:
    escaped = text.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return (
        "// Generated from v5_4_prompt.txt — sync via scripts/fix_prompt.py.\n"
        "export const SYSTEM_PROMPT = `" + escaped + "`;\n"
    )


def sync_from_txt(txt_path: Path, ts_path: Path) -> None:
    text = txt_path.read_text(encoding="utf-8")
    ts_path.write_text(txt_to_ts(text), encoding="utf-8")
    print(f"Wrote {ts_path} ({len(text)} chars)")


if __name__ == "__main__":
    sync_from_txt(SHARED / "v5_4_prompt.txt", SHARED / "v5_4_prompt.ts")
