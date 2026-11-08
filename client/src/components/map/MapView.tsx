import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MODES, type Mode } from '../../map/constants';
import type { FocusTarget, LatLng, MapObject, MapPolygon, Selection } from '../../types';
import PolygonDrawer from './PolygonDrawer';
import PolygonsLayer from './PolygonsLayer';
import ObjectsLayer from './ObjectsLayer';

const HINTS: Partial<Record<Mode, string>> = {
  [MODES.DRAW_POLYGON]: 'Click to add vertices · click the first point to close · Esc to cancel',
  [MODES.ADD_OBJECT]: 'Click on the map to place objects · Esc to finish',
};

/** Forwards plain map clicks (not consumed by a layer) to the parent. */
function MapClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click: (e) => onClick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

/** Pans/zooms the map to a target polygon or object. */
function MapFocus({ target }: { target: FocusTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    if ('latlngs' in target) {
      map.flyToBounds(L.latLngBounds(target.latlngs), { padding: [48, 48], maxZoom: 16, duration: 0.8 });
    } else {
      map.flyTo(target.latlng, Math.max(map.getZoom(), 15), { duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

interface MapViewProps {
  mode: Mode;
  polygons: MapPolygon[];
  objects: MapObject[];
  selection: Selection | null;
  focusTarget: FocusTarget | null;
  onMapClick: (latlng: LatLng) => void;
  onPolygonComplete: (latlngs: LatLng[]) => void;
  onSelect: (selection: Selection) => void;
  onMoveObject: (id: string, latlng: LatLng) => void;
}

/** The interactive map: tiles, polygons, objects, the drawing tool and mode hints. */
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
}: MapViewProps) {
  const selectedPolygonId = selection?.kind === 'polygon' ? selection.id : null;
  const selectedObjectId = selection?.kind === 'object' ? selection.id : null;
  const hint = HINTS[mode];

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

      {hint && <div className="map-view__hint">{hint}</div>}
    </div>
  );
}
