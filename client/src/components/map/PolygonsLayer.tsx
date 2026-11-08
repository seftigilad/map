import L from 'leaflet';
import { Polygon, Tooltip } from 'react-leaflet';
import { MODES, POLYGON_STYLES, type Mode } from '../../map/constants';
import type { MapPolygon } from '../../types';

interface PolygonsLayerProps {
  polygons: MapPolygon[];
  selectedId: string | null;
  mode: Mode;
  onSelect: (id: string) => void;
}

function styleFor(polygon: MapPolygon, selected: boolean): L.PathOptions {
  if (selected) return POLYGON_STYLES.selected;
  return polygon.saved ? POLYGON_STYLES.saved : POLYGON_STYLES.draft;
}

/**
 * Renders saved and draft polygons.
 * In idle mode clicking a polygon selects it; in other modes the click bubbles
 * to the map so drawing / placing objects on top of polygons still works.
 */
export default function PolygonsLayer({ polygons, selectedId, mode, onSelect }: PolygonsLayerProps) {
  return (
    <>
      {polygons.map((polygon) => (
        <Polygon
          key={polygon.id}
          positions={polygon.latlngs}
          pathOptions={styleFor(polygon, polygon.id === selectedId)}
          eventHandlers={{
            click: (e) => {
              if (mode !== MODES.IDLE) return;
              L.DomEvent.stopPropagation(e);
              onSelect(polygon.id);
            },
          }}
        >
          <Tooltip sticky>
            {polygon.name}
            {!polygon.saved && ' (unsaved)'}
          </Tooltip>
        </Polygon>
      ))}
    </>
  );
}
