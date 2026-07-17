import resultJson from './generated/nvidia.json' with { type: 'json' };
import type { MonteCarloValuationResult } from './types.js';

export default resultJson as unknown as MonteCarloValuationResult;
