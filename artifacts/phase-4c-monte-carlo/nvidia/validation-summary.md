# nvidia Monte Carlo validation

- Engine: `4a-fcff-dcf/1.0.0`
- Seed: `2026071701`
- Attempts: **50,000**
- Valid / rejected: **50,000 / 0**
- Rejection rate: **0.000%**
- 25k → 50k P10 relative difference: **0.026%**
- 25k → 50k P50 relative difference: **0.001%**
- 25k → 50k P90 relative difference: **0.029%**
- Convergence result: **PASS**
- Top drivers at 25k: futureRevenueCagr, wacc, normalizedOperatingMargin
- Top drivers at 50k: futureRevenueCagr, wacc, normalizedOperatingMargin
- Terminal Value share P50 / P90: **66.01% / 67.80%**
- Samples above 80% Terminal Value share: **0.00%**

The stored CSV is a deterministic 500-row verification sample. The complete 50,000-attempt run is reproduced from the committed seed, distributions and generator.
