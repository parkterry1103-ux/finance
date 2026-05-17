import { syncPrices } from '../../scripts/sync-prices.js';
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
    const result = await syncPrices();
    res.status(200).json({
      ok: true,
      inserted: result.insertedCount ?? 0,
      updated: result.updatedCount ?? 0,
      result,
    });
  } catch (error) {
    await recordSyncRun({
      source: 'endpoint-prices',
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
