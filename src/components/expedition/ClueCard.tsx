import './ClueCard.css';

interface ClueCardProps {
  clue: string;
  regionTitle: string;
  moveCount: number;
  isLandmark?: boolean;
}

export function ClueCard({ clue, regionTitle, moveCount, isLandmark }: ClueCardProps) {
  return (
    <div className={`clue-card ${isLandmark ? 'clue-card--landmark' : ''}`}>
      <div className="clue-card__eyebrow">
        {regionTitle}
        {isLandmark && <span className="clue-card__landmark-tag">Landmark</span>}
      </div>
      <p className="clue-card__text">{clue}</p>
      {moveCount > 0 && <div className="clue-card__moves">{moveCount} move{moveCount === 1 ? '' : 's'} so far</div>}
    </div>
  );
}
