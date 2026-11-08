import { useCallback, useEffect, useState } from 'react';
import type { LatLng as LeafletLatLng, LeafletMouseEvent } from 'leaflet';
import { CircleMarker, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { CLOSE_TOLERANCE_PX, MIN_POLYGON_VERTICES, POLYGON_STYLES } from '../../map/constants';
import type { LatLng } from '../../types';

const toLatLng = (e: LeafletMouseEvent): LatLng => [e.latlng.lat, e.latlng.lng];

interface PolygonDrawerProps {
  active: boolean;
  onComplete: (latlngs: LatLng[]) => void;
}

/**
 * Polygon drawing tool.
 * While active, every map click adds a vertex. Clicking the starting vertex again
 * (once there are at least 3 vertices) closes the polygon and calls onComplete.
 */
export default function PolygonDrawer({ active, onComplete }: PolygonDrawerProps) {
  const map = useMap();
  const [vertices, setVertices] = useState<LatLng[]>([]);
  const [cursor, setCursor] = useState<LatLng | null>(null);

  // Reset when drawing is cancelled; disable double-click zoom while drawing.
  useEffect(() => {
    if (!active) {
      setVertices([]);
      setCursor(null);
      return undefined;
    }
    map.doubleClickZoom.disable();
    return () => {
      map.doubleClickZoom.enable();
    };
  }, [active, map]);

  const canClose = vertices.length >= MIN_POLYGON_VERTICES;

  const close = useCallback(() => {
    if (!canClose) return;
    onComplete(vertices);
    setVertices([]);
    setCursor(null);
  }, [canClose, onComplete, vertices]);

  const isNearStart = (latlng: LeafletLatLng): boolean => {
    const start = vertices[0];
    if (!start) return false;
    return (
      map.latLngToContainerPoint(start).distanceTo(map.latLngToContainerPoint(latlng)) <= CLOSE_TOLERANCE_PX
    );
  };

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

  const start = vertices[0];
  const last = vertices[vertices.length - 1];
  if (!active || !start || !last) return null;

  return (
    <>
      <Polyline positions={vertices} pathOptions={POLYGON_STYLES.drawing} interactive={false} />
      {cursor && (
        <Polyline
          positions={canClose ? [last, cursor, start] : [last, cursor]}
          pathOptions={{ ...POLYGON_STYLES.drawing, weight: 2, dashArray: '5 6', opacity: 0.8 }}
          interactive={false}
        />
      )}

      {/* The starting vertex is clickable: clicking it closes the polygon. */}
      <CircleMarker
        center={start}
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

      {vertices.slice(1).map((vertex, index) => (
        <CircleMarker
          key={index}
          center={vertex}
          radius={4}
          interactive={false}
          pathOptions={{ color: '#d97706', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }}
        />
      ))}
    </>
  );
}
