import { useCallback, useEffect, useState } from 'react';
import { CircleMarker, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { CLOSE_TOLERANCE_PX, MIN_POLYGON_VERTICES, POLYGON_STYLES } from '../../map/constants';

const toLatLng = (e) => [e.latlng.lat, e.latlng.lng];

/**
 * Polygon drawing tool.
 * While active, every map click adds a vertex. Clicking the starting vertex again
 * (once there are at least 3 vertices) closes the polygon and calls onComplete.
 *
 * @param {{ active: boolean, onComplete: (latlngs: [number, number][]) => void }} props
 */
export default function PolygonDrawer({ active, onComplete }) {
  const map = useMap();
  const [vertices, setVertices] = useState([]);
  const [cursor, setCursor] = useState(null);

  // Reset when drawing is cancelled; disable double-click zoom while drawing.
  useEffect(() => {
    if (!active) {
      setVertices([]);
      setCursor(null);
      return undefined;
    }
    map.doubleClickZoom.disable();
    return () => map.doubleClickZoom.enable();
  }, [active, map]);

  const canClose = vertices.length >= MIN_POLYGON_VERTICES;

  const close = useCallback(() => {
    if (!canClose) return;
    onComplete(vertices);
    setVertices([]);
    setCursor(null);
  }, [canClose, onComplete, vertices]);

  const isNearStart = (latlng) =>
    map.latLngToContainerPoint(vertices[0]).distanceTo(map.latLngToContainerPoint(latlng)) <=
    CLOSE_TOLERANCE_PX;

  useMapEvents({
    click(e) {
      if (!active) return;
      if (canClose && isNearStart(e.latlng)) {
        close();
      } else {
        setVertices((current) => [...current, toLatLng(e)]);
      }
    },
    mousemove(e) {
      if (active && vertices.length > 0) setCursor(toLatLng(e));
    },
  });

  if (!active || vertices.length === 0) return null;

  const last = vertices[vertices.length - 1];

  return (
    <>
      <Polyline positions={vertices} pathOptions={POLYGON_STYLES.drawing} interactive={false} />
      {cursor && (
        <Polyline
          positions={canClose ? [last, cursor, vertices[0]] : [last, cursor]}
          pathOptions={{ ...POLYGON_STYLES.drawing, weight: 2, dashArray: '5 6', opacity: 0.8 }}
          interactive={false}
        />
      )}
      {vertices.map((vertex, index) =>
        index === 0 ? (
          // The starting vertex is clickable: clicking it closes the polygon.
          <CircleMarker
            key="start"
            center={vertex}
            radius={8}
            bubblingMouseEvents={false}
            pathOptions={{
              color: '#d97706',
              weight: 2,
              fillColor: canClose ? '#16a34a' : '#ffffff',
              fillOpacity: 1,
            }}
            eventHandlers={{ click: close }}
          >
            {canClose && (
              <Tooltip direction="top" offset={[0, -8]}>
                Click to close polygon
              </Tooltip>
            )}
          </CircleMarker>
        ) : (
          <CircleMarker
            key={index}
            center={vertex}
            radius={4}
            interactive={false}
            pathOptions={{ color: '#d97706', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }}
          />
        ),
      )}
    </>
  );
}
