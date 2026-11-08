import { useEffect, useMemo, useState } from 'react';
import { isMockApi } from './api';
import { useMapData, isDraftId } from './hooks/useMapData';
import { MODES, SYMBOLS } from './map/constants';
import MapView from './components/map/MapView';
import Panel from './components/panels/Panel';
import PolygonPanel from './components/panels/PolygonPanel';
import ObjectsPanel from './components/panels/ObjectsPanel';
import MapDataPanel from './components/panels/MapDataPanel';
import StatusToast from './components/StatusToast';

/**
 * Root component. Owns UI state (interaction mode, selected item, chosen symbol)
 * and wires the map and the side panels to the data hook.
 *
 * Layout: [1 Map] on the left; [2 Polygon], [3 Objects], [4 Map Data] stacked on the right.
 */
export default function App() {
  const data = useMapData();
  const [mode, setMode] = useState(MODES.IDLE);
  const [symbol, setSymbol] = useState(SYMBOLS[0].id);
  /** @type {[{ kind: 'polygon' | 'object', id: string } | null, Function]} */
  const [selection, setSelection] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);

  const allPolygons = useMemo(() => [...data.polygons, ...data.draftPolygons], [data.polygons, data.draftPolygons]);
  const allObjects = useMemo(() => [...data.objects, ...data.draftObjects], [data.objects, data.draftObjects]);

  const selectedPolygon = selection?.kind === 'polygon' ? allPolygons.find((p) => p.id === selection.id) : null;
  const selectedObject = selection?.kind === 'object' ? allObjects.find((o) => o.id === selection.id) : null;

  // Esc leaves any drawing / placement mode.
  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && setMode(MODES.IDLE);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleMode = (target) => setMode((current) => (current === target ? MODES.IDLE : target));

  /** Clears the selection if it points at a draft of the given kind (drafts get new ids once saved). */
  const dropDraftSelection = (kind) =>
    setSelection((s) => (s?.kind === kind && isDraftId(s.id) ? null : s));

  // ---------- Map events ----------

  const handleMapClick = (latlng) => {
    if (mode === MODES.ADD_OBJECT) {
      const object = data.addDraftObject(symbol, latlng);
      setSelection({ kind: 'object', id: object.id });
    } else if (mode === MODES.IDLE) {
      setSelection(null);
    }
  };

  const handlePolygonComplete = (latlngs) => {
    const polygon = data.addDraftPolygon(latlngs);
    setMode(MODES.IDLE);
    setSelection({ kind: 'polygon', id: polygon.id });
  };

  // ---------- Polygon actions ----------

  const handleSavePolygons = async () => {
    if (await data.savePolygons()) dropDraftSelection('polygon');
  };

  const handleDeletePolygon = async () => {
    if (selectedPolygon && (await data.deletePolygon(selectedPolygon.id))) setSelection(null);
  };

  const handleDeleteAllPolygons = async () => {
    if (!window.confirm('Delete ALL polygons from the map and the database?')) return;
    if (await data.deleteAllPolygons()) setSelection((s) => (s?.kind === 'polygon' ? null : s));
  };

  // ---------- Object actions ----------

  const handleSaveObjects = async () => {
    if (await data.saveObjects()) dropDraftSelection('object');
  };

  const handleDeleteObject = async () => {
    if (selectedObject && (await data.deleteObject(selectedObject.id))) setSelection(null);
  };

  // ---------- Table ----------

  const handleRowClick = (kind, id) => {
    setSelection({ kind, id });
    const item = kind === 'polygon' ? allPolygons.find((p) => p.id === id) : allObjects.find((o) => o.id === id);
    if (!item) return;
    // A fresh object each time so clicking the same row twice still re-centers the map.
    setFocusTarget(kind === 'polygon' ? { latlngs: item.latlngs } : { latlng: item.latlng });
  };

  return (
    <div className="app">
      <main className="app__map">
        <Panel
          number={1}
          title="Map"
          className="panel--map"
          meta={isMockApi ? 'Mock API (local storage)' : undefined}
        >
          <MapView
            mode={mode}
            polygons={allPolygons}
            objects={allObjects}
            selection={selection}
            focusTarget={focusTarget}
            onMapClick={handleMapClick}
            onPolygonComplete={handlePolygonComplete}
            onSelect={setSelection}
            onMoveObject={data.moveDraftObject}
          />
          <StatusToast
            busy={data.busy}
            error={data.error}
            notice={data.notice}
            onDismissError={data.clearError}
            onDismissNotice={data.clearNotice}
          />
        </Panel>
      </main>

      <aside className="app__sidebar">
        <PolygonPanel
          mode={mode}
          savedCount={data.polygons.length}
          draftCount={data.draftPolygons.length}
          selectedPolygon={selectedPolygon}
          busy={data.busy}
          onToggleDraw={() => toggleMode(MODES.DRAW_POLYGON)}
          onSave={handleSavePolygons}
          onDelete={handleDeletePolygon}
          onDeleteAll={handleDeleteAllPolygons}
        />
        <ObjectsPanel
          mode={mode}
          symbol={symbol}
          savedCount={data.objects.length}
          draftCount={data.draftObjects.length}
          selectedObject={selectedObject}
          busy={data.busy}
          onSymbolChange={setSymbol}
          onToggleAdd={() => toggleMode(MODES.ADD_OBJECT)}
          onSave={handleSaveObjects}
          onDelete={handleDeleteObject}
        />
        <MapDataPanel
          polygons={data.polygons}
          objects={data.objects}
          selection={selection}
          busy={data.busy}
          onRowClick={handleRowClick}
          onRefresh={data.reload}
        />
      </aside>
    </div>
  );
}
