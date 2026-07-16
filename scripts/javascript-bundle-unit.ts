import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadReleaseGateConfig } from './release-gate-config.js';

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
const releaseConfig = loadReleaseGateConfig();

const routeLazyImports = [...appSource.matchAll(/lazy\(\(\) => import\('(\.\/routes\/[A-Za-z]+Route)'\)\)/g)].map((match) => match[1]);
const expectedRouteImports = releaseConfig.lazyRoutes.map((route) => `./routes/${route.name}`);

check(JSON.stringify(routeLazyImports.sort()) === JSON.stringify(expectedRouteImports.sort()), 'exactly six selected route groups use React.lazy');
check(new Set(routeLazyImports).size === routeLazyImports.length, 'route lazy loader duplicates are zero');
check(/function LandingPage\(/.test(appSource) && /<LandingPage/.test(appSource), 'home route remains eager');
check(/function PrimaryNavigation\(/.test(appSource), 'header and primary navigation remain eager');
check(!/lazy\([^\n]*Home|import\(['"][^'"]*HomeRoute/.test(appSource), 'home route is not lazy');
check(/role="status"/.test(boundarySource) && /aria-live="polite"/.test(boundarySource), 'route loading fallback is announced politely');
check(/페이지를 불러오는 중입니다\./.test(boundarySource), 'shared Korean loading copy remains');
check(/페이지 파일을 불러오지 못했습니다\./.test(boundarySource), 'route import error UI remains');
check((companiesSource.match(/import\(.*company/gi) ?? []).length === 0, 'company slugs do not create separate dynamic imports');
check(/companySearchIndex/.test(companiesSource) && /buildCompanyResearchProfile/.test(companiesSource), 'company search and detail selectors stay in the company route group');
check(!/chunkSizeWarningLimit/.test(viteSource), 'chunkSizeWarningLimit is not raised');
check(!/manualChunks/.test(viteSource), 'manualChunks are not used');
check(!/onPointerEnter|onMouseEnter|touchstart|routeLoaders|preloadRoute/.test(appSource), 'initial or intent route preload is not added');
check(!/@xyflow\/react|ReactFlow/.test(appSource), 'ReactFlow runtime import remains absent');
check(packageJson.engines?.node === `${releaseConfig.nodeMajor}.x`, `Node engine remains ${releaseConfig.nodeMajor}.x`);

function collectFunctionEntries(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '_lib') return [];
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return collectFunctionEntries(absolute);
    return /\.(?:js|ts)$/.test(entry.name) ? [absolute] : [];
  });
}

check(collectFunctionEntries(join(root, 'api')).length === releaseConfig.function.count, `Serverless Function entrypoint count remains ${releaseConfig.function.count}`);

console.log(`✓ JavaScript bundle unit ${checks}개 검증`);
