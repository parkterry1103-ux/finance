import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ReleaseGateConfig = {
  nodeMajor: number;
  function: {
    count: number;
    runtime: string;
    memoryMb: number;
    maxDurationSeconds: number;
    entrypoints: string[];
  };
  bundle: {
    entryRawMaxBytes: number;
    entryGzipMaxBytes: number;
  };
  content: {
    companyProfiles: number;
    companyEvents: number;
    demandSupplyEntries: number;
    bottlenecks: number;
    reports: number;
    industryFlows: number;
    macroSeries: number;
    marketRelations: number;
    editorialPublished: number;
  };
  lazyRoutes: Array<{ name: string; source: string }>;
  smoke: {
    timeoutMs: number;
    maxRedirects: number;
    retries: number;
    routes: string[];
    assetContentChecks: Array<{ id: string; all: string[] }>;
    apis: Array<{ id: string; path: string; contract: string }>;
    syncEndpoints: string[];
  };
};

export const releaseGateConfigPath = join(process.cwd(), 'config', 'release-gate.json');

export function loadReleaseGateConfig(): ReleaseGateConfig {
  const parsed = JSON.parse(readFileSync(releaseGateConfigPath, 'utf8')) as ReleaseGateConfig;
  const config = JSON.parse(JSON.stringify(parsed)) as ReleaseGateConfig;
  const fixture = process.env?.RELEASE_GATE_TEST_FIXTURE;

  if (fixture === 'node-major') config.nodeMajor += 1;
  if (fixture === 'function-count') config.function.count += 1;
  if (fixture === 'content-count') config.content.companyProfiles += 1;
  if (fixture === 'bundle-budget') {
    config.bundle.entryRawMaxBytes = 1;
    config.bundle.entryGzipMaxBytes = 1;
  }

  return config;
}
