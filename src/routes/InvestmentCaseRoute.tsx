import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { editorialInternalLink, type EditorialNavigate } from '../components/editorial/EditorialUi.js';
import {
  investmentCaseStepCount,
  investmentCaseStepForKey,
} from '../content/investment-thinking/navigation.js';
import { investmentHypothesisById, investmentRuleById } from '../content/investment-thinking/rulebook.js';
import { loadInvestmentCase } from '../content/investment-thinking/registry.js';
import type { InvestmentCase, InvestmentCaseStep } from '../content/investment-thinking/types.js';
import { resolveSource } from '../content/sources/registry.js';
import { trackAnalyticsEvent } from '../analytics/index.js';

const stepLabels = ['사건', '가설', '판단'] as const;
const familiarityLabels = { high: '높음', medium: '중간', low: '낮음' } as const;

function dateLabel(value: string) {
  return value.replace(/-/g, '.');
}

function CaseSourceList({ item }: { item: InvestmentCase }) {
  return (
    <details className="thinking-lab-sources">
      <summary>공식 사업 근거 {item.sources.length}개 보기</summary>
      <ol>
        {item.sources.map((reference, index) => {
          const source = resolveSource(reference.sourceId);
          return (
            <li key={reference.sourceId}>
              <div><strong>{source.title}</strong><span>{reference.claimScope}</span></div>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${source.title} 공식 원문 새 창에서 열기`}
                onClick={() => trackAnalyticsEvent('editorial_source_open', {
                  contentType: 'investment_case', contentId: item.id, sourceType: source.kind, sourceOrder: index + 1, placement: 'editorial_body',
                })}
              >공식 원문 <ExternalLink size={14} aria-hidden="true" /></a>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

function EventScreen({ item }: { item: InvestmentCase }) {
  return (
    <section className="thinking-lab-slide" aria-labelledby="thinking-lab-slide-title">
      <div className="thinking-lab-slide-heading"><span>01 · 사건</span><h1 id="thinking-lab-slide-title">{item.title}</h1></div>
      <div className="thinking-lab-tags"><time dateTime={item.eventDate}>{dateLabel(item.eventDate)}</time>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <article className="thinking-lab-lead"><span>사건 메모 · 사용자 입력</span><p>{item.eventSummary}</p><small>정책 원문과 구체적인 지원 범위는 다음 검토에서 확인할 항목입니다.</small></article>
      <dl className="thinking-lab-thought-list">
        <div><dt>내가 왜 이걸 봤나</dt><dd>{item.whyICared}</dd></div>
        <div><dt>내가 이미 알고 있던 것</dt><dd>{item.familiarityNote}</dd></div>
        <div><dt>여기서 생길 수 있는 내 편향</dt><dd>{item.possibleBias}</dd></div>
      </dl>
    </section>
  );
}

function HypothesisScreen({ item }: { item: InvestmentCase }) {
  const hypothesis = investmentHypothesisById[item.hypothesisIds[0]];
  return (
    <section className="thinking-lab-slide" aria-labelledby="thinking-lab-slide-title">
      <div className="thinking-lab-slide-heading"><span>02 · 가설</span><h1 id="thinking-lab-slide-title">나는 시장이 이렇게 반응할 수 있다고 생각했다</h1></div>
      <article className="thinking-lab-lead"><span>가설 · {hypothesis?.id}</span><p>{item.hypothesis}</p><small>{hypothesis?.scopeNote}</small></article>
      <ol className="thinking-lab-flow" aria-label="가설의 영향 흐름">
        {item.impactFlow.map((entry, index) => <li key={entry}><span>{String(index + 1).padStart(2, '0')}</span><p>{entry}</p></li>)}
      </ol>
      <div className="thinking-lab-counter"><strong>반대로 흘러갈 수 있는 길</strong><ul>{item.counterFlow.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>
      {item.optionalLens ? <p className="thinking-lab-lens"><span>보조 렌즈</span>{item.optionalLens}</p> : null}
    </section>
  );
}

function JudgmentScreen({ item }: { item: InvestmentCase }) {
  return (
    <section className="thinking-lab-slide" aria-labelledby="thinking-lab-slide-title">
      <div className="thinking-lab-slide-heading"><span>03 · 판단</span><h1 id="thinking-lab-slide-title">지금 내가 먼저 보는 순서</h1><p>추천 순위가 아니라 내 가설을 검증하기 위한 관심 순서입니다.</p></div>
      <ol className="thinking-lab-subjects">
        {item.subjects.map((subject) => <li key={subject.name}>
          <div className="thinking-lab-subject-rank"><span>{String(subject.rank).padStart(2, '0')}</span><div><h2>{subject.name}</h2><p>{subject.ticker} · 익숙함 {familiarityLabels[subject.familiarity]}</p></div></div>
          <strong>{subject.currentView}</strong>
          <p>{subject.reason}</p>
          <div><span>주의할 점</span><p>{subject.caution}</p></div>
        </li>)}
      </ol>
      <aside className="thinking-lab-falsification" aria-labelledby="thinking-lab-falsification-title">
        <h2 id="thinking-lab-falsification-title">내가 틀렸다는 신호</h2>
        <ul>{item.falsificationSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
      </aside>
      <CaseSourceList item={item} />
    </section>
  );
}

export default function InvestmentCaseRoute({ slug, navigation, onNavigate }: { slug: string; navigation: ReactNode; onNavigate: EditorialNavigate }) {
  const [item, setItem] = useState<InvestmentCase | null | undefined>(undefined);
  const [step, setStep] = useState<InvestmentCaseStep>(0);
  const storyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    setItem(undefined);
    setStep(0);
    loadInvestmentCase(slug).then((loaded) => { if (active) setItem(loaded ?? null); }).catch(() => { if (active) setItem(null); });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!item) return;
    trackAnalyticsEvent('editorial_view', { contentType: 'investment_case', contentId: item.id }, { oncePerPage: true, dedupeKey: item.id });
  }, [item?.id]);

  const moveTo = (nextStep: InvestmentCaseStep) => {
    setStep(nextStep);
    window.requestAnimationFrame(() => storyRef.current?.focus());
  };
  const handleStoryKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) return;
    const nextStep = investmentCaseStepForKey(step, event.key);
    if (nextStep === step) return;
    event.preventDefault();
    moveTo(nextStep);
  };

  if (item === undefined) return <div className="pick-shell thinking-lab-shell">{navigation}<main className="editorial-route-state" role="status" aria-live="polite"><h1>생각 실험을 불러오는 중입니다.</h1></main></div>;
  if (!item) return <div className="pick-shell thinking-lab-shell">{navigation}<main className="editorial-route-state"><h1>공개된 생각 실험을 찾을 수 없습니다.</h1><p>사건·가설·반증 신호를 함께 기록한 Case만 표시합니다.</p><a href="/ko/" onClick={editorialInternalLink('/ko/', onNavigate)}>홈으로 이동</a></main></div>;

  const linkedRules = item.ruleIds.map((id) => investmentRuleById[id]).filter(Boolean);
  return (
    <div className="pick-shell thinking-lab-shell">
      {navigation}
      <main className="thinking-lab-main">
        <nav className="editorial-breadcrumb" aria-label="현재 위치"><a href="/ko/#thinking-lab" onClick={editorialInternalLink('/ko/#thinking-lab', onNavigate)}>Investment Thinking Lab</a><span aria-hidden="true">/</span><strong>Pilot #001</strong></nav>
        <article
          className="thinking-lab-story"
          ref={storyRef}
          tabIndex={0}
          onKeyDown={handleStoryKeyDown}
          aria-label={`Pilot #001 ${step + 1}단계 ${stepLabels[step]}`}
          aria-describedby="thinking-lab-keyboard-help"
        >
          <header className="thinking-lab-progress">
            <div><span>Investment Thinking Lab</span><strong>{String(step + 1).padStart(2, '0')} / {String(investmentCaseStepCount).padStart(2, '0')}</strong></div>
            <ol aria-label="Case 진행 단계">{stepLabels.map((label, index) => <li key={label}><button type="button" aria-current={step === index ? 'step' : undefined} onClick={() => moveTo(index as InvestmentCaseStep)}><span>{index + 1}</span><small>{label}</small></button></li>)}</ol>
            <p id="thinking-lab-keyboard-help">이 영역에서 ← →, Page Up·Down, Home·End 키로 이동할 수 있습니다.</p>
          </header>

          <div className="thinking-lab-screen" aria-live="polite">
            {step === 0 ? <EventScreen item={item} /> : step === 1 ? <HypothesisScreen item={item} /> : <JudgmentScreen item={item} />}
          </div>

          <footer className="thinking-lab-controls">
            <button type="button" onClick={() => moveTo((step - 1) as InvestmentCaseStep)} disabled={step === 0}><ArrowLeft size={18} aria-hidden="true" /> 이전</button>
            <span>{stepLabels[step]}을 읽고 다음 생각으로 이동합니다.</span>
            <button type="button" className="thinking-lab-next" onClick={() => moveTo((step + 1) as InvestmentCaseStep)} disabled={step === 2}>다음 <ArrowRight size={18} aria-hidden="true" /></button>
          </footer>
        </article>

        <aside className="thinking-lab-linked-rules" aria-labelledby="thinking-lab-linked-rules-title"><div><span>Rulebook v0.1</span><h2 id="thinking-lab-linked-rules-title">이 Case에서 사용한 현재 원칙</h2></div><ul>{linkedRules.map((rule) => <li key={rule.id}><strong>{rule.id}</strong><span>{rule.principle}</span></li>)}</ul><p>이 원칙은 절대 법칙이 아니며 다음 사례에서 수정될 수 있습니다.</p></aside>
        <p className="thinking-lab-disclaimer">이 기록은 투자 행동을 권하는 자료가 아니라 생각과 검증 과정을 공개하는 개인 리서치 노트입니다.</p>
      </main>
    </div>
  );
}
