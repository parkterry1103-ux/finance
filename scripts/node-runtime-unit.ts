import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
const vercelConfig = JSON.parse(vercelSource) as {
  functions?: Record<string, { runtime?: string }>;
};

const expectedFunctions = [
  'api/financials.ts',
  'api/market-disclosures.ts',
  'api/market-prices.js',
  'api/market-sec-filings.ts',
  'api/news.js',
  'api/ownership-trades.js',
  'api/sync/disclosures.ts',
  'api/sync/financials.ts',
  'api/sync/prices.ts',
  'api/sync/sec-filing-details.ts',
  'api/sync/sec-filings.ts',
  'api/sync/trades.ts',
];

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

check(runtimeMajor === 22, `validator runs on Node 22, received ${runtimeMajor || 'unknown'}`);
check(packageJson.engines?.node === '22.x', 'package.json engines.node is exactly 22.x');
check(packageLock.packages?.['']?.engines?.node === '22.x', 'package-lock root engines.node is exactly 22.x');
check(JSON.stringify(actualFunctions) === JSON.stringify(expectedFunctions), 'exactly 12 expected Function entrypoints remain');
check(!/nodejs(?:20|24)\.x|"node"\s*:\s*"(?:20|24)\.x"/.test(vercelSource), 'vercel.json has no conflicting Node 20/24 setting');
check(
  Object.values(vercelConfig.functions ?? {}).every((definition) => !definition.runtime || definition.runtime === 'nodejs22.x'),
  'explicit Function runtimes, if added, are nodejs22.x',
);
check(/node-version:\s*["']?22\.x/.test(ciWorkflowSource), 'CI workflow uses Node 22.x');
check(/node-version:\s*["']?22\.x/.test(syncWorkflowSource), 'sync workflow uses Node 22.x');
check(!/node-version:\s*["']?(?:20|24)(?:\.x)?/.test(`${ciWorkflowSource}\n${syncWorkflowSource}`), 'workflows have no Node 20/24 setting');

const apiSources = actualFunctions.map((file) => readFileSync(join(root, file), 'utf8')).join('\n');
check(!/process\.versions?(?:\.node)?|process\[['"]version/.test(apiSources), 'Function responses do not expose the Node runtime');
check(!actualFunctions.some((file) => /(?:runtime|debug|diagnostic)/i.test(file)), 'no public runtime diagnostic Function exists');

console.log(`✓ Node 22 runtime unit ${checks}개 검증`);
