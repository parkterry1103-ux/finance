import { investmentCase } from '../src/content/investment-thinking/cases/pilot-001.js';
import {
  investmentCaseStepForKey,
  investmentCaseSummaries,
  investmentHypotheses,
  investmentRules,
  nextInvestmentCaseStep,
  previousInvestmentCaseStep,
  validateInvestmentThinkingRegistry,
} from '../src/content/investment-thinking/index.js';

let checks = 0;
function check(condition: unknown, message: string) {
  checks += 1;
  if (!condition) throw new Error(`Investment Thinking validation failed: ${message}`);
}

check(validateInvestmentThinkingRegistry([investmentCase]).length === 0, 'registry must validate');
check(investmentRules.length === 5, 'Rulebook v0.1 must contain five rules');
check(investmentRules.every((rule) => rule.editable && rule.status === 'current'), 'rules must remain editable current principles');
check(investmentHypotheses.length === 1 && investmentHypotheses[0].id === 'KR-THEME-001', 'pilot hypothesis must exist');
check(investmentHypotheses[0].status === 'testing', 'hypothesis must be testing');
check(investmentHypotheses[0].scopeNote.includes('전체의 법칙이 아니라'), 'hypothesis must have a narrow scope note');
check(investmentCase.eventSourceStatus === 'editorial-input', 'event must keep its source boundary');
check(investmentCase.subjects.map((subject) => subject.name).join('|') === '제주반도체|어보브반도체|넥스트칩', 'pilot subject order must be stable');
check(investmentCase.subjects.every((subject) => subject.sourceIds.length > 0), 'each subject must have an official source');
check(investmentCase.falsificationSignals.length === 5, 'pilot must record five falsification signals');
check(investmentCase.hypothesisIds.includes('KR-THEME-001'), 'pilot must link the testing hypothesis');
check(investmentCase.ruleIds.includes('RULE-005'), 'pilot must link the falsification rule');
check(investmentCaseSummaries.length === 1 && investmentCaseSummaries[0].path === '/ko/lab/cases/pilot-001', 'home summary path must be canonical');
check(nextInvestmentCaseStep(0) === 1 && nextInvestmentCaseStep(1) === 2, 'next advances');
check(nextInvestmentCaseStep(2) === 2, 'next stops at the final screen');
check(previousInvestmentCaseStep(2) === 1 && previousInvestmentCaseStep(1) === 0, 'previous goes back');
check(previousInvestmentCaseStep(0) === 0, 'previous stops at the first screen');
check(investmentCaseStepForKey(0, 'ArrowRight') === 1, 'ArrowRight advances');
check(investmentCaseStepForKey(2, 'ArrowLeft') === 1, 'ArrowLeft goes back');
check(investmentCaseStepForKey(1, 'Home') === 0 && investmentCaseStepForKey(1, 'End') === 2, 'Home and End move to boundaries');
check(investmentCaseStepForKey(1, 'Enter') === 1, 'unrelated keys do not change screens');

console.log(`Investment Thinking Lab validation passed (${checks} checks, ${investmentRules.length} rules, ${investmentCase.subjects.length} subjects).`);
