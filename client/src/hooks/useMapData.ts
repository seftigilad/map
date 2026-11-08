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
import type { LatLng, MapObject, MapPolygon, SymbolId } from '../types';

const DRAFT_PREFIX = 'draft-';
let draftSequence = 0;
const newDraftId = (): string => `${DRAFT_PREFIX}${++draftSequence}`;

/** True for ids of local drafts (not yet saved on the server). */
export const isDraftId = (id: string): boolean => id.startsWith(DRAFT_PREFIX);

/** Returns "<prefix> N" where N is one more than the highest existing number for that prefix. */
function nextName(prefix: string, items: ReadonlyArray<{ name: string }>): string {
  const pattern = new RegExp(`^${prefix} (\\d+)$`);
  const max = items.reduce((acc, item) => {
    const match = pattern.exec(item.name);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `${prefix} ${max + 1}`;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export interface MapData {
  polygons: MapPolygon[];
  draftPolygons: MapPolygon[];
  objects: MapObject[];
  draftObjects: MapObject[];
  busy: boolean;
  error: string | null;
  notice: string | null;
  clearError: () => void;
  clearNotice: () => void;
  /** Reloads everything from the server. Resolves to true on success. */
  reload: () => Promise<boolean>;
  addDraftPolygon: (latlngs: LatLng[]) => MapPolygon;
  savePolygons: () => Promise<boolean>;
  deletePolygon: (id: string) => Promise<boolean>;
  deleteAllPolygons: () => Promise<boolean>;
  addDraftObject: (symbol: SymbolId, latlng: LatLng) => MapObject;
  moveDraftObject: (id: string, latlng: LatLng) => void;
  saveObjects: () => Promise<boolean>;
  deleteObject: (id: string) => Promise<boolean>;
}

export function useMapData(): MapData {
  const [polygons, setPolygons] = useState<MapPolygon[]>([]);
  const [draftPolygons, setDraftPolygons] = useState<MapPolygon[]>([]);
  const [objects, setObjects] = useState<MapObject[]>([]);
  const [draftObjects, setDraftObjects] = useState<MapObject[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  /** Runs an async server operation with busy/error/notice handling. Resolves to true on success. */
  const run = useCallback(async (operation: () => Promise<void>, successMessage?: string): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await operation();
      if (successMessage) setNotice(successMessage);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
    void reload();
  }, [reload]);

  // ---------- Polygons ----------

  const addDraftPolygon = useCallback(
    (latlngs: LatLng[]): MapPolygon => {
      const polygon: MapPolygon = {
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
    async (id: string): Promise<boolean> => {
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
    (symbol: SymbolId, latlng: LatLng): MapObject => {
      const object: MapObject = {
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

  const moveDraftObject = useCallback((id: string, latlng: LatLng) => {
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
    async (id: string): Promise<boolean> => {
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
