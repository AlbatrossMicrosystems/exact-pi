/**
 * Cross-radix check: derive 4-hex-digit windows at given positions exactly
 * from a decimal digits file, and compare each with a live BBP extraction.
 *
 * For 0-indexed hex position d, with the file's digits D of length p
 * representing pi - 3 = D / 10^p:
 *
 *   window(d) = floor((pi - 3) * 16^(d+4)) mod 16^4
 *             = (BigInt(D) * 16^(d+4)) / 10^p mod 65536      (exact)
 *
 * A file of p decimal digits supports ~ p / log10(16) trustworthy hex
 * digits; keep positions comfortably below that bound.
 *
 *   npx tsx verification/hexcheck.ts <digitsfile> <pos> [<pos> ...]
 */
import { readFileSync } from "node:fs";
import { bbpHexDigits } from "../src/bbp.js";

const [file, ...posArgs] = process.argv.slice(2);
const positions = posArgs.map((a) => Number.parseInt(a, 10));
if (!file || positions.length === 0 || positions.some((p) => !Number.isInteger(p) || p < 0)) {
  console.error("usage: hexcheck.ts <digitsfile> <pos> [<pos> ...]");
  process.exit(1);
}

const raw = readFileSync(file, "ascii").trim();
if (!raw.startsWith("3.")) throw new Error("digits file must start with '3.'");
const digits = raw.slice(2);
const p = digits.length;
const maxHex = Math.floor(p / 1.2041199826559248) - 16; // p / log10(16), minus guard
console.log(`loaded ${p.toLocaleString()} decimal digits (~${maxHex.toLocaleString()} trustworthy hex digits)`);

const frac = BigInt(digits);
const scale = 10n ** BigInt(p);

let allMatch = true;
for (const d of positions) {
  if (d + 4 > maxHex) throw new RangeError(`position ${d} exceeds trustworthy hex range`);
  const win = ((frac * 16n ** BigInt(d + 4)) / scale) % 65536n;
  const derived = win.toString(16).padStart(4, "0");
  const bbp = bbpHexDigits(d, 4);
  const match = derived === bbp;
  allMatch &&= match;
  console.log(`hex @ ${String(d).padStart(10)}: decimal-derived=${derived} bbp=${bbp} ${match ? "MATCH" : "MISMATCH"}`);
}
console.log(allMatch ? "ALL HEX CHECKS PASSED" : "FAILURE");
process.exit(allMatch ? 0 : 1);
