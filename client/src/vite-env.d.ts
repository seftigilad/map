/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST API. Empty = relative /api URLs (proxied by Vite in dev). */
  readonly VITE_API_URL?: string;
  /** "true" to use the in-browser mock API instead of the real server. */
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
