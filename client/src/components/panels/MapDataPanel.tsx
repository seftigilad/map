import { useMemo } from 'react';
import Panel from './Panel';
import SymbolPreview from '../SymbolPreview';
import { formatCoord, polygonCenter } from '../../utils/geo';
import type { ItemKind, MapObject, MapPolygon, Selection, SymbolId } from '../../types';

interface Row {
  kind: ItemKind;
  id: string;
  name: string;
  symbol?: SymbolId;
  detail?: string;
  lat: number;
  lon: number;
}

/** Builds table rows from saved polygons (center point) and saved objects. */
function buildRows(polygons: MapPolygon[], objects: MapObject[]): Row[] {
  return [
    ...polygons.map((p): Row => {
      const [lat, lon] = polygonCenter(p.latlngs);
      return { kind: 'polygon', id: p.id, name: p.name, detail: `${p.latlngs.length} vertices · center`, lat, lon };
    }),
    ...objects.map(
      (o): Row => ({ kind: 'object', id: o.id, name: o.name, symbol: o.symbol, lat: o.latlng[0], lon: o.latlng[1] }),
    ),
  ];
}

interface MapDataPanelProps {
  polygons: MapPolygon[];
  objects: MapObject[];
  selection: Selection | null;
  busy: boolean;
  onRowClick: (kind: ItemKind, id: string) => void;
  onRefresh: () => void;
}

/**
 * Table of persisted map data (Object / Lat / Lon). Updated from the server after every Save.
 * Clicking a row selects the item and pans the map to it.
 */
export default function MapDataPanel({ polygons, objects, selection, busy, onRowClick, onRefresh }: MapDataPanelProps) {
  const rows = useMemo(() => buildRows(polygons, objects), [polygons, objects]);

  return (
    <Panel
      number={4}
      title="Map Data"
      className="panel--data"
      actions={
        <button type="button" className="btn btn--small" onClick={onRefresh} disabled={busy} title="Reload from server">
          Refresh
        </button>
      }
    >
      <div className="data-table__scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Object</th>
              <th scope="col">Lat</th>
              <th scope="col">Lon</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="data-table__empty">
                  No saved data yet. Add items and press Save.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const selected = selection?.kind === row.kind && selection.id === row.id;
                return (
                  <tr
                    key={`${row.kind}:${row.id}`}
                    className={selected ? 'is-selected' : ''}
                    onClick={() => onRowClick(row.kind, row.id)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(row.kind, row.id)}
                  >
                    <td>
                      <div className="data-table__object">
                        {row.symbol ? (
                          <SymbolPreview symbol={row.symbol} />
                        ) : (
                          <span className="polygon-swatch" aria-hidden="true" />
                        )}
                        <div>
                          <div className="data-table__name">{row.name}</div>
                          {row.detail && <div className="data-table__detail">{row.detail}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="data-table__num">{formatCoord(row.lat)}</td>
                    <td className="data-table__num">{formatCoord(row.lon)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
