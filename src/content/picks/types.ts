import type { StockAutopsyPick } from '../../data.js';

export type WeeklyPickCollection = {
  weekOf: string;
  label?: string;
  representativePickId: string;
  pickIds: string[];
  publishedAt?: string;
  status?: 'published' | 'draft';
  archiveDescription?: string;
};

export type ArchivedWeeklyPickGroup = {
  id: string;
  weekOf?: string;
  label?: string;
  title: string;
  description: string;
  picks: StockAutopsyPick[];
};

export type PickConnectionStatus = 'complete' | 'market-reference' | 'pick-only' | 'pending';

export type PickReference = {
  pickId: string;
  reportIds?: string[];
  marketMapIds?: string[];
  relatedPickIds?: string[];
};
