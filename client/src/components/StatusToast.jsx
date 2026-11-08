import { useEffect } from 'react';

const NOTICE_TIMEOUT_MS = 2500;

/** Shows loading state, success notices (auto-dismissed) and errors (dismissed manually). */
export default function StatusToast({ busy, error, notice, onDismissError, onDismissNotice }) {
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(onDismissNotice, NOTICE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [notice, onDismissNotice]);

  return (
    <div className="toasts" aria-live="polite">
      {busy && <div className="toast toast--info">Working…</div>}
      {error && (
        <div className="toast toast--error" role="alert">
          <span>{error}</span>
          <button type="button" className="toast__close" onClick={onDismissError} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      {!error && notice && <div className="toast toast--success">{notice}</div>}
    </div>
  );
}
