# Verification report — exact-pi v1.0.0

Record of the correctness evidence for `computePiDigits` at the 10⁶- and
10⁷-digit scales, as reported in the accompanying preprint. All hashes are
SHA-256. Hardware: Intel Core Ultra 7 155H (single thread), 32 GB RAM,
Node.js v24.13.0, Windows 11. Date: 2026-07-15.

## 1. Internal cross-verification (three independent formulas)

- **Machin (1706) ≡ Chudnovsky (1988)**: exact digit-for-digit agreement at
  every tested length (automated suite: 1,000 and 1,200 digits; manual runs:
  5,000 digits).
- **BBP (1995) hex spot-checks**: 4-digit windows extracted at hexadecimal
  positions via `verification/bbp-extract.ts`, compared against the exact
  decimal-derived windows via `verification/hexcheck.ts`:

  | hex position (0-indexed) | BBP  | decimal-derived | result |
  |---:|---|---|---|
  | 1,000,000 | `6c65` | `6c65` | match |
  | 4,000,000 | `c3ac` | `c3ac` | match |
  | 8,300,000 | `1014` | `1014` | match |

  The window at 10⁶ is consistent with the extraction `26C65E52CB4593…`
  published for the millionth hexadecimal place in the original BBP paper
  (indexing conventions differ by one).

## 2. External reference comparisons

| Scale | Reference | Result |
|---|---|---|
| 10⁶ digits | Wikimedia Commons, *Million digits of pi* (E. Andersson) — PDF text-extracted, 20,000 × 50-digit lines | **all 1,000,000 digits identical** |
| 10⁷ digits | pilookup.com 10,000,000-digit file | **all 10,000,000 digits identical** (files byte-identical) |
| 10⁷ prefix | archive.org, *Pi to 100,000,000 places* (QPI v2.90, S. Pagliarulo, 2005) — first ~7.46M digits retrieved | **all 7,456,673 compared digits identical** |

The QPI reference (2005) predates JavaScript `BigInt` entirely, discharging
the concern that all three internal engines share the same big-integer
primitive.

## 3. Reproducibility anchors

| Artifact | SHA-256 |
|---|---|
| `computePiDigits(1_000_000)` output (`3.` + 10⁶ digits) | `dd382ef6a0c1e8d920fb72f482d74826251ab97709520bc24f913cd8eb5fc839` |
| Wikimedia reference PDF as retrieved | `87038f2021ce8e2d39b6803dbed04c769975df53d0fca91d315c4e1cfbb758cb` |
| `computePiDigits(10_000_000)` output (`3.` + 10⁷ digits) | `46059c61a4de67d6c916fa958168789da324a03ee8a85c30e9ca292c3712eb25` |

Wall times: 10⁶ digits — 26.7 s / 26.1 s (two runs); 10⁷ digits — 2,316.2 s.

## 4. Reproduce it yourself

```bash
npm install
npm test                                            # 12/12
npx tsx verification/generate.ts 1000000 verification/out/pi_1m.txt
npx tsx verification/hexcheck.ts verification/out/pi_1m.txt 0 100000 800000
# download any independent reference file, then:
npx tsx verification/compare-files.ts verification/out/pi_1m.txt <reference file>
```

The SHA-256 printed by `generate.ts` for 1,000,000 digits must equal the
anchor above; any deviation indicates a corrupted build or environment.
