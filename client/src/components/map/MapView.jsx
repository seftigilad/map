import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MODES } from '../../map/constants';
import PolygonDrawer from './PolygonDrawer';
import PolygonsLayer from './PolygonsLayer';
import ObjectsLayer from './ObjectsLayer';

const HINTS = {
  [MODES.DRAW_POLYGON]: 'Click to add vertices · click the first point to close · Esc to cancel',
  [MODES.ADD_OBJECT]: 'Click on the map to place objects · Esc to finish',
};

/** Forwards plain map clicks (not consumed by a layer) to the parent. */
function MapClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => onClick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

/** Pans/zooms the map to a target ({ latlngs } for polygons, { latlng } for objects). */
function MapFocus({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    if (target.latlngs) {
      map.flyToBounds(L.latLngBounds(target.latlngs), { padding: [48, 48], maxZoom: 16, duration: 0.8 });
    } else if (target.latlng) {
      map.flyTo(target.latlng, Math.max(map.getZoom(), 15), { duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

/**
 * The interactive map: tiles, polygons, objects, the drawing tool and mode hints.
 */
export default function MapView({
  mode,
  polygons,
  objects,
  selection,
  focusTarget,
  onMapClick,
  onPolygonComplete,
  onSelect,
  onMoveObject,
}) {
  const selectedPolygonId = selection?.kind === 'polygon' ? selection.id : null;
  const selectedObjectId = selection?.kind === 'object' ? selection.id : null;

  return (
    <div className={`map-view map-view--${mode}`}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="map-view__map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onClick={onMapClick} />
        <MapFocus target={focusTarget} />
        <PolygonsLayer
          polygons={polygons}
          selectedId={selectedPolygonId}
          mode={mode}
          onSelect={(id) => onSelect({ kind: 'polygon', id })}
        />
        <ObjectsLayer
          objects={objects}
          selectedId={selectedObjectId}
          mode={mode}
          onSelect={(id) => onSelect({ kind: 'object', id })}
          onMove={onMoveObject}
        />
        <PolygonDrawer active={mode === MODES.DRAW_POLYGON} onComplete={onPolygonComplete} />
      </MapContainer>

      {HINTS[mode] && <div className="map-view__hint">{HINTS[mode]}</div>}
    </div>
  );
}
