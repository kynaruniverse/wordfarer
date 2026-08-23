import './IngredientNudge.css';

interface IngredientNudgeProps {
  onDismiss: () => void;
}

export function IngredientNudge({ onDismiss }: IngredientNudgeProps) {
  return (
    <div className="ingredient-nudge">
      <span>You may need to craft something new first.</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
