const TRUSTED_DOMAINS = [
  'reuters.com',
  'apnews.com',
  'businesswire.com',
  'prnewswire.com',
  'yna.co.kr',
  'news.einfomax.co.kr',
  'hankyung.com',
  'mk.co.kr',
  'sedaily.com',
  'etnews.com',
  'thelec.kr',
  'zdnet.co.kr',
  'bloter.net',
  'businesspost.co.kr',
  'chosun.com',
  'joongang.co.kr',
  'donga.com',
  'dart.fss.or.kr',
  'kind.krx.co.kr',
  'fss.or.kr',
  'fsc.go.kr',
  'bok.or.kr',
  'motie.go.kr',
  'koreaherald.com',
  'koreatimes.co.kr',
  'sec.gov',
  'investor.gov',
  'federalreserve.gov',
  'fdic.gov',
  'content.naic.org',
  'naic.org',
  'insurancejournal.com',
  'bankingdive.com',
  'utilitydive.com',
  'healthcaredive.com',
  'biopharmadive.com',
  'defensenews.com',
  'aviationweek.com',
  'semiengineering.com',
  'datacenterdynamics.com',
  'cnbc.com',
  'marketwatch.com',
  'barrons.com',
  'ft.com',
  'wsj.com',
  'bloomberg.com',
];

const SECTOR_KEYWORDS = {
  'kr-semiconductors': ['삼성전자', 'SK하이닉스', 'DB하이텍', 'HBM', '파운드리', '반도체', '후공정'],
  'kr-mobility': ['현대차', '기아', '현대모비스', '전기차', '전장', '미래차', '자동차'],
  'kr-battery-materials': ['LG에너지솔루션', '삼성SDI', '포스코퓨처엠', '배터리', '양극재', '전해액'],
  'kr-display': ['LG디스플레이', '삼성디스플레이', 'LX세미콘', 'OLED', '디스플레이', '패널'],
  'kr-ship-defense': ['HD현대중공업', '한화오션', 'LIG넥스원', '조선', '방산', 'LNG선'],
  'kr-bio-healthcare': ['삼성바이오로직스', '셀트리온', 'SK바이오팜', '바이오', 'CDMO', '의료기기'],
  'kr-ai-datacenter': ['네이버', '카카오', '삼성SDS', 'AI', '데이터센터', '클라우드', 'PCB'],
  'kr-robotics-automation': ['두산로보틱스', '레인보우로보틱스', '로보티즈', '로봇', '자동화', '감속기'],
  'kr-cosmetics-consumer': ['아모레퍼시픽', 'LG생활건강', '실리콘투', '화장품', 'K뷰티', 'ODM'],

'kr-insurance-financials': ["보험", "손해보험", "생명보험", "재보험", "금융지주", "GA", "insurance"],
  'kr-banking-fintech': ["은행", "핀테크", "간편결제", "인터넷은행", "신용정보", "payment", "fintech"],
  'kr-energy-utilities': ["전력망", "유틸리티", "원전", "SMR", "재생에너지", "전력기기", "grid"],
  'us-semiconductors': ["NVIDIA", "AMD", "Intel", "semiconductor", "AI chip", "foundry", "chip equipment"],
  'us-ai-cloud-datacenter': ["Microsoft", "Amazon", "Google", "AI data center", "cloud", "server", "networking"],
  'us-ev-mobility': ["Tesla", "GM", "Rivian", "EV", "ADAS", "charging", "automotive"],
  'us-energy-grid': ["grid", "utilities", "renewable energy", "power equipment", "transmission", "storage"],
  'us-insurance-financials': ["insurance", "reinsurance", "insurtech", "brokerage", "property casualty", "life insurance"],
  'us-banking-fintech': ["JPMorgan", "Visa", "fintech", "payments", "banking", "digital lending", "card network"],
  'us-healthcare-biopharma': ["healthcare", "biopharma", "CRO", "CDMO", "diagnostics", "medical device"],
  'us-aerospace-defense': ["aerospace", "defense", "space", "drone", "Boeing", "Lockheed", "RTX"],
};

const ANCHOR_KEYWORDS = {
  'kr-semiconductors-samsung': ['삼성전자', 'Samsung Electronics'],
  'kr-semiconductors-sk-hynix': ['SK하이닉스', 'SK hynix'],
  'kr-semiconductors-db-hitek': ['DB하이텍', 'DB HiTek'],
  'kr-mobility-hyundai': ['현대차', 'Hyundai Motor'],
  'kr-mobility-kia': ['기아', 'Kia'],
  'kr-mobility-mobis': ['현대모비스', 'Hyundai Mobis'],
  'kr-battery-materials-lg-energy': ['LG에너지솔루션', 'LG Energy Solution'],
  'kr-battery-materials-samsung-sdi': ['삼성SDI', 'Samsung SDI'],
  'kr-battery-materials-posco-futurem': ['포스코퓨처엠', 'POSCO Future M'],
  'kr-display-lg-display': ['LG디스플레이', 'LG Display'],
  'kr-display-samsung-display': ['삼성디스플레이', 'Samsung Display'],
  'kr-display-lx-semicon': ['LX세미콘', 'LX Semicon'],
  'kr-ship-defense-hd-hhi': ['HD현대중공업', '현대중공업'],
  'kr-ship-defense-hanwha-ocean': ['한화오션', 'Hanwha Ocean'],
  'kr-ship-defense-lig-nex1': ['LIG넥스원', 'LIG Nex1'],
  'kr-bio-healthcare-samsung-biologics': ['삼성바이오로직스', 'Samsung Biologics'],
  'kr-bio-healthcare-celltrion': ['셀트리온', 'Celltrion'],
  'kr-bio-healthcare-sk-biopharm': ['SK바이오팜', 'SK Biopharmaceuticals'],
  'kr-ai-datacenter-naver': ['네이버', 'NAVER'],
  'kr-ai-datacenter-kakao': ['카카오', 'Kakao'],
  'kr-ai-datacenter-samsung-sds': ['삼성SDS', 'Samsung SDS'],
  'kr-robotics-automation-doosan-robotics': ['두산로보틱스', 'Doosan Robotics'],
  'kr-robotics-automation-rainbow': ['레인보우로보틱스', 'Rainbow Robotics'],
  'kr-robotics-automation-robotis': ['로보티즈', 'ROBOTIS'],
  'kr-cosmetics-consumer-amorepacific': ['아모레퍼시픽', 'Amorepacific'],
  'kr-cosmetics-consumer-lg-hnh': ['LG생활건강', 'LG H&H'],
  'kr-cosmetics-consumer-silicontwo': ['실리콘투', 'Silicon2'],

'kr-insurance-financials-samsung-life': ["삼성생명", "Samsung Life", "보험"],
  'kr-insurance-financials-db-insurance': ["DB손해보험", "DB Insurance", "손해보험"],
  'kr-insurance-financials-korean-re': ["코리안리", "Korean Re", "재보험"],
  'kr-banking-fintech-kb': ["KB금융", "KB Financial", "은행"],
  'kr-banking-fintech-shinhan': ["신한지주", "Shinhan Financial", "은행"],
  'kr-banking-fintech-kakaobank': ["카카오뱅크", "KakaoBank", "인터넷은행"],
  'kr-energy-utilities-kepco': ["한국전력", "KEPCO", "전력망"],
  'kr-energy-utilities-kogas': ["한국가스공사", "KOGAS", "LNG"],
  'kr-energy-utilities-doosan-enerbility': ["두산에너빌리티", "Doosan Enerbility", "SMR", "원전"],
  'us-semiconductors-nvidia': ["NVIDIA", "NVDA", "AI chip"],
  'us-semiconductors-amd': ["AMD", "Advanced Micro Devices", "AI chip"],
  'us-semiconductors-intel': ["Intel", "INTC", "foundry"],
  'us-ai-cloud-datacenter-microsoft': ["Microsoft", "Azure", "AI data center"],
  'us-ai-cloud-datacenter-amazon': ["Amazon", "AWS", "data center"],
  'us-ai-cloud-datacenter-alphabet': ["Alphabet", "Google Cloud", "AI"],
  'us-ev-mobility-tesla': ["Tesla", "TSLA", "EV"],
  'us-ev-mobility-gm': ["General Motors", "GM", "EV"],
  'us-ev-mobility-rivian': ["Rivian", "RIVN", "EV"],
  'us-energy-grid-nextera': ["NextEra Energy", "NEE", "renewable energy"],
  'us-energy-grid-ge-vernova': ["GE Vernova", "GEV", "grid"],
  'us-energy-grid-eaton': ["Eaton", "ETN", "power management"],
  'us-insurance-financials-berkshire': ["Berkshire Hathaway", "GEICO", "insurance"],
  'us-insurance-financials-progressive': ["Progressive", "PGR", "auto insurance"],
  'us-insurance-financials-chubb': ["Chubb", "CB", "commercial insurance"],
  'us-banking-fintech-jpmorgan': ["JPMorgan", "JPM", "banking"],
  'us-banking-fintech-visa': ["Visa", "payments", "card network"],
  'us-banking-fintech-block': ["Block Inc", "Square", "Cash App"],
  'us-healthcare-biopharma-unitedhealth': ["UnitedHealth", "Optum", "health insurance"],
  'us-healthcare-biopharma-lilly': ["Eli Lilly", "LLY", "obesity drug"],
  'us-healthcare-biopharma-pfizer': ["Pfizer", "PFE", "biopharma"],
  'us-aerospace-defense-boeing': ["Boeing", "BA", "aerospace"],
  'us-aerospace-defense-lockheed': ["Lockheed Martin", "LMT", "defense"],
  'us-aerospace-defense-rtx': ["RTX", "Pratt Whitney", "Raytheon"],
};

const UPSTREAM_TIMEOUT_MS = 3500;

function normalizeDomain(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .replace(/^www\./, '')
    .trim();
}

function domainFromUrl(url) {
  try {
    return normalizeDomain(new URL(url).hostname);
  } catch {
    return '';
  }
}

function isTrustedDomain(domain) {
  const normalized = normalizeDomain(domain);
  return TRUSTED_DOMAINS.some((trusted) => normalized === trusted || normalized.endsWith(`.${trusted}`));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildQuery(sector, anchor, company) {
  const companyKeywords = company ? [String(company)] : [];
  const keywords = unique([...companyKeywords, ...(ANCHOR_KEYWORDS[anchor] || []), ...(SECTOR_KEYWORDS[sector] || [])]).slice(0, 8);
  const quoted = keywords.map((keyword) => `"${keyword.replace(/"/g, '')}"`);
  return quoted.length ? `(${quoted.join(' OR ')})` : '"supply chain"';
}

function buildSimpleNewsQuery(sector, anchor, company) {
  const anchorKeywords = ANCHOR_KEYWORDS[anchor] || [];
  const sectorKeywords = SECTOR_KEYWORDS[sector] || [];
  const companyKeywords = company ? [String(company)] : [];
  const keywords = unique([...companyKeywords, ...anchorKeywords.slice(0, 2), ...sectorKeywords.slice(0, 3)]);
  return keywords.length ? keywords.map((keyword) => `"${keyword.replace(/"/g, '')}"`).join(' OR ') : '"supply chain"';
}

function errorMessage(error) {
  if (!(error instanceof Error)) return String(error || 'unknown error');
  const cause = error.cause;
  const causeParts = [];
  if (cause && typeof cause === 'object') {
    if ('code' in cause && cause.code) causeParts.push(String(cause.code));
    if ('message' in cause && cause.message) causeParts.push(String(cause.message));
  }
  return causeParts.length ? `${error.message}: ${causeParts.join(' / ')}` : error.message;
}

async function fetchText(url, timeoutMs = UPSTREAM_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json, application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'user-agent': 'sme-supply-chain-intelligence/0.1',
      },
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function toGdeltDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function decodeXml(value) {
  if (!value) return '';
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

function tagValue(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return decodeXml(match?.[1] || '');
}

function tagAttr(block, tagName, attrName) {
  const match = block.match(new RegExp(`<${tagName}\\b[^>]*\\s${attrName}=["']([^"']+)["'][^>]*>`, 'i'));
  return decodeXml(match?.[1] || '');
}

function normalizeArticle(article) {
  const domain = normalizeDomain(article.domain) || domainFromUrl(article.url) || domainFromUrl(article.sourceUrl);
  return {
    title: article.title || 'Untitled',
    url: article.url,
    domain,
    source: article.source || domain,
    seendate: article.seendate || '',
    language: article.language,
    country: article.country,
    provider: article.provider,
  };
}

async function fetchGdeltArticles(query, protocol = 'https:') {
  const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
  url.protocol = protocol;
  url.searchParams.set('query', query);
  url.searchParams.set('mode', 'artlist');
  url.searchParams.set('format', 'json');
  url.searchParams.set('sort', 'datedesc');
  url.searchParams.set('maxrecords', '75');
  url.searchParams.set('timespan', '1d');

  const responseText = await fetchText(url);
  let payload;
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error(responseText.slice(0, 160) || 'GDELT returned non-JSON response');
  }

  const articles = Array.isArray(payload.articles) ? payload.articles : [];
  return articles.map((article) =>
    normalizeArticle({
      title: article.title,
      url: article.url,
      domain: article.domain,
      source: article.source,
      seendate: article.seendate || article.seendate2,
      language: article.language || article.sourceLanguage,
      country: article.sourceCountry,
      provider: 'GDELT DOC 2.0',
    }),
  );
}

async function fetchGoogleNewsArticles(sector, anchor, country, company) {
  const simpleQuery = buildSimpleNewsQuery(sector, anchor, company);
  const url = new URL('https://news.google.com/rss/search');
  url.searchParams.set('q', `${simpleQuery} when:1d`);
  url.searchParams.set('hl', country === 'KR' ? 'ko' : 'en-US');
  url.searchParams.set('gl', country === 'KR' ? 'KR' : 'US');
  url.searchParams.set('ceid', country === 'KR' ? 'KR:ko' : 'US:en');

  const xml = await fetchText(url, 3000);
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return itemBlocks.map((block) => {
    const sourceUrl = tagAttr(block, 'source', 'url');
    const source = tagValue(block, 'source');
    return normalizeArticle({
      title: tagValue(block, 'title'),
      url: tagValue(block, 'link'),
      domain: domainFromUrl(sourceUrl) || normalizeDomain(source),
      source,
      sourceUrl,
      seendate: toGdeltDate(tagValue(block, 'pubDate')),
      language: country === 'KR' ? 'ko' : 'en',
      country,
      provider: 'Google News RSS fallback',
    });
  });
}

function dedupeAndTrust(articles) {
  const seen = new Set();
  return articles
    .filter((article) => article.url && isTrustedDomain(article.domain))
    .filter((article) => {
      const key = article.url || `${article.title}:${article.domain}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

export default async function handler(req, res) {
  const { country = 'KR', sector = 'kr-semiconductors', anchor = '', company = '' } = req.query || {};
  const normalizedCountry = String(country).toUpperCase();
  const normalizedSector = String(sector);
  const normalizedAnchor = String(anchor);
  const normalizedCompany = String(company).trim();
  const query = buildQuery(normalizedSector, normalizedAnchor, normalizedCompany);
  const upstreamErrors = [];
  let provider = 'GDELT DOC 2.0';
  let articles = [];

  for (const protocol of ['https:', 'http:']) {
    try {
      articles = await fetchGdeltArticles(query, protocol);
      provider = `GDELT DOC 2.0 (${protocol.replace(':', '')})`;
      break;
    } catch (error) {
      upstreamErrors.push(`GDELT ${protocol.replace(':', '')}: ${errorMessage(error)}`);
    }
  }

  let trustedArticles = dedupeAndTrust(articles);

  if (!trustedArticles.length) {
    try {
      const fallbackArticles = await fetchGoogleNewsArticles(normalizedSector, normalizedAnchor, normalizedCountry, normalizedCompany);
      const trustedFallbackArticles = dedupeAndTrust(fallbackArticles);
      if (trustedFallbackArticles.length) {
        trustedArticles = trustedFallbackArticles;
        provider = 'Google News RSS fallback';
      }
    } catch (error) {
      upstreamErrors.push(`Google News RSS: ${errorMessage(error)}`);
    }
  }

  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
  res.status(200).json({
    updatedAt: new Date().toISOString(),
    country: normalizedCountry,
    sector: normalizedSector,
    anchor: normalizedAnchor,
    company: normalizedCompany,
    window: '1d',
    provider,
    trustedDomains: TRUSTED_DOMAINS,
    query,
    articles: trustedArticles,
    degraded: upstreamErrors.length > 0,
    upstreamErrors,
  });
}
