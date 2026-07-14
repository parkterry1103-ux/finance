import { industryFlows } from '../industry-flows/entries.js';
import { beginnerTermDefinitions, disclosureEventDefinitions, homeContentLimits, homeFeatureLabels } from './entries.js';
import type { BeginnerTermId, DisclosureEventType, HomeFeatureId } from './types.js';

export const homeFeatureRegistry = Object.fromEntries(homeFeatureLabels.map((feature) => [feature.id, feature])) as Record<HomeFeatureId, (typeof homeFeatureLabels)[number]>;

export const beginnerTermRegistry = Object.fromEntries(beginnerTermDefinitions.map((definition) => [definition.id, definition])) as Record<BeginnerTermId, (typeof beginnerTermDefinitions)[number]>;

export const disclosureEventRegistry = Object.fromEntries(disclosureEventDefinitions.map((definition) => [definition.id, definition])) as Record<DisclosureEventType, (typeof disclosureEventDefinitions)[number]>;

export function homeIndustryFlows() {
  return industryFlows.slice(0, homeContentLimits.industryFlows);
}
