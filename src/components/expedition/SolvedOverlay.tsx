import { wordById } from '@/engine/inkEconomy';
import './SolvedOverlay.css';

interface SolvedOverlayProps {
  expeditionTitle: string;
  moveCount: number;
  wordsUsed: string[];
  isLandmark?: boolean;
  hasNext: boolean;
  onContinue: () => void;
}

export function SolvedOverlay({
  expeditionTitle,
  moveCount,
  wordsUsed,
  isLandmark,
  hasNext,
  onContinue
}: SolvedOverlayProps) {
  return (
    <div className="solved-overlay">
      <div className="solved-overlay__card">
        <span className="solved-overlay__eyebrow">
          {isLandmark ? 'Landmark solved' : 'Solved'}
        </span>
        <h2 className="solved-overlay__title">{expeditionTitle}</h2>
        <p className="solved-overlay__moves">
          {moveCount} move{moveCount === 1 ? '' : 's'}
        </p>

        {wordsUsed.length > 0 && (
          <div className="solved-overlay__route">
            {wordsUsed.map((id, i) => (
              <span key={`${id}-${i}`} className="solved-overlay__route-word">
                {wordById(id)?.display ?? id}
              </span>
            ))}
          </div>
        )}

        <button type="button" className="solved-overlay__continue" onClick={onContinue}>
          {hasNext ? 'Next expedition' : 'Return to the map'}
        </button>
      </div>
    </div>
  );
}
