import { httpApi } from './httpApi';
import { mockApi } from './mockApi';
import type { MapApi } from './types';

/** True when the UI runs against the in-browser mock instead of the real server. */
export const isMockApi = import.meta.env.VITE_USE_MOCK === 'true';

/** The API implementation used by the app. Both share the same contract. */
export const api: MapApi = isMockApi ? mockApi : httpApi;
