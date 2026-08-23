import { useEffect, useState } from 'react';
import { useWorkbenchStore } from '@/state/workbenchStore';
import { useGameStore } from '@/state/gameStore';
import { WordCard } from '../wordbank/WordCard';
import { wordById } from '@/engine/inkEconomy';
import './Workbench.css';

export function Workbench() {
  const slotA = useWorkbenchStore((s) => s.slotA);
  const slotB = useWorkbenchStore((s) => s.slotB);
  const clear = useWorkbenchStore((s) => s.clear);
  const craft = useGameStore((s) => s.craft);
  const feedback = useGameStore((s) => s.feedback);

  const [animState, setAnimState] = useState<'idle' | 'bloom' | 'bounce'>('idle');

  useEffect(() => {
    if (!feedback) return;
    setAnimState(feedback.kind);
    const timeout = setTimeout(() => {
      setAnimState('idle');
      clear();
    }, feedback.kind === 'bloom' ? 700 : 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  const bothFilled = Boolean(slotA && slotB);
  const outputWord = feedback?.kind === 'bloom' && feedback.outputId ? wordById(feedback.outputId) : null;

  return (
    <div className="workbench paper-texture">
      <div className={`workbench__surface workbench__surface--${animState}`}>
        <div className="workbench__slot">
          {slotA ? <WordCard display={wordById(slotA)?.display ?? slotA} variant="bench-slot" /> : <WordCard display="" variant="bench-empty" />}
        </div>

        <div className="workbench__connector">+</div>

        <div className="workbench__slot">
          {slotB ? <WordCard display={wordById(slotB)?.display ?? slotB} variant="bench-slot" /> : <WordCard display="" variant="bench-empty" />}
        </div>

        {animState === 'bloom' && outputWord && (
          <div className="workbench__bloom-result">
            <div className="workbench__bloom-ring" />
            <span className="workbench__bloom-label">{outputWord.display}</span>
          </div>
        )}
      </div>

      <div className="workbench__actions">
        <button type="button" className="workbench__clear" onClick={clear} disabled={!slotA && !slotB}>
          Clear
        </button>
        <button
          type="button"
          className="workbench__craft"
          disabled={!bothFilled || animState !== 'idle'}
          onClick={() => slotA && slotB && craft(slotA, slotB)}
        >
          Craft
        </button>
      </div>
    </div>
  );
}
