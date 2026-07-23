import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { supplyChainBottlenecks } from '../src/content/bottlenecks/index.js';
import { companyEvents } from '../src/content/company-events/index.js';
import { companyProfiles } from '../src/content/company-profiles/index.js';
import { demandSupplyEntries } from '../src/content/demand-supply/index.js';
import { industryFlows } from '../src/content/industry-flows/index.js';
import { macroIndicatorDefinitions } from '../src/content/macro/index.js';
import { relationDefinitions } from '../src/content/relations/index.js';
import { industryReports } from '../src/content/reports/index.js';
import { publishedEditorialSummaryIndex } from '../src/content/editorial/summaries.js';
import { loadReleaseGateConfig, type ReleaseGateConfig } from './release-gate-config.js';

type CheckResult = {
  name: string;
  command: string;
  status: 'passed' | 'failed';
  exitCode: number;
  durationMs: number;
  detail: string;
};

type BundleResult = {
  entryAsset: string;
  entryRawBytes: number;
  entryGzipBytes: number;
  jsAssetCount: number;
  dynamicChunkCount: number;
  zeroByteAssetCount: number;
};

type ManifestEntry = {
  file?: string;
  name?: string;
  css?: string[];
  imports?: string[];
  dynamicImports?: string[];
  isEntry?: boolean;
  isDynamicEntry?: boolean;
};

const root = process.cwd();
const nodeCommand = process.execPath ?? 'node';
const argv = process.argv ?? [];
const fixtureArgument = argv.find((argument) => argument.startsWith('--test-fixture='));
const fixture = fixtureArgument?.split('=', 2)[1] ?? null;
const allowedFixtures = new Set(['bundle-budget', 'node-major', 'content-count', 'function-count']);
if (fixture && allowedFixtures.has(fixture)) {
  if (process.env) process.env.RELEASE_GATE_TEST_FIXTURE = fixture;
}

const config = loadReleaseGateConfig();
const startedAt = Date.now();
const results: CheckResult[] = [];
let auditTotal = -1;
let productionAuditTotal = -1;
let bundle: BundleResult | null = null;

const actualContent = {
  companyProfiles: companyProfiles.length,
  companyEvents: companyEvents.length,
  demandSupplyEntries: demandSupplyEntries.length,
  bottlenecks: supplyChainBottlenecks.length,
  reports: industryReports.length,
  industryFlows: industryFlows.length,
  macroSeries: macroIndicatorDefinitions.length,
  marketRelations: relationDefinitions.length,
  editorialPublished: publishedEditorialSummaryIndex.length,
};

function durationSince(start: number) {
  return Date.now() - start;
}

function safeDetail(value: string) {
  return value
    .replaceAll(root, '.')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line
      && !line.startsWith('at ')
      && !line.startsWith('file://')
      && !line.startsWith('throw new Error')
      && !/^\^+$/.test(line)
      && line !== '}')
    .slice(0, 8)
    .join(' | ')
    .slice(0, 1200);
}

function runInline(name: string, command: string, action: () => string) {
  const start = Date.now();
  try {
    const detail = action();
    results.push({ name, command, status: 'passed', exitCode: 0, durationMs: durationSince(start), detail });
    console.log(`✓ ${name}: ${detail}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    results.push({ name, command, status: 'failed', exitCode: 1, durationMs: durationSince(start), detail: safeDetail(detail) });
    console.error(`✗ ${name}: ${detail}`);
  }
}

function runCommand(name: string, command: string, args: string[]) {
  const start = Date.now();
  const child = spawnSync(command, args, { cwd: root, encoding: 'utf8', env: process.env });
  if (child.stdout?.trim()) console.log(child.stdout.trim());
  if (child.stderr?.trim()) console.error(child.stderr.trim());
  const exitCode = child.status ?? 1;
  const combined = `${child.stderr ?? ''}\n${child.stdout ?? ''}`.trim();
  results.push({
    name,
    command: [command, ...args].join(' '),
    status: exitCode === 0 ? 'passed' : 'failed',
    exitCode,
    durationMs: durationSince(start),
    detail: exitCode === 0 ? 'command completed' : safeDetail(combined || child.error?.message || 'command failed'),
  });
  console.log(`${exitCode === 0 ? '✓' : '✗'} ${name} (${durationSince(start)}ms)`);
}

function runAudit(name: string, omitDev: boolean) {
  const start = Date.now();
  const args = ['audit', '--json', ...(omitDev ? ['--omit=dev'] : [])];
  const child = spawnSync('npm', args, { cwd: root, encoding: 'utf8', env: process.env });
  let status: CheckResult['status'] = 'failed';
  let detail = 'npm registry or audit command failed';
  let total = -1;
  try {
    const parsed = JSON.parse(child.stdout ?? '{}') as {
      error?: { summary?: string; detail?: string };
      metadata?: { vulnerabilities?: Record<string, number> };
      vulnerabilities?: Record<string, { severity?: string }>;
    };
    if (parsed.error) {
      detail = `registry/audit error: ${parsed.error.summary ?? parsed.error.detail ?? 'unknown error'}`;
    } else {
      total = Number(parsed.metadata?.vulnerabilities?.total ?? -1);
      if (total === 0 && (child.status ?? 1) === 0) {
        status = 'passed';
        detail = '0 vulnerabilities';
      } else if (total > 0) {
        const packages = Object.entries(parsed.vulnerabilities ?? {})
          .slice(0, 5)
          .map(([packageName, advisory]) => `${packageName}(${advisory.severity ?? 'unknown'})`)
          .join(', ');
        detail = `${total} vulnerabilities: ${packages || 'package details unavailable'}`;
      } else {
        detail = `audit exited ${child.status ?? 1} without vulnerability metadata`;
      }
    }
  } catch {
    detail = `registry/audit response was not valid JSON: ${safeDetail(child.stderr ?? '')}`;
  }
  if (omitDev) productionAuditTotal = total;
  else auditTotal = total;
  results.push({
    name,
    command: `npm ${args.join(' ')}`,
    status,
    exitCode: status === 'passed' ? 0 : (child.status ?? 1),
    durationMs: durationSince(start),
    detail,
  });
  console.log(`${status === 'passed' ? '✓' : '✗'} ${name}: ${detail}`);
}

function collectFunctionEntries(directory: string, relativeDirectory = 'api'): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '_lib') return [];
    const absolute = join(directory, entry.name);
    const relative = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) return collectFunctionEntries(absolute, relative);
    return /\.(?:js|ts)$/.test(entry.name) ? [relative] : [];
  }).sort();
}

function collectRuntimeSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return collectRuntimeSources(absolute);
    return /\.(?:js|jsx|ts|tsx)$/.test(entry.name) ? [readFileSync(absolute, 'utf8')] : [];
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function validateConfigInventory(activeConfig: ReleaseGateConfig) {
  assert(!fixture || allowedFixtures.has(fixture), `unknown test fixture: ${fixture}`);
  const runtimeMajor = Number.parseInt((process.versions?.node ?? '').split('.')[0] ?? '', 10);
  assert(runtimeMajor === activeConfig.nodeMajor, `Node major expected ${activeConfig.nodeMajor}, received ${runtimeMajor || 'unknown'}`);

  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { engines?: { node?: string } };
  const packageLock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8')) as { packages?: Record<string, { engines?: { node?: string } }> };
  assert(packageJson.engines?.node === `${activeConfig.nodeMajor}.x`, `package engines must be ${activeConfig.nodeMajor}.x`);
  assert(packageLock.packages?.['']?.engines?.node === `${activeConfig.nodeMajor}.x`, `lockfile engines must be ${activeConfig.nodeMajor}.x`);

  const functions = collectFunctionEntries(join(root, 'api'));
  assert(functions.length === activeConfig.function.count, `Function count expected ${activeConfig.function.count}, received ${functions.length}`);
  assert(JSON.stringify(functions) === JSON.stringify([...activeConfig.function.entrypoints].sort()), 'Function entrypoint inventory changed');

  for (const [key, expected] of Object.entries(activeConfig.content)) {
    const actual = actualContent[key as keyof typeof actualContent];
    assert(actual === expected, `content ${key} expected ${expected}, received ${actual}`);
  }

  const requiredFiles = [
    'dist-placeholder-not-required',
    'package.json',
    'package-lock.json',
    'vercel.json',
    '.github/workflows/ci.yml',
    '.github/workflows/deployment-smoke.yml',
    'src/domain/valuation/index.ts',
    'src/domain/valuation/validation.ts',
    'scripts/valuation-unit.ts',
    'scripts/research-report-unit.ts',
    'scripts/monte-carlo-unit.ts',
    'scripts/editorial-unit.ts',
    'scripts/company-brief-unit.ts',
    'scripts/company-dissection-unit.ts',
    'scripts/phase5g-browser-qa.mjs',
    'scripts/financial-pivot-unit.ts',
    'scripts/valuation-expectations-unit.ts',
    'scripts/event-impact-unit.ts',
    'scripts/event-impact-browser-qa.mjs',
    'scripts/analytics-unit.ts',
    'scripts/analytics-browser-qa.mjs',
    'scripts/analytics-production-smoke.mjs',
    'src/analytics/types.ts',
    'src/analytics/routes.ts',
    'src/analytics/attribution.ts',
    'src/analytics/provider.ts',
    'src/analytics/runtime.ts',
    'src/analytics/validation.ts',
    'src/content/company-briefs/validation.ts',
    'src/content/company-dissections/validation.ts',
    'src/content/financial-pivots/validation.ts',
    'src/routes/FinancialPivotRoute.tsx',
    'src/routes/ValuationExpectationsRoute.tsx',
    'src/components/valuation/MonteCarloValuationSection.tsx',
    'src/content/event-impacts/validation.ts',
    'src/content/event-impacts/registry.ts',
    'src/components/event-impacts/EventImpactUi.tsx',
    'src/routes/ResearchReportRoute.tsx',
    'src/routes/InsightsRoute.tsx',
    'src/routes/StockDissectionRoute.tsx',
    'src/routes/ThreeReadsRoute.tsx',
    'docs/site-restructure-phase-4a.md',
    'docs/valuation-readiness-inventory.md',
    'docs/valuation-methodology.md',
    'docs/valuation-data-normalization.md',
    'docs/site-restructure-phase-4b.md',
    'docs/research-report-methodology.md',
    'docs/research-report-content-inventory.md',
    'docs/site-restructure-phase-4c.md',
    'docs/monte-carlo-valuation-methodology.md',
    'docs/monte-carlo-assumption-inventory.md',
    'docs/monte-carlo-validation.md',
    'docs/site-restructure-phase-5a.md',
    'docs/editorial-content-model.md',
    'docs/editorial-publishing-workflow.md',
    'docs/editorial-validation.md',
    'docs/site-restructure-phase-5b.md',
    'docs/company-brief-model.md',
    'docs/stock-dissection-intake.md',
    'docs/site-restructure-phase-5c.md',
    'docs/financial-pivot-model.md',
    'docs/financial-comparison-methodology.md',
    'docs/financial-data-validation.md',
    'docs/site-restructure-phase-5d.md',
    'docs/valuation-expectation-model.md',
    'docs/reverse-dcf-methodology.md',
    'docs/valuation-validation.md',
    'docs/site-restructure-phase-5e.md',
    'docs/event-impact-model.md',
    'docs/event-to-assumption-methodology.md',
    'docs/event-impact-validation.md',
    'docs/site-restructure-phase-5f.md',
    'docs/site-restructure-phase-5g.md',
    'docs/mobile-company-dissection-model.md',
    'docs/company-industry-peer-policy.md',
    'docs/company-search-index.md',
    'docs/research-surface-boundaries.md',
    'docs/research-report-model.md',
    'docs/analytics-event-model.md',
    'docs/research-funnel-measurement.md',
    'docs/instagram-linking-workflow.md',
    'docs/privacy-analytics-policy.md',
    'docs/plans/phase-5b-company-brief-plan.html',
    'docs/plans/phase-5c-financial-pivot-plan.html',
    'docs/plans/phase-5d-valuation-expectations-plan.html',
    'docs/plans/phase-5e-event-assumption-linkage-plan.html',
    'docs/plans/phase-5f-research-funnel-analytics-plan.html',
    'docs/plans/phase-5g-mobile-company-dissection-plan.html',
    'docs/plans/phase-5a-editorial-newsroom-plan.html',
    'artifacts/phase-4a-valuation/valuation-readiness.json',
    'artifacts/phase-4a-valuation/nvidia/valuation-result.json',
    'artifacts/phase-4a-valuation/meta/valuation-result.json',
    'artifacts/phase-4c-monte-carlo/nvidia/result-summary.json',
    'artifacts/phase-4c-monte-carlo/meta/result-summary.json',
    ...activeConfig.lazyRoutes.map((route) => route.source),
  ].filter((file) => file !== 'dist-placeholder-not-required');
  requiredFiles.forEach((file) => assert(existsSync(join(root, file)), `required file missing: ${file}`));

  const workflowAndRuntimeConfig = [
    readFileSync(join(root, 'package.json'), 'utf8'),
    readFileSync(join(root, 'package-lock.json'), 'utf8'),
    readFileSync(join(root, 'vercel.json'), 'utf8'),
    readFileSync(join(root, '.github', 'workflows', 'ci.yml'), 'utf8'),
    readFileSync(join(root, '.github', 'workflows', 'deployment-smoke.yml'), 'utf8'),
    readFileSync(join(root, '.github', 'workflows', 'sync.yml'), 'utf8'),
  ].join('\n');
  assert(!/node-version:\s*["']?(?:20|24)(?:\.x)?|"node"\s*:\s*"(?:20|24)\.x"|nodejs(?:20|24)\.x/.test(workflowAndRuntimeConfig), 'Node 20/24 configuration remains');

  const runtimeSource = collectRuntimeSources(join(root, 'src')).join('\n');
  assert(!/@xyflow\/react|\bReactFlow\b|전체 연결 보기|기업 연결 보기|시장지도 준비 중/.test(runtimeSource), 'forbidden market-map or ReactFlow runtime string remains');
  const eagerPublicSource = [
    readFileSync(join(root, 'src', 'App.tsx'), 'utf8'),
    ...collectRuntimeSources(join(root, 'src', 'components')),
  ].join('\n');
  assert(!/domain\/valuation|content\/valuation\/expectations/.test(eagerPublicSource), 'valuation calculation module imported by eager public runtime');
  return `${functions.length} Functions, ${Object.keys(activeConfig.content).length} content counts, forbidden runtime strings 0`;
}

function validateBundle(activeConfig: ReleaseGateConfig): string {
  const manifestPath = join(root, 'dist', '.vite', 'manifest.json');
  assert(existsSync(join(root, 'dist', 'index.html')), 'dist/index.html missing');
  assert(existsSync(manifestPath), 'Vite manifest missing');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, ManifestEntry>;
  const reachableDynamicImports = (start: string) => {
    const pending = [start];
    const seen = new Set<string>();
    const dynamic = new Set<string>();
    while (pending.length) {
      const key = pending.pop()!;
      if (seen.has(key)) continue;
      seen.add(key);
      const definition = manifest[key];
      definition?.dynamicImports?.forEach((item) => dynamic.add(item));
      definition?.imports?.forEach((item) => pending.push(item));
    }
    return dynamic;
  };
  const entries = Object.entries(manifest).filter(([, value]) => value.isEntry);
  assert(entries.length === 1, `expected one entry manifest record, received ${entries.length}`);
  const [entrySource, entryDefinition] = entries[0];
  assert(entrySource === 'index.html', `unexpected entry source: ${entrySource}`);
  assert(Boolean(entryDefinition.file), 'entry JS missing from manifest');
  assert((entryDefinition.css?.length ?? 0) > 0, 'entry CSS missing from manifest');

  const entryPath = join(root, 'dist', entryDefinition.file!);
  assert(existsSync(entryPath), `entry JS asset missing: ${entryDefinition.file}`);
  entryDefinition.css!.forEach((css) => assert(existsSync(join(root, 'dist', css)), `entry CSS asset missing: ${css}`));

  activeConfig.lazyRoutes.forEach((route) => {
    const routeManifest = manifest[route.source];
    assert(routeManifest?.isDynamicEntry, `${route.source} is not a dynamic manifest entry`);
    assert(entryDefinition.dynamicImports?.includes(route.source), `${route.source} is not dynamically imported by the App entry`);
  });
  const reportRouteEntry = Object.entries(manifest).find(([, definition]) => definition.name === 'ResearchReportRoute' && definition.isDynamicEntry);
  const valuationRouteEntry = Object.entries(manifest).find(([, definition]) => definition.name === 'ValuationExpectationsRoute' && definition.isDynamicEntry);
  assert(Boolean(reportRouteEntry), 'research report route is not a dynamic manifest entry');
  assert(Boolean(valuationRouteEntry), 'valuation expectations route is not a dynamic manifest entry');
  const [reportRouteKey, reportRoute] = reportRouteEntry!;
  const [valuationRouteKey] = valuationRouteEntry!;
  const nvidiaReport = manifest['src/content/research-reports/nvidia.ts'];
  const metaReport = manifest['src/content/research-reports/meta.ts'];
  const nvidiaMonteCarlo = manifest['src/content/monte-carlo/nvidia.ts'];
  const metaMonteCarlo = manifest['src/content/monte-carlo/meta.ts'];
  const nvidiaEventImpacts = manifest['src/content/event-impacts/entries/nvidia.ts'];
  const metaEventImpacts = manifest['src/content/event-impacts/entries/meta.ts'];
  const netflixEventImpacts = manifest['src/content/event-impacts/entries/netflix.ts'];
  const companiesRoute = manifest['src/routes/CompaniesRoute.tsx'];
  assert(nvidiaReport?.isDynamicEntry && metaReport?.isDynamicEntry, 'company report content is not split into company-specific dynamic entries');
  assert(entryDefinition.dynamicImports?.includes(reportRouteKey), 'research report route is not dynamically imported by the App entry');
  const reportReachableDynamic = reachableDynamicImports(reportRouteKey);
  const valuationReachableDynamic = reachableDynamicImports(valuationRouteKey);
  assert(reportReachableDynamic.has('src/content/research-reports/nvidia.ts'), 'NVIDIA report is not dynamically reachable from report route');
  assert(reportReachableDynamic.has('src/content/research-reports/meta.ts'), 'Meta report is not dynamically reachable from report route');
  assert(entryDefinition.dynamicImports?.includes(valuationRouteKey), 'valuation expectations route is not dynamically imported by the App entry');
  assert(valuationReachableDynamic.has('src/content/research-reports/nvidia.ts'), 'NVIDIA report is not dynamically reachable from valuation route');
  assert(valuationReachableDynamic.has('src/content/research-reports/meta.ts'), 'Meta report is not dynamically reachable from valuation route');
  assert(nvidiaMonteCarlo?.isDynamicEntry && metaMonteCarlo?.isDynamicEntry, 'Monte Carlo results are not split into company-specific dynamic entries');
  assert(valuationReachableDynamic.has('src/content/monte-carlo/nvidia.ts'), 'NVIDIA Monte Carlo result is not dynamically reachable from valuation route');
  assert(valuationReachableDynamic.has('src/content/monte-carlo/meta.ts'), 'Meta Monte Carlo result is not dynamically reachable from valuation route');
  assert(!nvidiaMonteCarlo?.dynamicImports?.some((source) => source.includes('/meta.')), 'NVIDIA Monte Carlo chunk preloads Meta data');
  assert(!metaMonteCarlo?.dynamicImports?.some((source) => source.includes('/nvidia.')), 'Meta Monte Carlo chunk preloads NVIDIA data');
  assert(nvidiaEventImpacts?.isDynamicEntry && metaEventImpacts?.isDynamicEntry && netflixEventImpacts?.isDynamicEntry, 'event impacts are not split into company-specific dynamic entries');
  assert(!nvidiaEventImpacts?.imports?.some((source) => source.includes('entries/meta')), 'NVIDIA event impact chunk preloads Meta data');
  assert(!metaEventImpacts?.imports?.some((source) => source.includes('entries/nvidia')), 'Meta event impact chunk preloads NVIDIA data');
  assert(!netflixEventImpacts?.imports?.some((source) => source.includes('entries/nvidia') || source.includes('entries/meta')), 'Netflix event impact chunk preloads another company');
  assert(!entryDefinition.dynamicImports?.some((source) => source.includes('event-impacts/entries/')), 'App entry directly preloads company event impacts');
  assert(!companiesRoute?.dynamicImports?.some((source) => source.includes('research-reports')), 'company dashboard preloads report content');
  assert(!entryDefinition.dynamicImports?.some((source) => source.includes('content/research-reports/')), 'App entry directly preloads company report content');

  const appSource = readFileSync(join(root, 'src', 'App.tsx'), 'utf8');
  activeConfig.lazyRoutes.forEach((route) => {
    const modulePath = `./routes/${route.name}`;
    assert(appSource.includes(`lazy(() => import('${modulePath}'))`), `${route.name} source lazy import missing`);
    assert(!new RegExp(`^import[^\\n]+${route.name}`, 'm').test(appSource), `${route.name} has a static App import`);
  });
  assert(/function LandingPage\(/.test(appSource), 'Home is not eager');
  assert(/function PrimaryNavigation\(/.test(appSource), 'Header/Navigation is not eager');
  assert(appSource.includes("lazy(() => import('./routes/ResearchReportRoute'))"), 'ResearchReportRoute source lazy import missing');

  const assetDirectory = join(root, 'dist', 'assets');
  const assetFiles = readdirSync(assetDirectory, { withFileTypes: true }).filter((entry) => !entry.isDirectory());
  const zeroByteAssets = assetFiles.filter((entry) => statSync(join(assetDirectory, entry.name)).size === 0);
  assert(zeroByteAssets.length === 0, `0-byte assets: ${zeroByteAssets.map((entry) => entry.name).join(', ')}`);
  const jsAssets = assetFiles.filter((entry) => entry.name.endsWith('.js'));
  const raw = statSync(entryPath).size;
  const gzip = gzipSync(readFileSync(entryPath), { level: 9 }).byteLength;
  assert(raw <= activeConfig.bundle.entryRawMaxBytes, `entry raw ${raw} exceeds budget ${activeConfig.bundle.entryRawMaxBytes}`);
  assert(gzip <= activeConfig.bundle.entryGzipMaxBytes, `entry gzip ${gzip} exceeds budget ${activeConfig.bundle.entryGzipMaxBytes}`);

  const distJsSource = jsAssets.map((asset) => readFileSync(join(assetDirectory, asset.name), 'utf8')).join('\n');
  assert(!/@xyflow\/react|\bReactFlow\b|전체 연결 보기|기업 연결 보기|시장지도 준비 중/.test(distJsSource), 'forbidden runtime string remains in dist JS');

  bundle = {
    entryAsset: basename(entryDefinition.file!),
    entryRawBytes: raw,
    entryGzipBytes: gzip,
    jsAssetCount: jsAssets.length,
    dynamicChunkCount: jsAssets.length - 1,
    zeroByteAssetCount: zeroByteAssets.length,
  };
  return `${bundle.entryAsset} raw=${raw}/${activeConfig.bundle.entryRawMaxBytes} gzip=${gzip}/${activeConfig.bundle.entryGzipMaxBytes}, dynamic=${bundle.dynamicChunkCount}`;
}

const scriptsCompileDuration = Number(process.env?.RELEASE_GATE_SCRIPTS_TSC_DURATION_MS ?? 0);
results.push({
  name: 'Scripts TypeScript',
  command: './node_modules/.bin/tsc -p tsconfig.scripts.json',
  status: 'passed',
  exitCode: 0,
  durationMs: scriptsCompileDuration,
  detail: 'compiled once by release gate wrapper',
});

runInline('Release configuration and inventory', 'config/release-gate.json', () => validateConfigInventory(config));
runAudit('npm audit', false);
runAudit('Production npm audit', true);

const compiledChecks: Array<[string, string]> = [
  ['Content validator', 'validate-content.js'],
  ['Node runtime unit', 'node-runtime-unit.js'],
  ['Dependency security unit', 'dependency-security-unit.js'],
  ['JavaScript bundle unit', 'javascript-bundle-unit.js'],
  ['Industry flow unit', 'industry-flow-unit.js'],
  ['Industry flow layout unit', 'industry-flow-layout-unit.js'],
  ['Market-map retirement unit', 'market-map-retirement-unit.js'],
  ['Company profile unit', 'company-profile-unit.js'],
  ['Company Brief unit', 'company-brief-unit.js'],
  ['Company dissection unit', 'company-dissection-unit.js'],
  ['Financial Pivot unit', 'financial-pivot-unit.js'],
  ['Valuation expectations unit', 'valuation-expectations-unit.js'],
  ['Event impact unit', 'event-impact-unit.js'],
  ['Analytics event unit', 'analytics-unit.js'],
  ['Company events unit', 'company-events-unit.js'],
  ['Demand-supply unit', 'demand-supply-unit.js'],
  ['Market relations unit', 'market-relations-unit.js'],
  ['Valuation engine unit', 'valuation-unit.js'],
  ['Research report unit', 'research-report-unit.js'],
  ['Monte Carlo valuation unit', 'monte-carlo-unit.js'],
  ['Editorial registry unit', 'editorial-unit.js'],
];
compiledChecks.forEach(([name, file]) => runCommand(name, nodeCommand, [join('.sync-build', 'scripts', file)]));
runCommand('Application TypeScript', './node_modules/.bin/tsc', ['--noEmit']);

rmSync(join(root, 'dist'), { recursive: true, force: true });
runCommand('Production build with manifest', './node_modules/.bin/vite', ['build', '--manifest']);
runInline('Bundle, manifest, lazy routes, and forbidden dist strings', 'analyze dist/.vite/manifest.json', () => validateBundle(config));

const commitResult = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
const npmVersionResult = spawnSync('npm', ['--version'], { cwd: root, encoding: 'utf8' });
const failures = results.filter((result) => result.status === 'failed');
const status = failures.length ? 'failed' : 'passed';
const summary = {
  timestamp: new Date().toISOString(),
  commit: commitResult.stdout?.trim() || 'unknown',
  nodeVersion: process.version ?? process.versions?.node ?? 'unknown',
  npmVersion: npmVersionResult.stdout?.trim() || 'unknown',
  fixture,
  audit: { total: auditTotal, productionTotal: productionAuditTotal },
  bundle: bundle ? {
    ...bundle,
    entryRawBudgetBytes: config.bundle.entryRawMaxBytes,
    entryGzipBudgetBytes: config.bundle.entryGzipMaxBytes,
  } : null,
  function: config.function,
  content: { expected: config.content, actual: actualContent },
  checkCount: results.length,
  durationMs: durationSince(startedAt) + scriptsCompileDuration,
  status,
  failures: failures.map((result) => `${result.name}: ${result.detail}`),
  checks: results,
};

mkdirSync(join(root, 'artifacts'), { recursive: true });
writeFileSync(join(root, 'artifacts', 'release-gate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

const resultRows = results.map((result) => `| ${result.name} | ${result.status === 'passed' ? 'PASS' : 'FAIL'} | ${result.exitCode} | ${result.durationMs}ms | ${result.detail.replaceAll('|', '\\|').replaceAll('\n', ' ')} |`).join('\n');
const contentRows = Object.entries(actualContent).map(([key, value]) => `| ${key} | ${value} | ${config.content[key as keyof typeof config.content]} |`).join('\n');
const markdown = `## Release Gate\n\n- Commit: \`${summary.commit}\`\n- Node: \`${summary.nodeVersion}\`\n- npm: \`${summary.npmVersion}\`\n- npm audit: **${auditTotal}** / production **${productionAuditTotal}**\n- Final status: **${status.toUpperCase()}**\n- Duration: **${summary.durationMs}ms**\n\n### Checks\n\n| Check | Result | Exit | Duration | Detail |\n| --- | --- | ---: | ---: | --- |\n${resultRows}\n\n### Bundle budget\n\n| Entry | Raw | Raw budget | Gzip | Gzip budget | Dynamic chunks | Zero-byte assets |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |\n| ${bundle?.entryAsset ?? 'unavailable'} | ${bundle?.entryRawBytes ?? '-'} | ${config.bundle.entryRawMaxBytes} | ${bundle?.entryGzipBytes ?? '-'} | ${config.bundle.entryGzipMaxBytes} | ${bundle?.dynamicChunkCount ?? '-'} | ${bundle?.zeroByteAssetCount ?? '-'} |\n\n### Inventory\n\n- Functions: **${config.function.entrypoints.length}/${config.function.count}**, runtime \`${config.function.runtime}\`, expected deployed memory ${config.function.memoryMb}MB, max duration ${config.function.maxDurationSeconds}s\n- Lazy route groups: **${config.lazyRoutes.length}**\n\n| Content | Actual | Expected |\n| --- | ---: | ---: |\n${contentRows}\n${failures.length ? `\n### Failures\n\n${failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n')}\n` : ''}`;
writeFileSync(join(root, 'artifacts', 'release-gate-summary.md'), markdown, 'utf8');

console.log(`Release gate ${status}: ${results.length} checks in ${summary.durationMs}ms`);
if (failures.length) process.exit?.(1);
