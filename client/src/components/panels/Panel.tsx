import type { ReactNode } from 'react';

interface PanelProps {
  number: number;
  title: string;
  /** Small text next to the title, e.g. item counts. */
  meta?: ReactNode;
  /** Controls aligned to the right of the header. */
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Generic numbered panel used for the four areas of the layout (Map, Polygon, Objects, Map Data).
 */
export default function Panel({ number, title, meta, actions, className = '', children }: PanelProps) {
  const titleId = `panel-title-${number}`;
  return (
    <section className={`panel ${className}`} aria-labelledby={titleId}>
      <header className="panel__header">
        <span className="panel__number">{number}</span>
        <h2 className="panel__title" id={titleId}>
          {title}
        </h2>
        {meta && <span className="panel__meta">{meta}</span>}
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}
