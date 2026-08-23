import './WordCard.css';

interface WordCardProps {
  display: string;
  onClick?: () => void;
  variant?: 'bank' | 'bench-slot' | 'bench-empty';
  dimmed?: boolean;
  highlighted?: boolean;
}

export function WordCard({ display, onClick, variant = 'bank', dimmed, highlighted }: WordCardProps) {
  if (variant === 'bench-empty') {
    return <div className="word-card word-card--empty" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className={[
        'word-card',
        variant === 'bench-slot' ? 'word-card--bench' : '',
        dimmed ? 'word-card--dimmed' : '',
        highlighted ? 'word-card--highlighted' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {display}
    </button>
  );
}
