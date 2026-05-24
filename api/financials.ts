declare const process: {
  env: Record<string, string | undefined>;
};

type QueryValue = string | string[] | undefined;

type ApiRequest = {
  method?: string;
  query?: Record<string, QueryValue>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

function firstQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function requiredEnvKeys(country: string) {
  const normalizedCountry = country.trim().toUpperCase();
  if (normalizedCountry === 'US') return ['SEC_USER_AGENT'];
  if (normalizedCountry === 'KR') return ['OPENDART_API_KEY'];
  return ['SEC_USER_AGENT', 'OPENDART_API_KEY'];
}

function hasEnv(key: string) {
  return Boolean(process.env[key]);
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== 'GET') {
    res.setHeader?.('Allow', 'GET');
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const country = firstQueryValue(req.query?.country);
  const companyId = firstQueryValue(req.query?.companyId);
  const cik = firstQueryValue(req.query?.cik);
  const corpCode = firstQueryValue(req.query?.corpCode);
  const neededEnvKeys = requiredEnvKeys(country);
  const hasRequiredEnv = neededEnvKeys.every(hasEnv);

  res.status(200).json({
    ok: true,
    country,
    companyId,
    cik,
    corpCode,
    metrics: {
      revenue: null,
      operatingIncome: null,
      netIncome: null,
      cashFlow: null,
      operatingMargin: null,
      debtRatio: null,
    },
    sourceStatus: hasRequiredEnv ? 'not-found' : 'missing-env',
    env: {
      secUserAgent: hasEnv('SEC_USER_AGENT') ? 'present' : 'missing',
      openDartApiKey: hasEnv('OPENDART_API_KEY') ? 'present' : 'missing',
    },
  });
}
