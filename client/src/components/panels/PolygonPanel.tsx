import Panel from './Panel';
import { MODES, type Mode } from '../../map/constants';
import type { MapPolygon } from '../../types';

interface PolygonPanelProps {
  mode: Mode;
  savedCount: number;
  draftCount: number;
  selectedPolygon: MapPolygon | null;
  busy: boolean;
  onToggleDraw: () => void;
  onSave: () => void;
  onDelete: () => void;
  onDeleteAll: () => void;
}

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
}: PolygonPanelProps) {
  const drawing = mode === MODES.DRAW_POLYGON;

  let hint = 'Click a polygon on the map to select it.';
  if (drawing) hint = 'Drawing… click the first point to close the polygon.';
  else if (selectedPolygon) hint = `Selected: ${selectedPolygon.name}${selectedPolygon.saved ? '' : ' (unsaved)'}`;

  return (
    <Panel number={2} title="Polygon" meta={`${savedCount} saved${draftCount ? ` · ${draftCount} unsaved` : ''}`}>
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
      <p className="panel__hint">{hint}</p>
    </Panel>
  );
}
