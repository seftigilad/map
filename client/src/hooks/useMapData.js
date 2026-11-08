/**
 * Owns all map data: persisted items loaded from the server and local, unsaved drafts.
 *
 * - Drafts are created on the client (Add) and only sent to the server on Save.
 * - After every Save the server returns the updated collection, which replaces local state,
 *   so the Map Data table always reflects what is stored in MongoDB.
 */
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { objectFromDto, objectToDto, polygonFromDto, polygonToDto } from '../api/mappers';
import { symbolLabel } from '../map/constants';

const DRAFT_PREFIX = 'draft-';
let draftSequence = 0;
const newDraftId = () => `${DRAFT_PREFIX}${++draftSequence}`;

export const isDraftId = (id) => typeof id === 'string' && id.startsWith(DRAFT_PREFIX);

/** Returns "<prefix> N" where N is one more than the highest existing number for that prefix. */
function nextName(prefix, items) {
  const pattern = new RegExp(`^${prefix} (\\d+)$`);
  const max = items.reduce((acc, item) => {
    const match = pattern.exec(item.name);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `${prefix} ${max + 1}`;
}

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function useMapData() {
  const [polygons, setPolygons] = useState([]);
  const [draftPolygons, setDraftPolygons] = useState([]);
  const [objects, setObjects] = useState([]);
  const [draftObjects, setDraftObjects] = useState([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const clearError = useCallback(() => setError(null), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  /** Runs an async server operation with busy/error/notice handling. Resolves to true on success. */
  const run = useCallback(async (operation, successMessage) => {
    setBusy(true);
    setError(null);
    try {
      await operation();
      if (successMessage) setNotice(successMessage);
      return true;
    } catch (err) {
      setError(err?.message ?? String(err));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const reload = useCallback(
    () =>
      run(async () => {
        const [polygonDtos, objectDtos] = await Promise.all([api.getPolygons(), api.getObjects()]);
        setPolygons(polygonDtos.map(polygonFromDto));
        setObjects(objectDtos.map(objectFromDto));
      }),
    [run],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  // ---------- Polygons ----------

  const addDraftPolygon = useCallback(
    (latlngs) => {
      const polygon = {
        id: newDraftId(),
        name: nextName('Polygon', [...polygons, ...draftPolygons]),
        latlngs,
        saved: false,
      };
      setDraftPolygons((drafts) => [...drafts, polygon]);
      return polygon;
    },
    [polygons, draftPolygons],
  );

  const savePolygons = useCallback(() => {
    const drafts = draftPolygons;
    return run(async () => {
      for (const draft of drafts) {
        const updated = await api.createPolygon(polygonToDto(draft));
        setPolygons(updated.map(polygonFromDto));
        setDraftPolygons((current) => current.filter((p) => p.id !== draft.id));
      }
    }, `Saved ${plural(drafts.length, 'polygon')}`);
  }, [draftPolygons, run]);

  const deletePolygon = useCallback(
    async (id) => {
      if (isDraftId(id)) {
        setDraftPolygons((drafts) => drafts.filter((p) => p.id !== id));
        return true;
      }
      return run(async () => {
        await api.deletePolygon(id);
        setPolygons((current) => current.filter((p) => p.id !== id));
      }, 'Polygon deleted');
    },
    [run],
  );

  const deleteAllPolygons = useCallback(
    () =>
      run(async () => {
        await api.deleteAllPolygons();
        setPolygons([]);
        setDraftPolygons([]);
      }, 'All polygons deleted'),
    [run],
  );

  // ---------- Objects ----------

  const addDraftObject = useCallback(
    (symbol, latlng) => {
      const object = {
        id: newDraftId(),
        name: nextName(symbolLabel(symbol), [...objects, ...draftObjects]),
        symbol,
        latlng,
        saved: false,
      };
      setDraftObjects((drafts) => [...drafts, object]);
      return object;
    },
    [objects, draftObjects],
  );

  const moveDraftObject = useCallback((id, latlng) => {
    setDraftObjects((drafts) => drafts.map((o) => (o.id === id ? { ...o, latlng } : o)));
  }, []);

  const saveObjects = useCallback(() => {
    const drafts = draftObjects;
    return run(async () => {
      const updated = await api.saveObjects(drafts.map(objectToDto));
      setObjects(updated.map(objectFromDto));
      const savedIds = new Set(drafts.map((d) => d.id));
      setDraftObjects((current) => current.filter((o) => !savedIds.has(o.id)));
    }, `Saved ${plural(drafts.length, 'object')}`);
  }, [draftObjects, run]);

  const deleteObject = useCallback(
    async (id) => {
      if (isDraftId(id)) {
        setDraftObjects((drafts) => drafts.filter((o) => o.id !== id));
        return true;
      }
      return run(async () => {
        await api.deleteObject(id);
        setObjects((current) => current.filter((o) => o.id !== id));
      }, 'Object deleted');
    },
    [run],
  );

  return {
    polygons,
    draftPolygons,
    objects,
    draftObjects,
    busy,
    error,
    notice,
    clearError,
    clearNotice,
    reload,
    addDraftPolygon,
    savePolygons,
    deletePolygon,
    deleteAllPolygons,
    addDraftObject,
    moveDraftObject,
    saveObjects,
    deleteObject,
  };
}
