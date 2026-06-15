export const LANGUAGE_LEVELS = [
  { value: "Native", label: "Native" },
  { value: "C2", label: "Proficient (C2)" },
  { value: "C1", label: "Advanced (C1)" },
  { value: "B2", label: "Upper Intermediate (B2)" },
  { value: "B1", label: "Intermediate (B1)" },
  { value: "A2", label: "Elementary (A2)" },
  { value: "A1", label: "Beginner (A1)" },
] as const;

export function languageLevelLabel(code: string): string {
  if (code === "Native") return "Native";
  const match = LANGUAGE_LEVELS.find((level) => level.value === code);
  return match?.label ?? code;
}
