import { parseOptionsFromQuery, syncSecFilingDetails } from '../../scripts/sync-sec-filing-details.js';
import { errorMessage, nowIso, recordSyncRun } from '../../scripts/sync-utils.js';

declare const process: {
  env: Record<string, string | undefined>;
};

type QueryValue = string | string[] | undefined;

type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, QueryValue>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

function firstQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function isAuthorized(req: ApiRequest) {
  const configured = process.env.CRON_SECRET;
  if (!configured) return false;
  const header = firstHeaderValue(req.headers?.authorization || req.headers?.Authorization);
  const querySecret = firstQueryValue(req.query?.secret);
  return header === `Bearer ${configured}` || querySecret === configured;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized cron request' });
    return;
  }

  try {
    const result = await syncSecFilingDetails(parseOptionsFromQuery(req.query));
    if (result.status === 'skipped' && result.code === 'SEC_USER_AGENT_NOT_CONFIGURED') {
      res.status(200).json({ ok: false, code: result.code, message: result.message, result });
      return;
    }
    res.status(200).json({ ok: true, result });
  } catch (error) {
    await recordSyncRun({
      source: 'endpoint-sec-edgar-filing-details',
      status: 'failed',
      startedAt: nowIso(),
      errorMessage: errorMessage(error),
    }).catch(() => undefined);
    res.status(500).json({
      ok: false,
      error: 'SEC EDGAR filing detail sync failed',
    });
  }
}
