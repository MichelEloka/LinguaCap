import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DemoState } from '../domain/types';
import { createDemoState } from './data';

const storageKey = 'linguacap.demo.v1';

interface DemoContext {
  state: DemoState;
  update: (updater: (current: DemoState) => DemoState) => void;
  notify: (message: string) => void;
}

const DemoContext = createContext<DemoContext | null>(null);

function loadDemo(): DemoState {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const parsed: DemoState = JSON.parse(saved);
      if (parsed.goal && Array.isArray(parsed.sessions) && Array.isArray(parsed.catalog)) return parsed;
    }
  } catch {
    // A fresh fixture also works in browsers that deny local storage.
  }
  return createDemoState();
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadDemo);
  const [message, setMessage] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const update = useCallback((updater: (current: DemoState) => DemoState) => setState(updater), []);
  const value = useMemo(() => ({ state, update, notify: setMessage }), [state, update]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
      setStorageUnavailable(false);
    } catch {
      setStorageUnavailable(true);
    }
  }, [state]);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  return (
    <DemoContext.Provider value={value}>
      {storageUnavailable && <p className="storage-notice" role="status">Le stockage local est indisponible. Les modifications restent accessibles dans cet onglet.</p>}
      {children}
      {message && <div className="toast" role="status"><span>{message}</span><button type="button" onClick={() => setMessage('')} aria-label="Fermer la notification">×</button></div>}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContext {
  const value = useContext(DemoContext);
  if (!value) throw new Error('Une page de démonstration requiert DemoProvider.');
  return value;
}
