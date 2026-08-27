import { wordById } from '@/engine/inkEconomy';
import './HintReveal.css';

interface HintRevealProps {
  inputs: [string, string];
}

export function HintReveal({ inputs }: HintRevealProps) {
  const [a, b] = inputs;
  return (
    <div className="hint-reveal">
      Try: <strong>{wordById(a)?.display ?? a}</strong> + <strong>{wordById(b)?.display ?? b}</strong>
    </div>
  );
}
