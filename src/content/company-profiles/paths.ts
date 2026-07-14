import { companyEventCompanies } from '../company-events/entries.js';
import { companyProfileCanonicalAliases, companyProfiles } from './entries.js';
import type { CanonicalCompanyProfileIdentity, CompanyProfileEntry } from './types.js';

const profileByCompanyId = new Map(companyProfiles.map((profile) => [profile.companyId, profile]));
const profileBySlug = new Map(companyProfiles.map((profile) => [profile.slug, profile]));
const eventCompanyById = new Map(companyEventCompanies.map((company) => [company.id, company]));

export function canonicalCompanyProfileId(companyId: string) {
  return companyProfileCanonicalAliases[companyId] ?? companyId;
}

export function companyProfileByIdOrSlug(value?: string | null) {
  if (!value) return undefined;
  const canonicalId = canonicalCompanyProfileId(value);
  return profileByCompanyId.get(canonicalId) ?? profileBySlug.get(value);
}

export function companyProfileForTicker(ticker?: string | null) {
  if (!ticker) return undefined;
  const normalized = ticker.trim().toUpperCase();
  const identity = companyEventCompanies.find((company) => company.ticker.toUpperCase() === normalized);
  return identity ? profileByCompanyId.get(identity.id) : undefined;
}

export function companyProfilePath(profile: CompanyProfileEntry | string) {
  const resolved = typeof profile === 'string' ? companyProfileByIdOrSlug(profile) : profile;
  return resolved ? `/ko/companies/${encodeURIComponent(resolved.slug)}` : '/ko/companies';
}

export function companyProfilePathForCompanyId(companyId: string) {
  const profile = companyProfileByIdOrSlug(companyId);
  return profile ? companyProfilePath(profile) : undefined;
}

export function companyProfilePathForTicker(ticker?: string | null) {
  const profile = companyProfileForTicker(ticker);
  return profile ? companyProfilePath(profile) : undefined;
}

export function canonicalCompanyProfileIdentity(companyId: string): CanonicalCompanyProfileIdentity | undefined {
  const canonicalId = canonicalCompanyProfileId(companyId);
  const identity = eventCompanyById.get(canonicalId);
  return identity ? { ...identity } : undefined;
}
