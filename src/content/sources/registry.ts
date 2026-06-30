import type { EvidenceSourceType, StockAutopsySourceLink, StockAutopsySourceRef } from '../../data.js';
import { contentSources } from './entries.js';
import type { ContentSource, SourceKind } from './types.js';

export const sourceRegistry: Record<string, ContentSource> = Object.fromEntries(
  contentSources.map((source) => [source.id, source]),
);

export const sourceByUrl = new Map(
  contentSources.map((source) => [source.url, source]),
);

function evidenceTypeForSourceKind(kind: SourceKind): EvidenceSourceType {
  if (kind === 'company-ir') return 'company-ir';
  if (kind === 'company-filing' || kind === 'sec-filing' || kind === 'dart-filing' || kind === 'kind-filing') {
    return 'company-filing';
  }
  if (kind === 'industry-data') return 'industry-report';
  if (kind === 'news' || kind === 'market-data') return 'news';
  return 'official-announcement';
}

export function resolveSource(sourceId: string) {
  const source = sourceRegistry[sourceId];
  if (!source) {
    throw new Error(`Unknown content source id: ${sourceId}`);
  }
  return source;
}

export function resolvePickSourceLinks(sourceRefs: StockAutopsySourceRef[] = []): StockAutopsySourceLink[] {
  return sourceRefs.map((ref) => {
    const source = resolveSource(ref.sourceId);
    return {
      sourceId: source.id,
      label: source.title,
      url: source.url,
      note: ref.note ?? source.note,
      type: evidenceTypeForSourceKind(source.kind),
      publisher: source.publisher,
      accessType: source.accessType ?? 'public',
    };
  });
}
