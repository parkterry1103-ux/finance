import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { ArrowRight, X } from 'lucide-react';
import {
  companyDissectionAxisKeys,
  companyDissectionStateLabels,
  type CompanyDissectionAxis,
  type CompanyDissectionAxisKey,
  type CompanyDissectionModel,
} from '../../content/company-dissections/index.js';

type Props = {
  companyName: string;
  model: CompanyDissectionModel;
  onNavigate: (path: string) => void;
};

const center = { x: 180, y: 174 };
const maximumRadius = 126;

function pointFor(index: number, ratio: number) {
  const angle = (-90 + index * 72) * Math.PI / 180;
  return {
    x: center.x + Math.cos(angle) * maximumRadius * ratio,
    y: center.y + Math.sin(angle) * maximumRadius * ratio,
  };
}

function polygonPoints(ratio: number) {
  return companyDissectionAxisKeys.map((_, index) => {
    const point = pointFor(index, ratio);
    return `${point.x},${point.y}`;
  }).join(' ');
}

function detailPath(companySlug: string, axis: CompanyDissectionAxis) {
  if (axis.detailSurface === 'valuation') return `/ko/companies/${companySlug}/valuation`;
  if (axis.detailSurface === 'report') return `/ko/companies/${companySlug}/report`;
  return `/ko/companies/${companySlug}/financials`;
}

function detailLabel(axis: CompanyDissectionAxis) {
  if (axis.detailSurface === 'valuation') return '시장가격에 반영된 기대 보기';
  if (axis.detailSurface === 'report') return '장기 기업 판단 보기';
  return '숫자와 비교 보기';
}

function AxisPanel({
  axis,
  companySlug,
  onNavigate,
  mobile,
  onClose,
  panelRef,
  closeRef,
}: {
  axis: CompanyDissectionAxis;
  companySlug: string;
  onNavigate: (path: string) => void;
  mobile: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement>;
  closeRef: RefObject<HTMLButtonElement>;
}) {
  const path = detailPath(companySlug, axis);
  return <div
    className={`company-dissection-panel${mobile ? ' company-dissection-sheet' : ''}`}
    role={mobile ? 'dialog' : 'region'}
    aria-modal={mobile || undefined}
    aria-labelledby="company-dissection-panel-title"
    ref={panelRef}
  >
    <header>
      <div><span>선택한 축</span><h3 id="company-dissection-panel-title">{axis.label}</h3></div>
      {mobile ? <button ref={closeRef} type="button" onClick={onClose} aria-label={`${axis.label} 상세 닫기`}><X size={20} aria-hidden="true" /></button> : null}
    </header>
    <dl className="company-dissection-panel-summary">
      <div><dt>현재 상태</dt><dd>{axis.statusLabel} · {companyDissectionStateLabels[axis.state]}</dd></div>
      <div><dt>근거</dt><dd>{axis.evidenceValue}</dd></div>
      <div><dt>비교 기준</dt><dd>{axis.comparison.label}</dd></div>
      <div><dt>기준 기간</dt><dd>{axis.period.replace(/-/g, '.')}</dd></div>
    </dl>
    <div className="company-dissection-interpretation"><strong>쉬운 해석</strong><p>{axis.interpretation}</p></div>
    {axis.key === 'moat' ? <div className="company-dissection-moat-evidence">
      <div><strong>확인된 해자 근거</strong><ul>{axis.moatEvidence?.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div><strong>약화 가능성</strong><ul>{axis.weakeningRisks?.map((item) => <li key={item}>{item}</li>)}</ul></div>
    </div> : null}
    <div className="company-dissection-next"><strong>다음 확인</strong><p>{axis.nextCheck}</p></div>
    <a href={path} onClick={(event) => { event.preventDefault(); onNavigate(path); }}>{detailLabel(axis)} <ArrowRight size={15} aria-hidden="true" /></a>
  </div>;
}

export function CompanyDissectionRadar({ companyName, model, onNavigate }: Props) {
  const [selectedKey, setSelectedKey] = useState<CompanyDissectionAxisKey>('growth');
  const [mobile, setMobile] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const buttonRefs = useRef<Partial<Record<CompanyDissectionAxisKey, HTMLButtonElement | null>>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const selectedAxis = model.axes[selectedKey];

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!mobile || !sheetOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobile, sheetOpen]);

  const dataPoints = useMemo(() => companyDissectionAxisKeys.map((key, index) => {
    const position = model.axes[key].position;
    return pointFor(index, position === null ? 0.14 : position / 5);
  }), [model]);

  const selectAxis = (key: CompanyDissectionAxisKey) => {
    setSelectedKey(key);
    if (mobile) setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    window.requestAnimationFrame(() => buttonRefs.current[selectedKey]?.focus());
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!mobile || !sheetOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSheet();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])') ?? [])];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return <section className="company-dissection-section" aria-labelledby="company-dissection-title">
    <div className="company-dashboard-section-heading"><span>구조적 상태</span><h2 id="company-dissection-title">오각형 기업 해부</h2><p>축을 선택하면 사용한 비교 기준과 다음 확인 항목을 볼 수 있습니다. 다섯 축을 합산한 투자 점수는 만들지 않습니다.</p></div>
    <div className="company-dissection-layout">
      <figure className="company-dissection-radar" aria-labelledby="company-dissection-figure-title">
        <figcaption id="company-dissection-figure-title">{companyName}의 성장성·수익성·해자·재무건전성·밸류에이션</figcaption>
        <svg viewBox="0 0 360 350" role="img" aria-label={`${companyName} 기업 해부. 확인 부족 축은 중간값으로 대체하지 않고 안쪽의 빈 점으로 표시합니다.`}>
          {[0.2, 0.4, 0.6, 0.8, 1].map((ratio) => <polygon key={ratio} points={polygonPoints(ratio)} className="company-radar-grid" />)}
          {companyDissectionAxisKeys.map((key, index) => {
            const outer = pointFor(index, 1);
            return <line key={key} x1={center.x} y1={center.y} x2={outer.x} y2={outer.y} className="company-radar-spoke" />;
          })}
          <polygon points={dataPoints.map((point) => `${point.x},${point.y}`).join(' ')} className="company-radar-shape" />
          {dataPoints.map((point, index) => {
            const axis = model.axes[companyDissectionAxisKeys[index]];
            return <circle key={axis.key} cx={point.x} cy={point.y} r="6" className={axis.position === null ? 'company-radar-point is-missing' : 'company-radar-point'} />;
          })}
        </svg>
        <div className="company-radar-controls">
          {companyDissectionAxisKeys.map((key, index) => {
            const axis = model.axes[key];
            const point = pointFor(index, 1.04);
            return <button
              type="button"
              key={key}
              ref={(node) => { buttonRefs.current[key] = node; }}
              className={selectedKey === key ? 'is-selected' : ''}
              aria-pressed={selectedKey === key}
              aria-label={`${axis.label}, ${axis.statusLabel}, ${companyDissectionStateLabels[axis.state]} 상세 보기`}
              style={{ left: `${(point.x / 360) * 100}%`, top: `${(point.y / 350) * 100}%` }}
              onClick={() => selectAxis(key)}
            ><span>{axis.label}</span><small>{companyDissectionStateLabels[axis.state]}</small></button>;
          })}
        </div>
        <p className="company-radar-legend"><span aria-hidden="true">○</span> 확인 부족은 임의의 중간값이 아니라 별도 빈 점으로 표시합니다.</p>
      </figure>
      {!mobile ? <AxisPanel axis={selectedAxis} companySlug={model.companySlug} onNavigate={onNavigate} mobile={false} onClose={closeSheet} panelRef={panelRef} closeRef={closeRef} /> : null}
    </div>
    {mobile && sheetOpen ? <div className="company-dissection-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeSheet(); }}>
      <div onKeyDown={handlePanelKeyDown}>
        <AxisPanel axis={selectedAxis} companySlug={model.companySlug} onNavigate={onNavigate} mobile onClose={closeSheet} panelRef={panelRef} closeRef={closeRef} />
      </div>
    </div> : null}
  </section>;
}
