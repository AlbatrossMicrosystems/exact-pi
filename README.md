# exact-pi

Exact finite decimal prefixes of π to arbitrary length — 1,000,000 digits in
under 30 seconds, 10,000,000 in under 40 minutes, single-threaded — with
**zero runtime dependencies**, built on native `bigint`, and cross-verified
by three mathematically independent methods discovered across three
different centuries.

Companion code for the preprint *"Exact Ten-Million-Digit Decimal Prefixes
of π in Dependency-Free TypeScript: Binary-Splitting Chudnovsky Evaluation
with Triple Independent Cross-Verification"* (Ghosh & Sarkar, 2026).

## Why "the exact value" means "an exact prefix"

π is **irrational** (Lambert, 1761) and **transcendental** (Lindemann, 1882).
Its decimal expansion neither terminates nor repeats, so *"the last decimal
of π" does not exist* — not as a limitation of hardware or algorithms, but as
a theorem. What *is* computable is the **exact truncated prefix**: for any
requested `n`, every one of the `n` digits returned is a true digit of π.

## Quick start

```bash
npm install          # dev tooling only (tsx, typescript) — zero runtime deps
npm test             # 12 tests, all engines cross-checked
npm run demo         # 10,000 digits + verification certificate
npm run demo -- 100000
npm run demo -- 50 --print
npm run bench        # timing table up to 10^6 digits
```

## API

```ts
import {
  computePiDigits,   // (digits, engine?) => "3.14159..." exact truncated prefix
  piHexDigits,       // (count) => hex digits of pi after the point
  verifyPiDigits,    // (digits) => cross-engine + BBP verification report
  certifyPiDigits,   // (digits) => reproducible SHA-256 correctness certificate
} from "exact-pi";

computePiDigits(100);
// "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679"
```

## How it works

### Primary engine — Chudnovsky with binary splitting

The Chudnovsky brothers' series (1988) delivers ~14.18 decimal digits per
term and underpins every π world record since 1989:

```
1/π = 12 · Σ  (−1)^k (6k)! (13591409 + 545140134k)
      k≥0    ───────────────────────────────────────
             (3k)! (k!)³ · 640320^(3k + 3/2)
```

Naive term-by-term summation costs O(n²) bigint work. This package instead
evaluates the series by **binary splitting**: the partial sum over `[a, b)`
is represented by three integers `P, Q, T` combined recursively from
half-ranges, so every multiplication happens between balanced, similar-sized
integers — the same strategy as y-cruncher and GMP. Combined with a
Newton-iteration integer square root for √10005, the whole computation stays
in exact integer arithmetic; floating point never touches a digit.

### Truncation, not rounding — with an ambiguity-tested guard band

Reference digit tables are *truncated*. Rounding is a trap: at 100 places π
continues `...170679|8…`, so half-up rounding corrupts the final digit to
`...170680`, which is **not a digit of π** (the same trap exists at 50
places: `...937510|58…`).

`computePiDigits` computes with a guard band and truncates. If the guard band
ever evaluates to all `0`s or all `9`s — the only case in which the floor at
the boundary could be ambiguous — the guard doubles and the computation
reruns. The returned prefix is therefore unconditionally exact, not
probabilistically exact.

### Independent verification — three formulas, three centuries

| Engine | Year | Mathematics | Role |
|---|---|---|---|
| Chudnovsky + binary splitting | 1988 | Ramanujan-type hypergeometric series | primary computation |
| Machin fixed-point | 1706 | π/4 = 4·arctan(1/5) − arctan(1/239), Taylor series | full digit-for-digit decimal cross-check |
| Bailey–Borwein–Plouffe | 1995 | base-16 digit extraction at arbitrary position | spot-checks hex digits *without* computing predecessors |

`certifyPiDigits(n)` emits a compact JSON certificate — digit count,
head/tail, SHA-256 of the full prefix, verification results — so anyone can
reproduce and confirm a computation without shipping megabytes of digits.

## Performance

Measured on Node 24, Intel Core Ultra 7 155H, single thread (`npm run bench`):

| Digits | Time |
|---|---|
| 1,000 | 0.2 ms |
| 10,000 | 5.6 ms |
| 100,000 | 218 ms |
| 1,000,000 | 26.7 s |
| 10,000,000 | 2,316 s (38.6 min) |

The practical ceiling of this code on stock V8 is the engine's 2³⁰-bit
`BigInt` cap (~3×10⁸ decimal digits), not the algorithm.

## External validation

- All **1,000,000** digits match Wikimedia Commons' published million-digit
  reference (E. Andersson).
- All **10,000,000** digits match an independent published 10M-digit
  reference file; the first 7.45M digits additionally match an unrelated
  2005 computation (QPI, Chudnovsky-based) that predates JavaScript `BigInt`
  entirely.
- Deep BBP hex probes at positions 1,000,000 / 4,000,000 / 8,300,000 after
  the hexadecimal point agree with the decimal-derived expansion.

Full methodology, hashes, and reproduction commands: see
[`verification/REPORT.md`](verification/REPORT.md).

## Citing

See [`CITATION.cff`](CITATION.cff). A DOI-stamped archival snapshot of each
release is deposited on Zenodo.

## License

MIT — see [`LICENSE`](LICENSE).
