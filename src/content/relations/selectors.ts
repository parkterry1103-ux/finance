import { relationDefinitions } from './entries.js';
import type { RelationId, RelationState, RelationWindow } from './types.js';

export const relationStateLabels: Record<RelationState, string> = {
  'same-direction': '비슷한 방향',
  'opposite-direction': '엇갈린 방향',
  weak: '뚜렷한 관계 없음',
  limited: '판단 제한',
};

export const relationWindowLabels: Record<RelationWindow, string> = {
  '3m': '3개월',
  '6m': '6개월',
  '1y': '1년',
  '2y': '2년',
};

export function relationDefinitionById(id?: string | null) {
  return relationDefinitions.find((definition) => definition.id === id);
}

export function safeRelationId(id?: string | null): RelationId {
  return relationDefinitionById(id)?.id ?? relationDefinitions[0].id;
}

export function safeRelationWindow(id: RelationId, window?: string | null): RelationWindow {
  const definition = relationDefinitionById(id) ?? relationDefinitions[0];
  return definition.availableWindows.includes(window as RelationWindow)
    ? window as RelationWindow
    : definition.defaultWindow;
}
