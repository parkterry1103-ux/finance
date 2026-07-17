import resultJson from './generated/meta.json' with { type: 'json' };
import type { MonteCarloValuationResult } from './types.js';

export default resultJson as unknown as MonteCarloValuationResult;
