import Panel from './Panel';
import { MODES } from '../../map/constants';

/**
 * Polygon management: Add (draw mode), Save (POST drafts), Delete (selected), Delete all.
 */
export default function PolygonPanel({
  mode,
  savedCount,
  draftCount,
  selectedPolygon,
  busy,
  onToggleDraw,
  onSave,
  onDelete,
  onDeleteAll,
}) {
  const drawing = mode === MODES.DRAW_POLYGON;

  return (
    <Panel
      number={2}
      title="Polygon"
      meta={`${savedCount} saved${draftCount ? ` · ${draftCount} unsaved` : ''}`}
    >
      <div className="button-row">
        <button type="button" className={`btn ${drawing ? 'btn--active' : 'btn--primary'}`} onClick={onToggleDraw}>
          {drawing ? 'Cancel' : 'Add'}
        </button>
        <button type="button" className="btn" onClick={onSave} disabled={busy || draftCount === 0}>
          Save{draftCount > 0 && ` (${draftCount})`}
        </button>
        <button type="button" className="btn btn--danger" onClick={onDelete} disabled={busy || !selectedPolygon}>
          Delete
        </button>
        <button
          type="button"
          className="btn btn--danger-ghost"
          onClick={onDeleteAll}
          disabled={busy || savedCount + draftCount === 0}
        >
          Delete all
        </button>
      </div>
      <p className="panel__hint">
        {drawing
          ? 'Drawing… click the first point to close the polygon.'
          : selectedPolygon
            ? `Selected: ${selectedPolygon.name}${selectedPolygon.saved ? '' : ' (unsaved)'}`
            : 'Click a polygon on the map to select it.'}
      </p>
    </Panel>
  );
}
