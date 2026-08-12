import type { InvestmentCaseStep } from './types.js';

export const investmentCaseStepCount = 3;

export function nextInvestmentCaseStep(step: InvestmentCaseStep): InvestmentCaseStep {
  return Math.min(step + 1, investmentCaseStepCount - 1) as InvestmentCaseStep;
}

export function previousInvestmentCaseStep(step: InvestmentCaseStep): InvestmentCaseStep {
  return Math.max(step - 1, 0) as InvestmentCaseStep;
}

export function investmentCaseStepForKey(step: InvestmentCaseStep, key: string): InvestmentCaseStep {
  if (key === 'ArrowRight' || key === 'PageDown') return nextInvestmentCaseStep(step);
  if (key === 'ArrowLeft' || key === 'PageUp') return previousInvestmentCaseStep(step);
  if (key === 'Home') return 0;
  if (key === 'End') return 2;
  return step;
}
