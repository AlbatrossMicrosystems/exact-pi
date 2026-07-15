/**
 * Extract 4 hexadecimal digits of pi at arbitrary 0-indexed positions after
 * the hexadecimal point, via the BBP formula — independent of the decimal
 * engines and of any previously computed digits.
 *
 *   npx tsx verification/bbp-extract.ts <pos> [<pos> ...]
 *   e.g. npx tsx verification/bbp-extract.ts 0 1000000 4000000 8300000
 */
import { bbpHexDigits } from "../src/bbp.js";

const positions = process.argv.slice(2).map((a) => Number.parseInt(a, 10));
if (positions.length === 0 || positions.some((p) => !Number.isInteger(p) || p < 0)) {
  console.error("usage: bbp-extract.ts <pos> [<pos> ...]");
  process.exit(1);
}

const results: Record<string, string> = {};
for (const pos of positions) {
  const t = performance.now();
  results[String(pos)] = bbpHexDigits(pos, 4);
  console.log(`BBP @ ${pos}: ${results[String(pos)]} (${((performance.now() - t) / 1000).toFixed(1)}s)`);
}
console.log(JSON.stringify(results));
