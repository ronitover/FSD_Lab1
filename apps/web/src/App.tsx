import { useEffect, useState } from 'react';
import type { HealthResponse } from '@replate/shared';

type ApiState = 'checking' | 'up' | 'down';

const STATUS_TEXT: Record<ApiState, string> = {
  checking: 'Checking the API…',
  up: 'API connected.',
  down: 'API unreachable. Is `npm run dev` running?',
};

// Placeholder shell for Phase 0: confirms the web app, the dev proxy and the API are wired together.
export default function App() {
  const [apiState, setApiState] = useState<ApiState>('checking');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<HealthResponse>) : Promise.reject(res)))
      .then((body) => setApiState(body.status === 'ok' ? 'up' : 'down'))
      .catch(() => {
        if (!controller.signal.aborted) setApiState('down');
      });
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>
        Re<em>Plate</em>
      </h1>
      <p>Good food deserves another plate.</p>
      <p className="status" data-state={apiState} role="status">
        {STATUS_TEXT[apiState]}
      </p>
    </main>
  );
}
