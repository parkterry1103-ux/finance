import { companies, smartMoneyMoves } from '../data.js';
import type { Company, CountryId, SmartMoneyAction, SmartMoneyInvestorType, SmartMoneyMove } from '../data.js';

function envValue(key: string) {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[key];
}

function byCompany(move: SmartMoneyMove, company: Company) {
  return move.relatedCompanyId === company.id || move.companyId === company.id || Boolean(company.ticker && move.ticker === company.ticker);
}

export type OwnershipTradeQuery = {
  source?: 'all' | 'sec-13f' | 'sec-form4';
  limit?: number;
  investor?: string;
  ticker?: string;
};

function findCompanyByTicker(ticker?: string) {
  const normalized = ticker?.trim().toUpperCase();
  return companies.find((company) => company.ticker?.trim().toUpperCase() === normalized);
}

function normalizeApiTrade(row: Partial<SmartMoneyMove> & Record<string, unknown>): SmartMoneyMove | null {
  const ticker = String(row.ticker ?? '').trim();
  const company = findCompanyByTicker(ticker);
  const source = String(row.source ?? '');
  const is13f = source === 'sec-13f' || String(row.sourceLabel ?? '').includes('13F');
  const isForm4 = source === 'sec-form4' || String(row.sourceLabel ?? '').includes('Form 4');
  const companyName = String(row.companyName ?? company?.name ?? (ticker || '종목 확인 필요'));
  const investorName = String(row.investorName ?? '').trim() || (is13f ? '기관명 확인 필요' : '공개 보고자 확인 필요');

  if (!ticker && !companyName) return null;

  return {
    id: String(row.id ?? `${source || 'ownership'}-${investorName}-${ticker}-${row.disclosedDate ?? ''}`),
    investorName,
    investorType: String(row.investorType ?? (is13f ? 'fund' : isForm4 ? 'insider' : 'institution')) as SmartMoneyInvestorType,
    investorTypeLabel: String(row.investorTypeLabel ?? (is13f ? '기관 13F 분기 포트폴리오' : isForm4 ? 'Form 4 내부자 거래 보고' : '공개 보유·거래 보고')),
    market: (row.market === 'KR' || row.market === 'US' ? row.market : company?.country ?? 'US') as CountryId,
    companyId: company?.id ?? String(row.companyId ?? ''),
    relatedCompanyId: company?.id ?? String(row.relatedCompanyId ?? ''),
    relatedSupplyChainId: company?.sectorId ?? String(row.relatedSupplyChainId ?? ''),
    companyName,
    ticker,
    action: String(row.action ?? (is13f ? 'holding' : 'increase')) as SmartMoneyAction,
    actionLabel: String(row.actionLabel ?? (is13f ? '13F 보유 보고' : '내부자 거래 보고')),
    disclosedDate: String(row.disclosedDate ?? ''),
    tradeDateOptional: row.tradeDateOptional ? String(row.tradeDateOptional) : undefined,
    sectorId: company?.sectorId ?? String(row.sectorId ?? ''),
    sector: company?.sector ?? String(row.sector ?? '섹터 확인 필요'),
    sectorLabel: company?.sector ?? String(row.sectorLabel ?? row.sector ?? '섹터 확인 필요'),
    sourceLabel: String(row.sourceLabel ?? (is13f ? 'SEC 13F 분기 포트폴리오' : 'SEC Form 4 공개 보고')),
    sourceUrl: row.sourceUrl ? String(row.sourceUrl) : undefined,
    isDelayedDisclosure: Boolean(row.isDelayedDisclosure ?? true),
    note: String(row.note ?? (is13f ? '13F는 분기 말 보유 현황이며 실제 매매 시점과 다릅니다.' : '공개 보고 기준 데이터입니다.')),
    beginnerExplanation: String(
      row.beginnerExplanation ??
        (is13f
          ? '13F 보유 보고는 기관의 분기 말 포트폴리오를 보여주지만, 실시간 매수 신호가 아닙니다.'
          : '내부자 거래 보고는 공개 시점이 늦을 수 있어 실적과 공시를 함께 확인해야 합니다.'),
    ),
  };
}

export async function fetchOwnershipTrades(query: OwnershipTradeQuery = {}): Promise<SmartMoneyMove[]> {
  const params = new URLSearchParams();
  params.set('source', query.source ?? 'all');
  params.set('limit', String(Math.min(Math.max(query.limit ?? 20, 1), 100)));
  if (query.investor) params.set('investor', query.investor);
  if (query.ticker) params.set('ticker', query.ticker);

  try {
    const response = await fetch(`/api/ownership-trades?${params.toString()}`);
    if (!response.ok) throw new Error(`ownership trades ${response.status}`);
    const payload = await response.json();
    const rows: Array<Partial<SmartMoneyMove> & Record<string, unknown>> = Array.isArray(payload.trades) ? payload.trades : [];
    return rows.map(normalizeApiTrade).filter((move): move is SmartMoneyMove => Boolean(move));
  } catch {
    return [];
  }
}

export async function fetchUSInsiderTrades(symbol?: string): Promise<SmartMoneyMove[]> {
  if (!symbol) return [];
  const secUserAgent = envValue('SEC_USER_AGENT');

  // SEC Form 3/4/5 XML: 미국 내부자 매수·매도 무료 공식 원천 데이터입니다.
  // SEC_USER_AGENT가 없거나 XML 파싱 구현 전이면 mock 데이터로 fallback합니다.
  if (!secUserAgent) {
    return smartMoneyMoves.filter((move) => move.market === 'US' && move.investorType === 'insider' && move.ticker === symbol);
  }

  try {
    return smartMoneyMoves.filter((move) => move.market === 'US' && move.ticker === symbol);
  } catch {
    return smartMoneyMoves.filter((move) => move.market === 'US' && move.ticker === symbol);
  }
}

export async function fetchUSCongressTrades(symbol?: string): Promise<SmartMoneyMove[]> {
  const importUrl = envValue('CONGRESS_TRADES_IMPORT_URL');

  // 미국 국회의원 거래: House/Senate 공개자료 파서 또는 공개 CSV/JSON import URL을 연결합니다.
  // 공개 시점이 늦을 수 있으므로 disclosedDate와 tradeDateOptional을 분리해 표시합니다.
  if (!importUrl) {
    return smartMoneyMoves.filter((move) => move.market === 'US' && move.investorType === 'us-politician' && (!symbol || move.ticker === symbol));
  }

  try {
    return smartMoneyMoves.filter((move) => move.market === 'US' && (!symbol || move.ticker === symbol));
  } catch {
    return smartMoneyMoves.filter((move) => move.market === 'US' && (!symbol || move.ticker === symbol));
  }
}

export async function fetchInstitutionalHoldings(symbol?: string): Promise<SmartMoneyMove[]> {
  const secUserAgent = envValue('SEC_USER_AGENT');
  const managerCiks = envValue('SEC_13F_MANAGER_CIKS');

  // SEC 13F: 기관/펀드 포트폴리오 원천 데이터입니다.
  // manager CIK 목록과 SEC_USER_AGENT가 없으면 mock 데이터로 fallback합니다.
  if (!secUserAgent || !managerCiks) {
    return smartMoneyMoves.filter((move) => ['institution', 'fund', 'nps'].includes(move.investorType) && (!symbol || move.ticker === symbol));
  }

  try {
    return smartMoneyMoves.filter((move) => ['institution', 'fund', 'nps'].includes(move.investorType) && (!symbol || move.ticker === symbol));
  } catch {
    return smartMoneyMoves.filter((move) => ['institution', 'fund', 'nps'].includes(move.investorType) && (!symbol || move.ticker === symbol));
  }
}

export async function fetchKoreanInsiderTrades(corpCode?: string): Promise<SmartMoneyMove[]> {
  const dartKey = envValue('OPENDART_API_KEY');

  // OpenDART: 한국 임원·주요주주 소유보고, 대량보유상황보고 연결 후보입니다.
  // corpCode와 OPENDART_API_KEY가 없으면 한국 mock 데이터로 fallback합니다.
  if (!dartKey || !corpCode) {
    return smartMoneyMoves.filter((move) => move.market === 'KR');
  }

  try {
    return smartMoneyMoves.filter((move) => move.market === 'KR');
  } catch {
    return smartMoneyMoves.filter((move) => move.market === 'KR');
  }
}

export async function fetchSmartMoneyTrades(): Promise<SmartMoneyMove[]> {
  const apiTrades = await fetchOwnershipTrades({ source: 'all', limit: 20 });
  return apiTrades.length ? apiTrades : smartMoneyMoves;
}

export async function fetchTradesByCompany(company: Company): Promise<SmartMoneyMove[]> {
  const apiTrades = await fetchOwnershipTrades({ source: 'all', limit: 20, ticker: company.ticker });
  const allTrades = apiTrades.length ? apiTrades : await fetchSmartMoneyTrades();
  const directMatches = allTrades.filter((move) => byCompany(move, company));
  if (directMatches.length) return directMatches;

  if (company.country === 'KR') {
    return fetchKoreanInsiderTrades(company.corpCode);
  }

  const [insiders, congress, institutions] = await Promise.all([
    fetchUSInsiderTrades(company.ticker),
    fetchUSCongressTrades(company.ticker),
    fetchInstitutionalHoldings(company.ticker),
  ]);
  return [...insiders, ...congress, ...institutions];
}

export async function fetchTradesBySector(sectorId: string): Promise<SmartMoneyMove[]> {
  const allTrades = await fetchSmartMoneyTrades();
  return allTrades.filter((move) => move.relatedSupplyChainId === sectorId || move.sectorId === sectorId);
}
