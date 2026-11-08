/**
 * Generic numbered panel used for the four areas of the layout (Map, Polygon, Objects, Map Data).
 */
export default function Panel({ number, title, meta, actions, className = '', children }) {
  return (
    <section className={`panel ${className}`} aria-labelledby={`panel-title-${number}`}>
      <header className="panel__header">
        <span className="panel__number">{number}</span>
        <h2 className="panel__title" id={`panel-title-${number}`}>
          {title}
        </h2>
        {meta && <span className="panel__meta">{meta}</span>}
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}
