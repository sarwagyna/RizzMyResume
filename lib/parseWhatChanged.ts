export interface WhatChangedItem {
  label?: string;
  description: string;
}

export function parseWhatChanged(content: string): WhatChangedItem[] {
  const normalized = content.trim();
  if (!normalized) return [];

  const chunks = normalized
    .split(/(?=\d+\.\s+)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length <= 1 && !/^\d+\.\s/.test(normalized)) {
    return [{ description: normalized }];
  }

  return chunks.map((chunk) => {
    const body = chunk.replace(/^\d+\.\s*/, "").trim();
    const labeled = body.match(/^(?:\*\*)?(.+?)(?:\*\*)?\s*:\s*([\s\S]+)$/);

    if (labeled) {
      return {
        label: labeled[1].trim(),
        description: labeled[2].trim(),
      };
    }

    return { description: body };
  });
}
