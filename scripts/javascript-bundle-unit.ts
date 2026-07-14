import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`javascript bundle unit failed: ${label}`);
}

const root = process.cwd();
const appSource = readFileSync(join(root, 'src', 'App.tsx'), 'utf8');
const boundarySource = readFileSync(join(root, 'src', 'routes', 'RouteBoundary.tsx'), 'utf8');
const companiesSource = readFileSync(join(root, 'src', 'routes', 'CompaniesRoute.tsx'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { engines?: { node?: string } };
const viteSource = readFileSync(join(root, 'vite.config.ts'), 'utf8');

const routeLazyImports = [...appSource.matchAll(/lazy\(\(\) => import\('(\.\/routes\/[A-Za-z]+Route)'\)\)/g)].map((match) => match[1]);
const expectedRouteImports = [
  './routes/CompaniesRoute',
  './routes/CompanyEventsRoute',
  './routes/DemandSupplyRoute',
  './routes/DisclosuresRoute',
  './routes/MacroDashboardRoute',
  './routes/MarketRelationsRoute',
];

check(JSON.stringify(routeLazyImports.sort()) === JSON.stringify(expectedRouteImports.sort()), 'exactly six selected route groups use React.lazy');
check(new Set(routeLazyImports).size === routeLazyImports.length, 'route lazy loader duplicates are zero');
check(/function LandingPage\(/.test(appSource) && /<LandingPage/.test(appSource), 'home route remains eager');
check(/function PrimaryNavigation\(/.test(appSource), 'header and primary navigation remain eager');
check(!/lazy\([^\n]*Home|import\(['"][^'"]*HomeRoute/.test(appSource), 'home route is not lazy');
check(/role="status"/.test(boundarySource) && /aria-live="polite"/.test(boundarySource), 'route loading fallback is announced politely');
check(/페이지를 불러오는 중입니다\./.test(boundarySource), 'shared Korean loading copy remains');
check(/페이지 파일을 불러오지 못했습니다\./.test(boundarySource), 'route import error UI remains');
check((companiesSource.match(/import\(.*company/gi) ?? []).length === 0, 'company slugs do not create separate dynamic imports');
check(/companyResearchProfileList/.test(companiesSource) && /buildCompanyResearchProfile/.test(companiesSource), 'company route selectors stay in the company route group');
check(!/chunkSizeWarningLimit/.test(viteSource), 'chunkSizeWarningLimit is not raised');
check(!/manualChunks/.test(viteSource), 'manualChunks are not used');
check(!/onPointerEnter|onMouseEnter|touchstart|routeLoaders|preloadRoute/.test(appSource), 'initial or intent route preload is not added');
check(!/@xyflow\/react|ReactFlow/.test(appSource), 'ReactFlow runtime import remains absent');
check(packageJson.engines?.node === '22.x', 'Node engine remains 22.x');

function collectFunctionEntries(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '_lib') return [];
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return collectFunctionEntries(absolute);
    return /\.(?:js|ts)$/.test(entry.name) ? [absolute] : [];
  });
}

check(collectFunctionEntries(join(root, 'api')).length === 12, 'Serverless Function entrypoint count remains 12');

const distIndex = join(root, 'dist', 'index.html');
if (existsSync(distIndex)) {
  const html = readFileSync(distIndex, 'utf8');
  const entryPath = html.match(/<script[^>]+src="\/?([^"]+\.js)"/)?.[1];
  check(Boolean(entryPath), 'built entry asset is discoverable');
  if (entryPath) {
    const entryRaw = statSync(join(root, 'dist', entryPath)).size;
    check(entryRaw <= 787_568, `entry raw size keeps the audited 100KB reduction: ${entryRaw}`);
  }
}

console.log(`✓ JavaScript bundle unit ${checks}개 검증`);
