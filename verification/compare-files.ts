/**
 * Compare two pi digit files digit-for-digit, tolerant of common reference
 * formats: optional "3." prefix, line wrapping, digit grouping, and
 * per-row position labels of the form "<digits> : <position>".
 *
 *   npx tsx verification/compare-files.ts <fileA> <fileB> [--drop-tail N]
 *
 * --drop-tail N ignores the last N digits of the shorter stream (useful when
 * one file is a truncated/partial download that may end mid-row).
 */
import { readFileSync } from "node:fs";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const dropIdx = process.argv.indexOf("--drop-tail");
const dropTail = dropIdx >= 0 ? Number.parseInt(process.argv[dropIdx + 1] ?? "0", 10) : 0;
const [fileA, fileB] = args;
if (!fileA || !fileB) {
  console.error("usage: compare-files.ts <fileA> <fileB> [--drop-tail N]");
  process.exit(1);
}

function extractDigits(path: string): string {
  let raw = readFileSync(path, "ascii");
  const start = raw.indexOf("3.");
  if (start >= 0) raw = raw.slice(start + 2);
  const parts: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    // Strip per-row position labels ("... : 1500") before digit filtering.
    const body = line.includes(":") ? line.slice(0, line.indexOf(":")) : line;
    const d = body.replace(/\D/g, "");
    if (d) parts.push(d);
  }
  return parts.join("");
}

const a = extractDigits(fileA);
const b = extractDigits(fileB);
console.log(`${fileA}: ${a.length.toLocaleString()} digits`);
console.log(`${fileB}: ${b.length.toLocaleString()} digits`);

const n = Math.min(a.length, b.length) - Math.max(0, dropTail);
for (let i = 0; i < n; i++) {
  if (a[i] !== b[i]) {
    console.log(`MISMATCH at digit ${i + 1}: A=${a[i]} B=${b[i]}`);
    console.log(`A ctx: ${a.slice(Math.max(0, i - 20), i + 20)}`);
    console.log(`B ctx: ${b.slice(Math.max(0, i - 20), i + 20)}`);
    process.exit(1);
  }
}
console.log(`EXACT MATCH on all ${n.toLocaleString()} compared digits`);
