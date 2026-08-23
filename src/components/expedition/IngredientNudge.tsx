import { wordById } from '@/engine/inkEconomy';
import './IngredientNudge.css';

interface IngredientNudgeProps {
  missingWordIds: string[];
  onDismiss: () => void;
}

export function IngredientNudge({ missingWordIds, onDismiss }: IngredientNudgeProps) {
  const names = missingWordIds.map((id) => wordById(id)?.display ?? id).join(', ');
  return (
    <div className="ingredient-nudge">
      <span>You may need to craft something new first — try finding: {names}.</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}