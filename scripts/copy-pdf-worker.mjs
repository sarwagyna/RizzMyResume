import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const target = join(root, "public/pdf.worker.min.mjs");

if (existsSync(source)) {
  copyFileSync(source, target);
} else {
  console.warn("[copy-pdf-worker] pdfjs-dist worker not found — run npm install first.");
}
