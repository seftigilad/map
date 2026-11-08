import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { MODES } from '../../map/constants';
import { getObjectIcon } from '../../map/icons';

/**
 * Renders saved and draft objects as standard markers or custom symbols.
 * Draft (unsaved) objects can be dragged to fine-tune their position before saving.
 */
export default function ObjectsLayer({ objects, selectedId, mode, onSelect, onMove }) {
  return objects.map((object) => (
    <Marker
      key={object.id}
      position={object.latlng}
      icon={getObjectIcon(object.symbol, { selected: object.id === selectedId, draft: !object.saved })}
      draggable={!object.saved}
      bubblingMouseEvents
      eventHandlers={{
        click: (e) => {
          if (mode !== MODES.IDLE) return;
          L.DomEvent.stopPropagation(e);
          onSelect(object.id);
        },
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          onMove(object.id, [lat, lng]);
        },
      }}
    >
      <Tooltip>
        {object.name}
        {!object.saved && ' (unsaved – drag to move)'}
      </Tooltip>
    </Marker>
  ));
}
