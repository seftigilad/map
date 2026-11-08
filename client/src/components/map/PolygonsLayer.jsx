import L from 'leaflet';
import { Polygon, Tooltip } from 'react-leaflet';
import { MODES, POLYGON_STYLES } from '../../map/constants';

function styleFor(polygon, selected) {
  if (selected) return POLYGON_STYLES.selected;
  return polygon.saved ? POLYGON_STYLES.saved : POLYGON_STYLES.draft;
}

/**
 * Renders saved and draft polygons.
 * In idle mode clicking a polygon selects it; in other modes the click bubbles
 * to the map so drawing / placing objects on top of polygons still works.
 */
export default function PolygonsLayer({ polygons, selectedId, mode, onSelect }) {
  return polygons.map((polygon) => (
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
  ));
}
