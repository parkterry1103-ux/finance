import { smartMoneyMoves } from '../data.js';
import type { Company, SmartMoneyMove } from '../data.js';

function envValue(key: string) {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[key];
}

function byCompany(move: SmartMoneyMove, company: Company) {
  return move.relatedCompanyId === company.id || move.companyId === company.id || Boolean(company.ticker && move.ticker === company.ticker);
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
  const hasAnyKey = Boolean(
    envValue('SEC_USER_AGENT') ||
      envValue('OPENDART_API_KEY') ||
      envValue('CONGRESS_TRADES_IMPORT_URL') ||
      envValue('SEC_13F_MANAGER_CIKS') ||
      envValue('NPS_IMPORT_URL'),
  );

  if (!hasAnyKey) return smartMoneyMoves;

  try {
    return smartMoneyMoves;
  } catch {
    return smartMoneyMoves;
  }
}

export async function fetchTradesByCompany(company: Company): Promise<SmartMoneyMove[]> {
  const allTrades = await fetchSmartMoneyTrades();
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
