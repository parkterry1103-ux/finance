import {
  buildGrowthMarginSensitivity,
  buildWaccGrowthSensitivity,
  calculateTerminalReinvestmentRate,
  runScenario,
  type NormalizedFinancialPeriod,
  type ScenarioName,
  type ValuationModelInput,
} from '../../domain/valuation/index.js';
import benchmarkSnapshot from '../../../artifacts/phase-4a-valuation/benchmark-snapshot.json' with { type: 'json' };
import type {
  ResearchChart,
  ResearchEvidence,
  ResearchReportArtifactSet,
  ResearchReportCompanyConfig,
  ResearchReportModel,
  ResearchSource,
} from './types.js';

const reportDate = '2026-07-17';
const scenarioLabels: Record<ScenarioName, string> = {
  conservative: '보수 조건',
  base: '기준 조건',
  optimistic: '낙관 조건',
};

function sourceForMetric(period: NormalizedFinancialPeriod, metric: string) {
  const tokens: Record<string, string[]> = {
    revenue: ['Revenues:', 'RevenueFromContractWithCustomerExcludingAssessedTax:'],
    ebit: ['OperatingIncomeLoss:'],
    operatingCashFlow: ['NetCashProvidedByUsedInOperatingActivities:'],
    capitalExpenditure: ['PaymentsToAcquireProductiveAssets:', 'PaymentsToAcquirePropertyPlantAndEquipment:'],
  };
  return period.sourceIds.find((sourceId) => (tokens[metric] ?? []).some((token) => sourceId.includes(token)))
    ?? period.sourceIds[0];
}

function chartSeries(input: ValuationModelInput): ResearchChart[] {
  const periods = [...input.historicals]
    .filter((period) => period.metrics.revenue !== undefined && period.metrics.ebit !== undefined)
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd))
    .slice(-5);
  const points = (metric: 'revenue' | 'ebit' | 'operatingCashFlow' | 'capitalExpenditure') => periods.flatMap((period) => {
    const value = period.metrics[metric];
    return value === undefined ? [] : [{
      label: `FY${period.fiscalYear ?? period.periodEnd.slice(0, 4)}`,
      value,
      sourceIds: [sourceForMetric(period, metric)],
    }];
  });
  return [
    {
      id: `${input.companySlug}-revenue-ebit`,
      title: '매출과 영업이익 흐름',
      summary: '연간 매출과 영업이익을 같은 통화·단위로 비교한 차트입니다.',
      unit: 'USD million',
      series: [{ label: '매출', points: points('revenue') }, { label: '영업이익', points: points('ebit') }],
    },
    {
      id: `${input.companySlug}-margin`,
      title: '영업이익률 흐름',
      summary: '각 연도의 영업이익을 매출로 나눈 비율입니다.',
      unit: '%',
      series: [{
        label: '영업이익률',
        points: periods.map((period) => ({
          label: `FY${period.fiscalYear ?? period.periodEnd.slice(0, 4)}`,
          value: ((period.metrics.ebit ?? 0) / (period.metrics.revenue ?? 1)) * 100,
          sourceIds: [sourceForMetric(period, 'revenue'), sourceForMetric(period, 'ebit')],
        })),
      }],
    },
    {
      id: `${input.companySlug}-cash-investment`,
      title: '영업현금흐름과 설비투자',
      summary: '연간 영업현금흐름과 유형자산 취득액을 비교한 차트입니다.',
      unit: 'USD million',
      series: [{ label: '영업현금흐름', points: points('operatingCashFlow') }, { label: '설비투자', points: points('capitalExpenditure') }],
    },
  ];
}

function artifactSources(artifacts: ResearchReportArtifactSet, chartSourceIds: string[]): ResearchSource[] {
  const used = new Set(chartSourceIds);
  return artifacts.sources
    .filter((source) => used.has(source.sourceId))
    .map((source) => ({
      id: source.sourceId,
      title: `${source.filingType} · ${source.taxonomyConcept.split(':').slice(-1)[0]}`,
      publisher: 'SEC EDGAR',
      url: source.url,
      publishedAt: source.filedAt,
      periodEnd: source.periodEnd,
      note: `접수번호 ${source.accessionOrReceiptNumber}`,
    }));
}

function derivedEvidence(
  config: ResearchReportCompanyConfig,
  artifacts: ResearchReportArtifactSet,
  chartSourceIds: string[],
): ResearchEvidence[] {
  const sourceIds = [...new Set(chartSourceIds)];
  const slug = config.slug;
  return [
    {
      id: `${slug}-historical-calculation`, type: 'calculation',
      statement: '영업이익률과 과거 성장 흐름은 동일 회계기간의 SEC 공시 값을 조합해 계산했습니다.',
      sourceIds, metricIds: ['revenue', 'ebit', 'operatingMargin'], formula: '영업이익률 = 영업이익 ÷ 매출',
      asOf: artifacts.assumptions.companySpecific.financialsAsOf,
    },
    {
      id: `${slug}-dcf-calculation`, type: 'calculation',
      statement: '기업가치와 주당 결과는 4A FCFF 엔진의 기준 조건을 다시 실행한 값입니다.',
      sourceIds, metricIds: ['fcff', 'wacc', 'terminalValue', 'equityValuePerShare'],
      formula: '기업가치 = 명시적 FCFF 현재가치 + 계속가치 현재가치', asOf: artifacts.assumptions.valuationDate,
    },
    {
      id: `${slug}-scenario-calculation`, type: 'calculation',
      statement: '세 조건과 두 민감도 표는 4A 가정 파일을 기존 가치평가 엔진에 입력해 계산했습니다.',
      sourceIds, dependsOnEvidenceIds: [`${slug}-dcf-calculation`], metricIds: ['scenario', 'sensitivity'],
      formula: '조건별 성장률·마진·WACC·영구성장률을 독립 적용', asOf: artifacts.assumptions.valuationDate,
    },
    {
      id: `${slug}-reverse-calculation`, type: 'calculation',
      statement: '역산 DCF는 관측 가격과 일치하도록 명시적 전망 기간의 매출 성장률을 풉니다.',
      sourceIds: [`${slug}-market-price`, ...sourceIds], dependsOnEvidenceIds: [`${slug}-dcf-calculation`],
      metricIds: ['currentPrice', 'revenueCagr'], formula: '모형 주당 결과 = 관측 가격', asOf: artifacts.reverse.priceAsOf,
    },
    {
      id: `${slug}-roic-fade-calculation`, type: 'calculation',
      statement: '장기 ROIC가 WACC에 가까워지는 진단은 기준 조건에서 계속가치 ROIC만 WACC+1%p로 바꿔 계산했습니다.',
      sourceIds, dependsOnEvidenceIds: [`${slug}-dcf-calculation`], metricIds: ['terminalRoic', 'wacc'],
      formula: '진단용 장기 ROIC = 기준 WACC + 1%p', asOf: artifacts.assumptions.valuationDate,
    },
    {
      id: `${slug}-model-interpretation`, type: 'interpretation',
      statement: '현재 관측 가격과 모형 결과의 차이는 가정의 차이를 점검하는 단서이며 행동 지시가 아닙니다.',
      sourceIds: [], dependsOnEvidenceIds: [`${slug}-scenario-calculation`, `${slug}-reverse-calculation`],
    },
    {
      id: `${slug}-business-interpretation`, type: 'interpretation',
      statement: config.conclusion,
      sourceIds: [], dependsOnEvidenceIds: config.factEvidence.map((item) => item.id).slice(0, 2),
    },
  ];
}

export function buildResearchReport(
  config: ResearchReportCompanyConfig,
  artifacts: ResearchReportArtifactSet,
): ResearchReportModel {
  const baseInput = structuredClone(artifacts.assumptions.baseInput);
  const scenarios = artifacts.assumptions.scenarioInputs.map((entry) => {
    const input: ValuationModelInput = {
      ...structuredClone(baseInput),
      forecastAssumptions: structuredClone(entry.forecastAssumptions),
      discountRateAssumptions: structuredClone(entry.discountRateAssumptions),
      terminalAssumptions: structuredClone(entry.terminalAssumptions),
    };
    return {
      name: entry.name,
      label: scenarioLabels[entry.name],
      input,
      result: runScenario(input),
      stableGrowthRate: input.terminalAssumptions.stableGrowthRate,
    };
  });
  const baseResult = scenarios.find((scenario) => scenario.name === 'base')!.result;
  const waccValues = [-0.01, -0.005, 0, 0.005, 0.01].map((delta) => baseResult.wacc + delta);
  const growthValues = [-0.01, -0.005, 0, 0.005, 0.01].map((delta) => baseInput.terminalAssumptions.stableGrowthRate + delta);
  const firstYear = baseInput.forecastAssumptions.years[0];
  const driverGrowth = [0.75, 0.875, 1, 1.125, 1.25].map((factor) => firstYear.revenueGrowthRate * factor);
  const driverMargins = [-0.04, -0.02, 0, 0.02, 0.04].map((delta) => firstYear.operatingMargin + delta);
  const charts = chartSeries(baseInput);
  const chartSourceIds = charts.flatMap((chart) => chart.series.flatMap((series) => series.points.flatMap((point) => point.sourceIds)));
  const fadeInput = structuredClone(baseInput);
  fadeInput.terminalAssumptions.stableRoic = baseResult.wacc + 0.01;
  const fadeResult = runScenario(fadeInput);
  const sources = [
    ...artifactSources(artifacts, chartSourceIds),
    ...config.officialSources,
    {
      id: `${config.slug}-market-price`, title: `${config.ticker} 시장가격 스냅샷`,
      publisher: '기존 시장가격 API (Yahoo chart)', url: '/api/market-prices',
      publishedAt: artifacts.assumptions.price.asOf, note: '4A 저장 스냅샷을 사용하며 화면에서 다시 요청하지 않습니다.',
    },
    {
      id: `${config.slug}-benchmark`, title: `NYU Stern 2026 미국 업종 benchmark · ${artifacts.assumptions.companySpecific.benchmarkId}`,
      publisher: 'NYU Stern', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/data.html',
      publishedAt: benchmarkSnapshot.sourceDate, note: '업종 범위 점검에만 사용했습니다.',
    },
  ];
  return {
    slug: config.slug,
    companyName: config.companyName,
    englishName: config.englishName,
    ticker: config.ticker,
    industry: config.industry,
    reportTitle: config.reportTitle,
    reportDate,
    financialsAsOf: artifacts.assumptions.companySpecific.financialsAsOf,
    priceAsOf: artifacts.assumptions.price.asOf,
    valuationDate: artifacts.assumptions.valuationDate,
    dilutedSharesAsOf: artifacts.assumptions.companySpecific.dilutedSharesAsOf,
    capitalStructureAsOf: artifacts.assumptions.companySpecific.capitalStructureAsOf,
    riskFreeAsOf: artifacts.assumptions.companySpecific.riskFreeAsOf,
    erpAsOf: benchmarkSnapshot.sourceDate,
    benchmarkAsOf: benchmarkSnapshot.sourceDate,
    currentPrice: artifacts.assumptions.price.value,
    conclusion: config.conclusion,
    watchStatement: config.watchStatement,
    executiveSummary: config.executiveSummary,
    sections: { business: config.business, earnings: config.earnings, financial: config.financial, industry: config.industryClaims, outlook: config.outlook },
    charts,
    glossary: config.glossary,
    evidence: [...config.factEvidence, ...derivedEvidence(config, artifacts, chartSourceIds)],
    sources,
    baseInput,
    baseResult,
    scenarios,
    waccGrowthSensitivity: buildWaccGrowthSensitivity(baseInput, waccValues, growthValues),
    driverSensitivity: buildGrowthMarginSensitivity(baseInput, driverGrowth, driverMargins),
    reverseDcf: {
      solvedRevenueCagr: artifacts.reverse.result.solvedValue,
      targetPrice: artifacts.reverse.currentPrice,
      relativeError: artifacts.reverse.result.relativeError,
      converged: artifacts.reverse.result.converged,
    },
    roicFade: {
      label: '장기 ROIC가 WACC에 가까워지는 진단',
      terminalRoic: fadeInput.terminalAssumptions.stableRoic,
      estimatedValuePerShare: fadeResult.estimatedValuePerShare,
      differenceFromBase: fadeResult.estimatedValuePerShare - baseResult.estimatedValuePerShare,
    },
    warnings: [...new Set(scenarios.flatMap((scenario) => scenario.result.warnings.map((warning) => warning.message)))],
    limitations: [
      ...artifacts.assumptions.limitations.map((item) => item.replace('공개 UI 노출 금지', '4A 내부 산출물을 공개용 증거 모델로 재검증해 사용')),
      '분석가 컨센서스나 실시간 시세를 사용하지 않으며, 공시 이후 사건은 별도 공식 자료가 있을 때만 반영합니다.',
      '모형 결과는 입력 가정에 민감하며 특정 행동을 지시하지 않습니다.',
    ],
  };
}

export function terminalReinvestmentRate(report: ResearchReportModel) {
  return calculateTerminalReinvestmentRate(
    report.baseInput.terminalAssumptions.stableGrowthRate,
    report.baseInput.terminalAssumptions.stableRoic,
  );
}
