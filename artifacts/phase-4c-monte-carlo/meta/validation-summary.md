# meta Monte Carlo validation

- Engine: `4a-fcff-dcf/1.0.0`
- Seed: `2026071702`
- Attempts: **50,000**
- Valid / rejected: **50,000 / 0**
- Rejection rate: **0.000%**
- 25k → 50k P10 relative difference: **0.119%**
- 25k → 50k P50 relative difference: **0.063%**
- 25k → 50k P90 relative difference: **0.042%**
- Convergence result: **PASS**
- Top drivers at 25k: futureRevenueCagr, wacc, normalizedOperatingMargin
- Top drivers at 50k: futureRevenueCagr, wacc, normalizedOperatingMargin
- Terminal Value share P50 / P90: **76.94% / 78.77%**
- Samples above 80% Terminal Value share: **1.06%**

The stored CSV is a deterministic 500-row verification sample. The complete 50,000-attempt run is reproduced from the committed seed, distributions and generator.
