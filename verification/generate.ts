/**
 * Generate an exact truncated prefix of pi to a file, with timing and hash.
 *
 *   npx tsx verification/generate.ts <digits> <outfile>
 *   e.g. npx tsx verification/generate.ts 10000000 verification/out/pi_10m.txt
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import { computePiDigits } from "../src/index.js";

const digits = Number.parseInt(process.argv[2] ?? "", 10);
const outfile = process.argv[3];
if (!Number.isInteger(digits) || digits < 1 || !outfile) {
  console.error("usage: generate.ts <digits> <outfile>");
  process.exit(1);
}

console.log(`computing ${digits.toLocaleString()} digits...`);
const t = performance.now();
const v = computePiDigits(digits);
const secs = (performance.now() - t) / 1000;
console.log(`computed in ${secs.toFixed(1)}s, string length ${v.length}`);
console.log(`tail: ...${v.slice(-20)}`);
console.log(`sha256("3." + digits): ${createHash("sha256").update(v).digest("hex")}`);
mkdirSync(dirname(outfile), { recursive: true });
writeFileSync(outfile, v);
console.log(`written ${outfile}`);
