import { HINT_COSTS } from '@/engine/inkEconomy';
import type { HintTier } from '@/types';
import './HintBar.css';

interface HintBarProps {
  inkBalance: number;
  onUseHint: (tier: HintTier) => void;
}

const TIER_LABELS: Record<HintTier, string> = {
  1: 'Highlight',
  2: 'Pin one',
  3: 'Reveal'
};

export function HintBar({ inkBalance, onUseHint }: HintBarProps) {
  return (
    <div className="hint-bar">
      {([1, 2, 3] as HintTier[]).map((tier) => {
        const cost = HINT_COSTS[tier];
        const affordable = inkBalance >= cost;
        return (
          <button
            key={tier}
            type="button"
            className="hint-bar__button"
            disabled={!affordable}
            onClick={() => onUseHint(tier)}
          >
            <span className="hint-bar__label">{TIER_LABELS[tier]}</span>
            <span className="hint-bar__cost">{cost} Ink</span>
          </button>
        );
      })}
    </div>
  );
}
