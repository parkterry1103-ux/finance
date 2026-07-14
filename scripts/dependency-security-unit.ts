import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`dependency security unit failed: ${label}`);
}

type PackageDefinition = {
  version?: string;
  engines?: { node?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type PackageJson = PackageDefinition & {
  scripts?: Record<string, string>;
  overrides?: Record<string, unknown>;
  config?: Record<string, unknown>;
};

type PackageLock = {
  lockfileVersion?: number;
  packages?: Record<string, PackageDefinition>;
};

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as PackageJson;
const packageLock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8')) as PackageLock;
const auditDoc = readFileSync(join(root, 'docs', 'dependency-security-audit.md'), 'utf8');

function versionParts(version: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) throw new Error(`dependency security unit failed: invalid package version ${version}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function versionAtLeast(version: string, minimum: string): boolean {
  const actual = versionParts(version);
  const required = versionParts(minimum);
  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index] !== required[index]) return actual[index] > required[index];
  }
  return true;
}

function installedVersions(packageName: string): string[] {
  const suffix = `node_modules/${packageName}`;
  return Object.entries(packageLock.packages ?? {})
    .filter(([path, definition]) => (path === suffix || path.endsWith(`/${suffix}`)) && definition.version)
    .map(([, definition]) => definition.version as string);
}

function collectFunctionEntries(directory: string, relativeDirectory = 'api'): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '_lib') return [];
    const absolute = join(directory, entry.name);
    const relative = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) return collectFunctionEntries(absolute, relative);
    return /\.(?:js|ts)$/.test(entry.name) ? [relative] : [];
  });
}

const expectedDependencies = ['lucide-react', 'react', 'react-dom'];
const expectedDevDependencies = ['@types/react', '@types/react-dom', '@vitejs/plugin-react', 'typescript', 'vite'];
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

const runtimeMajor = Number.parseInt(
  (process as unknown as { versions: { node: string } }).versions.node.split('.')[0] ?? '',
  10,
);
const lockRoot = packageLock.packages?.[''];
const directDependencies = Object.keys(packageJson.dependencies ?? {}).sort();
const directDevDependencies = Object.keys(packageJson.devDependencies ?? {}).sort();
const viteVersions = installedVersions('vite');
const babelCoreVersions = installedVersions('@babel/core');
const esbuildVersions = installedVersions('esbuild');
const generatorVersions = installedVersions('@babel/generator');
const actualFunctions = collectFunctionEntries(join(root, 'api')).sort();

check(runtimeMajor === 22, `validator runs on Node 22, received ${runtimeMajor || 'unknown'}`);
check(packageJson.engines?.node === '22.x', 'package.json engines.node is exactly 22.x');
check(lockRoot?.engines?.node === '22.x', 'package-lock root engines.node is exactly 22.x');
check(packageLock.lockfileVersion === 3, 'lockfileVersion remains 3');
check(JSON.stringify(directDependencies) === JSON.stringify(expectedDependencies), 'production direct dependencies are unchanged');
check(JSON.stringify(directDevDependencies) === JSON.stringify(expectedDevDependencies), 'no direct dev dependency was added or removed');
check(packageJson.devDependencies?.vite === '^7.3.6', 'direct Vite range starts at the audited compatible patch');
check(!packageJson.devDependencies?.['@babel/core'], '@babel/core remains transitive');
check(!packageJson.devDependencies?.esbuild, 'esbuild remains transitive');
check(!packageJson.overrides || Object.keys(packageJson.overrides).length === 0, 'no dependency override is used');

check(viteVersions.length > 0 && viteVersions.every((version) => versionAtLeast(version, '7.3.5')), 'all installed Vite versions include both security fixes');
check(babelCoreVersions.length > 0 && babelCoreVersions.every((version) => versionAtLeast(version, '7.29.6')), 'all installed @babel/core versions include the source-map fix');
check(esbuildVersions.length > 0 && esbuildVersions.every((version) => versionAtLeast(version, '0.28.1')), 'all installed esbuild versions include the Windows servedir fix');
check(generatorVersions.length > 0 && generatorVersions.every((version) => versionAtLeast(version, '7.29.6')), '@babel/core uses its required generator patch');
check(packageLock.packages?.['node_modules/vite']?.dependencies?.esbuild === '^0.27.0 || ^0.28.0', 'Vite officially allows esbuild 0.28 without an override');

const configSources = [JSON.stringify(packageJson.scripts ?? {}), JSON.stringify(packageJson.config ?? {})];
for (const relativePath of ['.npmrc', join('.github', 'workflows', 'ci.yml'), join('.github', 'workflows', 'sync.yml')]) {
  const absolutePath = join(root, relativePath);
  if (existsSync(absolutePath)) configSources.push(readFileSync(absolutePath, 'utf8'));
}
const configSource = configSources.join('\n');
check(!/(?:^|\n)\s*audit\s*=\s*false\b/i.test(configSource), 'npm audit is not disabled');
check(!/(?:^|\n)\s*audit-level\s*=/i.test(configSource), 'no audit severity is hidden by configuration');
check(!/--audit(?:=|\s+)false\b/i.test(configSource), 'scripts do not disable audit');
check(!/npm\s+audit\s+fix[^\n;&|]*--force\b/i.test(configSource), 'scripts do not run npm audit fix --force');
check(!/npm\s+install[^\n;&|]*(?:--force|--legacy-peer-deps)\b/i.test(configSource), 'scripts do not bypass dependency resolution safety');

check(JSON.stringify(actualFunctions) === JSON.stringify(expectedFunctions), 'exactly 12 expected Serverless Function entrypoints remain');
for (const advisory of ['GHSA-4x5r-pxfx-6jf8', 'GHSA-g7r4-m6w7-qqqr', 'GHSA-v6wh-96g9-6wx3', 'GHSA-fx2h-pf6j-xcff']) {
  check(auditDoc.includes(advisory), `${advisory} is documented`);
}
check(auditDoc.includes('Vite 7.3.6') && auditDoc.includes('esbuild 0.28.1') && auditDoc.includes('@babel/core 7.29.6'), 'selected safe versions are documented');

console.log(`✓ 의존성 보안 unit ${checks}개 검증`);
