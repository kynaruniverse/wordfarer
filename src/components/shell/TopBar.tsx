import './TopBar.css';

interface TopBarProps {
  inkBalance: number;
  completedCount: number;
  totalCount: number;
}

export function TopBar({ inkBalance, completedCount, totalCount }: TopBarProps) {
  return (
    <div className="top-bar">
      <span className="top-bar__title">Wordfarer</span>
      <div className="top-bar__stats">
        <span className="top-bar__stat">{completedCount}/{totalCount} expeditions</span>
        <span className="top-bar__stat top-bar__stat--ink">{inkBalance} Ink</span>
      </div>
    </div>
  );
}
