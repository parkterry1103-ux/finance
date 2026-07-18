import { useEffect } from 'react';
import { MacroDashboard } from '../components/macro/MacroDashboardFull.js';
import { trackAnalyticsEvent } from '../analytics/index.js';

export default function MacroDashboardRoute() {
  useEffect(() => {
    trackAnalyticsEvent('macro_dashboard_view', {}, { oncePerPage: true, dedupeKey: 'macro' });
  }, []);
  return <MacroDashboard />;
}
