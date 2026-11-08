import Panel from './Panel';
import SymbolPreview from '../SymbolPreview';
import { MODES, SYMBOLS } from '../../map/constants';

/**
 * Object management: choose a symbol (Marker / Jeep), Add (placement mode),
 * Save (POST the list of drafts) and Delete (selected object).
 */
export default function ObjectsPanel({
  mode,
  symbol,
  savedCount,
  draftCount,
  selectedObject,
  busy,
  onSymbolChange,
  onToggleAdd,
  onSave,
  onDelete,
}) {
  const adding = mode === MODES.ADD_OBJECT;

  return (
    <Panel
      number={3}
      title="Objects"
      meta={`${savedCount} saved${draftCount ? ` · ${draftCount} unsaved` : ''}`}
    >
      <div className="symbol-picker" role="radiogroup" aria-label="Object symbol">
        {SYMBOLS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={symbol === s.id}
            className={`symbol-picker__option ${symbol === s.id ? 'is-checked' : ''}`}
            onClick={() => onSymbolChange(s.id)}
          >
            <SymbolPreview symbol={s.id} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="button-row">
        <button type="button" className={`btn ${adding ? 'btn--active' : 'btn--primary'}`} onClick={onToggleAdd}>
          {adding ? 'Done' : 'Add'}
        </button>
        <button type="button" className="btn" onClick={onSave} disabled={busy || draftCount === 0}>
          Save{draftCount > 0 && ` (${draftCount})`}
        </button>
        <button type="button" className="btn btn--danger" onClick={onDelete} disabled={busy || !selectedObject}>
          Delete
        </button>
      </div>
      <p className="panel__hint">
        {adding
          ? 'Click on the map to place objects.'
          : selectedObject
            ? `Selected: ${selectedObject.name}${selectedObject.saved ? '' : ' (unsaved)'}`
            : 'Click an object on the map to select it.'}
      </p>
    </Panel>
  );
}
