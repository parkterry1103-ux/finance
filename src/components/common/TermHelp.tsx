import { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { beginnerTermRegistry, type BeginnerTermId } from '../../content/home/index.js';

type TermHelpProps = {
  termId: BeginnerTermId;
  label?: string;
};

export function TermHelp({ termId, label }: TermHelpProps) {
  const definition = beginnerTermRegistry[termId];
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const generatedId = useId();
  const panelId = `term-help-${generatedId.replace(/:/g, '')}`;

  useEffect(() => {
    if (!open) return;
    window.requestAnimationFrame(() => panelRef.current?.focus());
    const closeFromOutside = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('click', closeFromOutside);
    document.addEventListener('keydown', closeFromEscape);
    return () => {
      document.removeEventListener('click', closeFromOutside);
      document.removeEventListener('keydown', closeFromEscape);
    };
  }, [open]);

  return (
    <span className="term-help" ref={rootRef}>
      <button
        type="button"
        className="term-help__trigger"
        ref={buttonRef}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${definition.term} 뜻 보기`}
        onClick={() => setOpen((value) => !value)}
      >
        {label ? <span>{label}</span> : null}
        <HelpCircle size={15} aria-hidden="true" />
      </button>
      {open ? (
        <span className="term-help__panel" id={panelId} role="dialog" aria-label={`${definition.term} 설명`} ref={panelRef} tabIndex={-1}>
          <span className="term-help__head">
            <strong>{definition.term}</strong>
            <button type="button" aria-label="용어 설명 닫기" onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}><X size={15} aria-hidden="true" /></button>
          </span>
          <span>{definition.shortDefinition}</span>
          <small><b>왜 중요한가요?</b> {definition.whyItMatters}</small>
        </span>
      ) : null}
    </span>
  );
}
