export type CompanyJudgmentDisplayMode = 'current' | 'preparing' | 'legacy' | 'unavailable';

export function resolveCompanyJudgmentDisplayMode({
  isRegistered,
  hasCurrentJudgment,
  hasLegacyDissection,
}: {
  isRegistered: boolean;
  hasCurrentJudgment: boolean;
  hasLegacyDissection: boolean;
}): CompanyJudgmentDisplayMode {
  if (isRegistered) return hasCurrentJudgment ? 'current' : 'preparing';
  return hasLegacyDissection ? 'legacy' : 'unavailable';
}
