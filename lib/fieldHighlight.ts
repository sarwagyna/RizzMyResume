import { isFieldMissing, MISSING_LABEL } from "@/lib/missingFields";

export interface FieldHighlight {
  highlight: boolean;
  message?: string;
}

export function getFieldHighlight(
  path: string,
  missingPaths: string[],
  atsHints: Record<string, string> = {}
): FieldHighlight {
  if (isFieldMissing(path, missingPaths)) {
    return { highlight: true, message: MISSING_LABEL };
  }

  const atsMessage = atsHints[path];
  if (atsMessage) {
    return { highlight: true, message: atsMessage };
  }

  return { highlight: false };
}
