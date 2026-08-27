import { useEffect } from 'react';
import { useGameStore, allExpeditions } from '@/state/gameStore';
import { TopBar } from '@/components/shell/TopBar';
import { ExpeditionScreen } from '@/components/shell/ExpeditionScreen';

export function App() {
  const ready = useGameStore((s) => s.ready);
  const save = useGameStore((s) => s.save);
  const init = useGameStore((s) => s.init);
  const activeExpeditionId = useGameStore((s) => s.activeExpeditionId);
  const setActiveExpedition = useGameStore((s) => s.setActiveExpedition);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (!ready || !save || activeExpeditionId) return;
    const next = allExpeditions().find((e) => !save.completedExpeditionIds.includes(e.id));
    if (next) setActiveExpedition(next.id);
  }, [ready, save, activeExpeditionId, setActiveExpedition]);

  if (!ready || !save) {
    return (
      <div style={{ padding: 24, fontFamily: 'var(--font-body)', color: 'var(--color-ink-soft)' }}>
        Unrolling the map…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <TopBar
        inkBalance={save.ink.balance}
        completedCount={save.completedExpeditionIds.length}
        totalCount={allExpeditions().length}
      />
      <ExpeditionScreen />
    </div>
  );
}
