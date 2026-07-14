import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  macroBriefTrendLabels,
  macroDomainBriefs,
  macroDomainLabels,
  macroIndicatorById,
  type MacroIndicatorDefinition,
  type MacroIndicatorsResponse,
} from '../../content/macro/index.js';
import { fetchMacroIndicators } from '../../services/macro.js';
import { MacroSparkline } from './MacroSparkline.js';
import { homeMacroReferences } from '../../content/home/index.js';

function dateLabel(date: string, frequency?: MacroIndicatorDefinition['frequency']) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return frequency === 'monthly' ? date.slice(0, 7).replace('-', '.') : date.split('-').join('.');
}

export function MacroDomainSummaryCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`macro-summary-grid${compact ? ' is-compact' : ''}`}>
      {macroDomainBriefs.map((brief) => (
        <article key={brief.id}>
          <span>{macroDomainLabels[brief.domain]}</span>
          <h3>{brief.state}</h3>
          <em className={`trend-${brief.trend}`}>{macroBriefTrendLabels[brief.trend]}</em>
          <p>{brief.summary}</p>
          <small>해설 기준 {dateLabel(brief.asOf)} · 검토 {dateLabel(brief.reviewedAt)}</small>
        </article>
      ))}
    </div>
  );
}

export function HomeMacroDashboard({ onOpen }: { onOpen?: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [response, setResponse] = useState<MacroIndicatorsResponse | null>(null);
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: '160px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!shouldLoad) return;
    let active = true;
    fetchMacroIndicators().then((result) => {
      if (active) setResponse(result);
    });
    return () => { active = false; };
  }, [shouldLoad]);
  const byId = useMemo(() => new Map((response?.series ?? []).map((series) => [series.id, series])), [response]);

  return (
    <div className="home-macro-section" aria-labelledby="home-macro-title" ref={rootRef}>
      <div className="beginner-section-head">
        <div>
          <p>돈의 흐름</p>
          <h2 id="home-macro-title">돈의 흐름과 경기</h2>
          <span>금리·유동성·산업 수요</span>
        </div>
        <a href="/ko/macro-dashboard" onClick={(event) => {
          if (!onOpen) return;
          event.preventDefault();
          onOpen();
        }}>지표 전체 보기 <ArrowRight size={15} /></a>
      </div>
      <p className="beginner-section-lead">네 가지 배경을 먼저 보고, 필요할 때 세부 지표를 펼쳐 확인하세요.</p>
      <div className="home-macro-beginner-grid" aria-busy={shouldLoad && response === null}>
        {homeMacroReferences.map((reference) => {
          const brief = macroDomainBriefs.find((entry) => entry.id === reference.briefId);
          const definition = macroIndicatorById(reference.indicatorId);
          const series = definition ? byId.get(definition.id) : undefined;
          if (!brief) return null;
          return (
            <article key={reference.id}>
              <div><span>{reference.easyLabel}</span><em className={`trend-${brief.trend}`}>{macroBriefTrendLabels[brief.trend]}</em></div>
              <h3>{brief.state}</h3>
              <p>{brief.summary}</p>
              {definition && series ? <MacroSparkline history={series.history} label={definition.label} /> : <div className="macro-sparkline-empty">{!shouldLoad ? '이 영역에 오면 추세를 불러옵니다.' : response === null ? '추세를 불러오는 중입니다.' : '현재 추세를 표시할 수 없습니다.'}</div>}
              <small>{definition?.label ?? '대표 지표'} · 해설 기준 {dateLabel(brief.asOf)}</small>
            </article>
          );
        })}
      </div>
    </div>
  );
}
