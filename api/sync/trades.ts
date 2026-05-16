import { syncCongressTrades } from '../../scripts/sync-congress-trades.ts';
import { syncSec13F } from '../../scripts/sync-sec-13f.ts';
import { syncSecForm4 } from '../../scripts/sync-sec-form4.ts';

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
    const [form4, form13f, congress] = await Promise.all([syncSecForm4(), syncSec13F(), syncCongressTrades()]);
    res.status(200).json({
      ok: true,
      inserted: (form4.insertedCount ?? 0) + (form13f.insertedCount ?? 0) + (congress.insertedCount ?? 0),
      updated: (form4.updatedCount ?? 0) + (form13f.updatedCount ?? 0) + (congress.updatedCount ?? 0),
      results: { form4, form13f, congress },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
