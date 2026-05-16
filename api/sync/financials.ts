import { syncOpenDartFinancials } from '../../scripts/sync-opendart-financials.js';
import { syncSecCompanyFacts } from '../../scripts/sync-sec-companyfacts.js';
import { errorMessage, nowIso, recordSyncRun } from '../../scripts/sync-utils.js';

function isAuthorized(req) {
  const configured = process.env.CRON_SECRET;
  if (!configured) return false;
  const header = req.headers?.authorization || req.headers?.Authorization;
  const querySecret = req.query?.secret;
  return header === `Bearer ${configured}` || querySecret === configured;
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized cron request' });
    return;
  }

  try {
    const [opendart, sec] = await Promise.all([syncOpenDartFinancials(), syncSecCompanyFacts()]);
    res.status(200).json({
      ok: true,
      inserted: (opendart.insertedCount ?? 0) + (sec.insertedCount ?? 0),
      updated: (opendart.updatedCount ?? 0) + (sec.updatedCount ?? 0),
      results: { opendart, sec },
    });
  } catch (error) {
    await recordSyncRun({
      source: 'endpoint-financials',
      status: 'failed',
      startedAt: nowIso(),
      errorMessage: errorMessage(error),
    }).catch(() => undefined);
    res.status(500).json({
      ok: false,
      error: errorMessage(error),
    });
  }
}
