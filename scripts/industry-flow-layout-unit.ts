import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`industry flow layout unit failed: ${label}`);
}

const styles = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8');
const component = readFileSync(join(process.cwd(), 'src', 'components', 'industry-flows', 'IndustryFlowCard.tsx'), 'utf8');
const flowStyles = styles.slice(styles.indexOf('/* Static industry flows shared by demand-supply, home, and company profiles. */'));

check(/container-name:\s*industry-flow-card/.test(flowStyles), 'named container');
check(/container-type:\s*inline-size/.test(flowStyles), 'inline-size container');
check(/\.industry-flow-detail-list\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s.test(flowStyles), 'detail list one column');
check(/@container industry-flow-card \(min-width:\s*960px\)/.test(flowStyles), 'five-column container breakpoint');
check(/\.industry-flow-card--detail \.industry-flow-steps\s*{[^}]*repeat\(5,\s*minmax\(140px,\s*1fr\)\)/s.test(flowStyles), 'five columns with minimum step width');
check(!/industry-flow[^}]*word-break:\s*break-all/s.test(flowStyles), 'no break-all');
check(!/industry-flow[^}]*overflow-wrap:\s*anywhere/s.test(flowStyles), 'no anywhere wrapping');
check(!/industry-flow[^}]*writing-mode\s*:/s.test(flowStyles), 'no writing mode');
check(!/industry-flow[^}]*(?:height|min-height):\s*(?:500|600)px/s.test(flowStyles), 'no excessive fixed height');
check(component.includes('<ol className="industry-flow-steps">'), 'semantic ordered list');
check(component.includes('className={`industry-flow-step'), 'semantic step items');
check(component.includes('industry-flow-step__meta') && component.includes('industry-flow-step__title') && component.includes('industry-flow-step__description'), 'step hierarchy markup');
check(component.includes("variant: IndustryFlowCardVariant"), 'explicit display variant');

console.log(`✓ 산업 흐름 layout unit ${checks}개 검증`);
