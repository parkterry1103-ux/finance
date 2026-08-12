import { sourceRegistry } from '../sources/registry.js';
import { investmentHypotheses, investmentRules } from './rulebook.js';
import type { InvestmentCase } from './types.js';

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const forbiddenPublicLanguage = /\b(?:BUY|HOLD|SELL)\b|매수|매도|목표주가|투자\s*점수|별점|확실한\s*수혜|무조건/iu;
const demeaningLanguage = /개미|멍청|바보|무지|한탕|도박꾼/iu;

function duplicateValues(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function stringsFromCase(entry: InvestmentCase) {
  return [
    entry.title,
    entry.eventSummary,
    entry.whyICared,
    entry.firstThought,
    entry.familiarityNote,
    entry.possibleBias,
    entry.hypothesis,
    entry.optionalLens ?? '',
    ...entry.tags,
    ...entry.impactFlow,
    ...entry.counterFlow,
    ...entry.falsificationSignals,
    ...entry.subjects.flatMap((subject) => [subject.name, subject.currentView, subject.reason, subject.caution]),
  ];
}

export function validateInvestmentThinkingCase(entry: InvestmentCase) {
  const errors: string[] = [];
  const ruleIds = new Set(investmentRules.map((rule) => rule.id));
  const hypothesisIds = new Set(investmentHypotheses.map((hypothesis) => hypothesis.id));

  if (!/^CASE-\d{3}$/.test(entry.id)) errors.push(`invalid case id: ${entry.id}`);
  if (!/^[a-z0-9-]+$/.test(entry.slug)) errors.push(`invalid case slug: ${entry.slug}`);
  if (!entry.title.trim() || !entry.eventSummary.trim() || !entry.hypothesis.trim()) errors.push(`case core copy missing: ${entry.id}`);
  if (!isoDate.test(entry.eventDate) || !isoDate.test(entry.publishedAt)) errors.push(`case date invalid: ${entry.id}`);
  if (entry.eventSourceStatus !== 'editorial-input') errors.push(`case event source boundary missing: ${entry.id}`);
  if (entry.tags.length < 1 || entry.tags.some((tag) => !tag.trim())) errors.push(`case tags missing: ${entry.id}`);
  if (entry.impactFlow.length < 3 || entry.counterFlow.length < 1) errors.push(`case flow is incomplete: ${entry.id}`);
  if (entry.subjects.length !== 3) errors.push(`pilot subject count must be 3: ${entry.id}`);
  if (entry.falsificationSignals.length < 3) errors.push(`case falsification signals missing: ${entry.id}`);
  if (duplicateValues(entry.ruleIds).length || duplicateValues(entry.hypothesisIds).length) errors.push(`case has duplicate rule or hypothesis refs: ${entry.id}`);

  entry.ruleIds.forEach((id) => { if (!ruleIds.has(id)) errors.push(`case rule ref invalid: ${entry.id} / ${id}`); });
  entry.hypothesisIds.forEach((id) => { if (!hypothesisIds.has(id)) errors.push(`case hypothesis ref invalid: ${entry.id} / ${id}`); });
  entry.subjects.forEach((subject, index) => {
    if (subject.rank !== index + 1) errors.push(`case subject rank invalid: ${entry.id} / ${subject.name}`);
    if (!['high', 'medium', 'low'].includes(subject.familiarity)) errors.push(`case familiarity invalid: ${entry.id} / ${subject.name}`);
    if (!subject.reason.trim() || !subject.caution.trim()) errors.push(`case subject explanation missing: ${entry.id} / ${subject.name}`);
    subject.sourceIds.forEach((sourceId) => { if (!sourceRegistry[sourceId]) errors.push(`case subject source invalid: ${entry.id} / ${sourceId}`); });
  });
  entry.sources.forEach((ref) => {
    if (!sourceRegistry[ref.sourceId]) errors.push(`case source invalid: ${entry.id} / ${ref.sourceId}`);
    if (!ref.claimScope.trim()) errors.push(`case source scope missing: ${entry.id} / ${ref.sourceId}`);
  });

  const publicCopy = stringsFromCase(entry).join('\n');
  if (forbiddenPublicLanguage.test(publicCopy)) errors.push(`case forbidden recommendation language: ${entry.id}`);
  if (demeaningLanguage.test(publicCopy)) errors.push(`case demeaning public language: ${entry.id}`);
  return errors;
}

export function validateInvestmentThinkingRegistry(entries: InvestmentCase[]) {
  const errors: string[] = [];
  if (investmentRules.length !== 5) errors.push(`rulebook v0.1 must contain 5 rules: ${investmentRules.length}`);
  duplicateValues(investmentRules.map((rule) => rule.id)).forEach((id) => errors.push(`duplicate rule id: ${id}`));
  duplicateValues(investmentHypotheses.map((hypothesis) => hypothesis.id)).forEach((id) => errors.push(`duplicate hypothesis id: ${id}`));
  duplicateValues(entries.map((entry) => entry.id)).forEach((id) => errors.push(`duplicate case id: ${id}`));
  duplicateValues(entries.map((entry) => entry.slug)).forEach((slug) => errors.push(`duplicate case slug: ${slug}`));
  investmentRules.forEach((rule) => {
    if (rule.version !== '0.1' || rule.status !== 'current' || rule.editable !== true) errors.push(`rule is not editable v0.1 current principle: ${rule.id}`);
    if (!rule.principle.trim()) errors.push(`rule copy missing: ${rule.id}`);
  });
  investmentHypotheses.forEach((hypothesis) => {
    if (hypothesis.status !== 'testing' || !hypothesis.scopeNote.includes('전체의 법칙이 아니라')) errors.push(`hypothesis scope/status invalid: ${hypothesis.id}`);
  });
  entries.forEach((entry) => errors.push(...validateInvestmentThinkingCase(entry)));
  return errors;
}
