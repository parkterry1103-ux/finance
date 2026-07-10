export type CompanyLogoInput = {
  companyId?: string | null;
  companyName?: string | null;
  ticker?: string | null;
  localAssetPath?: string | null;
};

export type ResolvedCompanyLogo =
  | { kind: 'local-image'; src: string; alt: string; key: string }
  | { kind: 'monogram'; text: string; ariaLabel: string; key: string };

export const placeholderCompanyTickers = new Set(['WATCH', 'PRIVATE', 'N/A', '-', '비상장', 'UNKNOWN']);
export const allowedCompanyLogoExtensions = new Set(['.svg', '.png', '.webp', '.jpg', '.jpeg']);
export const localCompanyLogoRegistry: Record<string, string> = {};
const canonicalTickerMonograms: Record<string, string> = {
  GOOGL: 'AL',
};

export const companyLogoMonogramSamples: Array<CompanyLogoInput & { expected: string }> = [
  { companyName: 'Meta', expected: 'ME' },
  { companyName: 'Micron', expected: 'MI' },
  { companyName: 'NVIDIA', expected: 'NV' },
  { companyName: 'Super Micro Computer', expected: 'SM' },
  { companyName: 'Dell Technologies', expected: 'DT' },
  { companyName: 'Taylor Morrison', expected: 'TM' },
  { companyName: 'Google / Alphabet', ticker: 'GOOGL', expected: 'AL' },
  { companyName: 'SK하이닉스', expected: 'SK' },
  { companyName: '에스폴리텍', expected: '에스' },
  { companyName: '금호건설', expected: '금호' },
  { companyName: '현대건설', expected: '현대' },
  { companyName: '동양파일', expected: '동양' },
  { ticker: 'WATCH', expected: '?' },
  { ticker: 'PRIVATE', expected: '?' },
  { ticker: 'N/A', expected: '?' },
  { ticker: '-', expected: '?' },
];

function cleanValue(value?: string | null) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeTicker(value?: string | null) {
  return cleanValue(value).toUpperCase();
}

export function isPlaceholderCompanyTicker(value?: string | null) {
  return placeholderCompanyTickers.has(normalizeTicker(value));
}

function localLogoExtension(path: string) {
  const pathname = path.split(/[?#]/)[0] ?? path;
  const match = pathname.match(/\.[a-z0-9]+$/i);
  return match?.[0]?.toLowerCase() ?? '';
}

export function isAllowedLocalCompanyLogoPath(value?: string | null) {
  const path = cleanValue(value);
  if (!path) return false;
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  if (/^(?:https?:)?\/\//i.test(path)) return false;
  if (/^data:image/i.test(path)) return false;
  if (/favicon|brandfetch|google\.com\/s2\/favicons|logo\.dev|img\.logo/i.test(path)) return false;
  return allowedCompanyLogoExtensions.has(localLogoExtension(path));
}

export function getCompanyLogoRegistryEntries() {
  return Object.entries(localCompanyLogoRegistry).map(([companyId, src]) => ({ companyId, src }));
}

function registryLogoPath(companyId?: string | null) {
  const key = cleanValue(companyId).toLowerCase();
  if (!key) return undefined;
  return localCompanyLogoRegistry[key] ?? localCompanyLogoRegistry[cleanValue(companyId)];
}

function normalizeCompanyNameForMonogram(value?: string | null) {
  return cleanValue(value)
    .replace(/^\(주\)\s*/u, '')
    .replace(/^㈜\s*/u, '')
    .replace(/^주식회사\s*/u, '')
    .replace(/\s*\(주\)$/u, '')
    .replace(/\s*㈜$/u, '')
    .replace(/\s*주식회사$/u, '')
    .replace(/[.,]/g, ' ')
    .replace(/\b(?:incorporated|inc|corp|corporation|company|co|ltd|limited|plc|llc|holdings?|group|sa|ag)\b\.?$/iu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function latinPrefixBeforeHangul(value: string) {
  const match = value.match(/^([A-Za-z]{2,})(?=[가-힣])/u);
  return match?.[1]?.slice(0, 2).toUpperCase();
}

function hangulMonogram(value: string) {
  const match = value.match(/[가-힣]{1,2}/u);
  return match?.[0];
}

function allCapsSingleWordMonogram(value: string) {
  if (value === 'NVIDIA') return 'NV';
  return undefined;
}

export function buildCompanyLogoMonogram(value?: string | null) {
  const source = normalizeCompanyNameForMonogram(value);
  if (!source || isPlaceholderCompanyTicker(source)) return '';

  const latinPrefix = latinPrefixBeforeHangul(source);
  if (latinPrefix) return latinPrefix;

  const firstHangul = hangulMonogram(source);
  if (firstHangul) return firstHangul;

  const words = source.match(/[A-Za-z0-9]+/g) ?? [];
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  const compact = words[0] ?? source.replace(/[^A-Za-z0-9]/g, '');
  if (!compact) return '';

  const allCaps = allCapsSingleWordMonogram(compact);
  if (allCaps) return allCaps;

  return compact.slice(0, 2).toUpperCase();
}

export function resolveCompanyLogoMonogramText(input: CompanyLogoInput) {
  const ticker = normalizeTicker(input.ticker);
  const canonicalTickerMonogram = ticker ? canonicalTickerMonograms[ticker] : undefined;
  if (canonicalTickerMonogram) return canonicalTickerMonogram;

  const companyMonogram = buildCompanyLogoMonogram(input.companyName);
  if (companyMonogram) return companyMonogram;

  if (isPlaceholderCompanyTicker(ticker)) return '?';
  return buildCompanyLogoMonogram(ticker) || '?';
}

function fallbackKey(input: CompanyLogoInput) {
  return cleanValue(input.companyId) || normalizeTicker(input.ticker) || cleanValue(input.companyName) || 'unknown-company';
}

function logoAriaLabel(input: CompanyLogoInput) {
  const name = cleanValue(input.companyName);
  if (name && !isPlaceholderCompanyTicker(name)) return `${name} 로고`;
  const ticker = normalizeTicker(input.ticker);
  if (ticker && !isPlaceholderCompanyTicker(ticker)) return `${ticker} 로고`;
  return '기업 로고';
}

export function resolveCompanyLogo(input: CompanyLogoInput): ResolvedCompanyLogo {
  const registryPath = registryLogoPath(input.companyId);
  const localPath = isAllowedLocalCompanyLogoPath(registryPath)
    ? registryPath
    : isAllowedLocalCompanyLogoPath(input.localAssetPath)
      ? cleanValue(input.localAssetPath)
      : '';

  if (localPath) {
    return {
      kind: 'local-image',
      src: localPath,
      alt: logoAriaLabel(input),
      key: fallbackKey(input),
    };
  }

  const monogram = resolveCompanyLogoMonogramText(input);
  if (monogram) {
    return {
      kind: 'monogram',
      text: monogram,
      ariaLabel: logoAriaLabel(input),
      key: fallbackKey(input),
    };
  }

  return {
    kind: 'monogram',
    text: '?',
    ariaLabel: logoAriaLabel(input),
    key: fallbackKey(input),
  };
}

export function companyLogoToneClass(input: CompanyLogoInput) {
  const key = fallbackKey(input);
  let hash = 0;
  Array.from(key).forEach((character) => {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  });
  return `company-logo-tone-${hash % 6}`;
}
