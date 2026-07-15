import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadReleaseGateConfig } from './release-gate-config.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`node runtime unit failed: ${label}`);
}

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  engines?: { node?: string };
};
const packageLock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8')) as {
  packages?: Record<string, { engines?: { node?: string } }>;
};
const vercelSource = readFileSync(join(root, 'vercel.json'), 'utf8');
const ciWorkflowSource = readFileSync(join(root, '.github', 'workflows', 'ci.yml'), 'utf8');
const syncWorkflowSource = readFileSync(join(root, '.github', 'workflows', 'sync.yml'), 'utf8');
const smokeWorkflowSource = readFileSync(join(root, '.github', 'workflows', 'deployment-smoke.yml'), 'utf8');
const releaseConfig = loadReleaseGateConfig();
const vercelConfig = JSON.parse(vercelSource) as {
  functions?: Record<string, { runtime?: string; maxDuration?: number }>;
};

const expectedFunctions = releaseConfig.function.entrypoints;

function collectFunctionEntries(directory: string, relativeDirectory = 'api'): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '_lib') return [];
    const absolute = join(directory, entry.name);
    const relative = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) return collectFunctionEntries(absolute, relative);
    return /\.(?:js|ts)$/.test(entry.name) ? [relative] : [];
  });
}

const actualFunctions = collectFunctionEntries(join(root, 'api')).sort();
const runtimeMajor = Number.parseInt(
  (process as unknown as { versions: { node: string } }).versions.node.split('.')[0] ?? '',
  10,
);

check(runtimeMajor === releaseConfig.nodeMajor, `validator runs on Node ${releaseConfig.nodeMajor}, received ${runtimeMajor || 'unknown'}`);
check(packageJson.engines?.node === `${releaseConfig.nodeMajor}.x`, `package.json engines.node is exactly ${releaseConfig.nodeMajor}.x`);
check(packageLock.packages?.['']?.engines?.node === `${releaseConfig.nodeMajor}.x`, `package-lock root engines.node is exactly ${releaseConfig.nodeMajor}.x`);
check(actualFunctions.length === releaseConfig.function.count, `exactly ${releaseConfig.function.count} Function entrypoints remain`);
check(JSON.stringify(actualFunctions) === JSON.stringify(expectedFunctions), 'expected Function entrypoint inventory remains');
check(!/nodejs(?:20|24)\.x|"node"\s*:\s*"(?:20|24)\.x"/.test(vercelSource), 'vercel.json has no conflicting Node 20/24 setting');
check(
  Object.values(vercelConfig.functions ?? {}).every((definition) => !definition.runtime || definition.runtime === 'nodejs22.x'),
  'explicit Function runtimes, if added, are nodejs22.x',
);
check(
  Object.values(vercelConfig.functions ?? {}).length === 2
    && Object.values(vercelConfig.functions ?? {}).every((definition) => definition.maxDuration === releaseConfig.function.maxDurationSeconds),
  `Function globs keep maxDuration ${releaseConfig.function.maxDurationSeconds}s`,
);
check(/node-version:\s*["']?22\.x/.test(ciWorkflowSource), 'CI workflow uses Node 22.x');
check(/node-version:\s*["']?22\.x/.test(syncWorkflowSource), 'sync workflow uses Node 22.x');
check(/node-version:\s*["']?22\.x/.test(smokeWorkflowSource), 'deployment smoke workflow uses Node 22.x');
check(!/node-version:\s*["']?(?:20|24)(?:\.x)?/.test(`${ciWorkflowSource}\n${syncWorkflowSource}\n${smokeWorkflowSource}`), 'workflows have no Node 20/24 setting');

const apiSources = actualFunctions.map((file) => readFileSync(join(root, file), 'utf8')).join('\n');
check(!/process\.versions?(?:\.node)?|process\[['"]version/.test(apiSources), 'Function responses do not expose the Node runtime');
check(!actualFunctions.some((file) => /(?:runtime|debug|diagnostic)/i.test(file)), 'no public runtime diagnostic Function exists');

console.log(`✓ Node 22 runtime unit ${checks}개 검증`);
