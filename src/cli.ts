#!/usr/bin/env node
/**
 * CLI for exact-pi.
 *
 *   npx exact-pi                 # 10,000 digits + verification
 *   npx exact-pi 100000          # any digit count
 *   npx exact-pi 1000 --print    # also print all digits
 *   npx exact-pi --help          # full usage
 */

import { certifyPiDigits, computePiDigits, MAX_DIGITS } from "./index.js";

const HELP = `exact-pi — exact truncated decimal prefixes of pi

Every digit emitted is a true digit of pi: computed by the Chudnovsky series
with binary splitting over native BigInt (zero runtime dependencies),
truncated (never rounded) under an ambiguity-tested guard band, and
cross-verified by Machin's formula (1706) and BBP hex extraction (1995).
Verified against independent published references to 10,000,000 digits.

Usage:
  exact-pi [digits] [--print]

Arguments:
  digits        decimal places to compute (1..${MAX_DIGITS.toLocaleString("en-US")}; default 10,000)

Options:
  --print       print every digit instead of head/tail excerpts
  --help, -h    show this help
  --version, -v show version

Examples:
  exact-pi 100                 # the canonical 100-digit reference value
  exact-pi 1000000             # a million exact digits (~30 s)
  exact-pi 50 --print          # 3.14159265358979323846...

Output includes a verification block (Chudnovsky vs Machin, BBP hex
spot-checks) and a reproducible SHA-256 certificate of the computed prefix.

Library use:  import { computePiDigits } from "exact-pi"
Docs & math:  https://github.com/AlbatrossMicrosystems/exact-pi`;

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}
if (args.includes("--version") || args.includes("-v")) {
  const { createRequire } = await import("node:module");
  const pkg = createRequire(import.meta.url)("../package.json") as { version: string };
  console.log(`exact-pi ${pkg.version}`);
  process.exit(0);
}

const flags = args.filter((a) => a.startsWith("-"));
const unknown = flags.filter((a) => a !== "--print");
if (unknown.length > 0) {
  console.error(`unknown option: ${unknown[0]}\n\n${HELP}`);
  process.exit(1);
}

const digitsArg = args.find((a) => !a.startsWith("-"));
const digits = digitsArg ? Number.parseInt(digitsArg, 10) : 10_000;
const printAll = args.includes("--print");

if (!Number.isInteger(digits) || digits < 1 || digits > MAX_DIGITS) {
  console.error(`digits must be an integer in 1..${MAX_DIGITS.toLocaleString("en-US")}\n\n${HELP}`);
  process.exit(1);
}

console.log(`exact-pi — exact truncated prefix of pi to ${digits.toLocaleString()} decimal places\n`);

const t0 = performance.now();
const value = computePiDigits(digits);
const computeMs = performance.now() - t0;
console.log(`compute (Chudnovsky + binary splitting): ${computeMs.toFixed(1)} ms`);

if (printAll) {
  console.log(`\n${value}\n`);
} else {
  console.log(`head: ${value.slice(0, 52)}...`);
  console.log(`tail: ...${value.slice(-40)}`);
}

// Independent verification is O(n^2)-ish for Machin, so cap the certified
// portion for very large runs; the certificate states its own digit count.
const certDigits = Math.min(digits, 5_000);
const t1 = performance.now();
const cert = certifyPiDigits(certDigits);
const verifyMs = performance.now() - t1;

console.log(`\nverification (${certDigits.toLocaleString()} digits, ${verifyMs.toFixed(1)} ms):`);
console.log(`  Chudnovsky (1988) === Machin (1706): ${cert.verification.crossEngineMatch ? "MATCH" : "MISMATCH"}`);
for (const check of cert.verification.hexSpotChecks) {
  console.log(
    `  BBP hex @ position ${String(check.position).padStart(6)}: bbp=${check.bbp} decimal-derived=${check.decimalDerived} ${check.match ? "MATCH" : "MISMATCH"}`,
  );
}
console.log(`  all checks passed: ${cert.verification.allPassed}`);
console.log(`\ncertificate (recompute computePiDigits(${certDigits}) and hash to reproduce):`);
console.log(JSON.stringify(cert, null, 2));

process.exit(cert.verification.allPassed ? 0 : 2);
