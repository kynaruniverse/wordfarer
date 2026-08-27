import { useEffect, useMemo, useState } from 'react';
import type { CategoryId, WordDef } from '@/types';
import wordsData from '@/content/words.json';
import { WordCard } from './WordCard';
import { useWorkbenchStore } from '@/state/workbenchStore';
import './WordbankPanel.css';

const words = wordsData as WordDef[];

const CATEGORY_ORDER: { id: CategoryId; label: string }[] = [
  { id: 'nature', label: 'Nature' },
  { id: 'home', label: 'Home' },
  { id: 'feelings', label: 'Feelings' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'man-made', label: 'Man-made' }
];

interface WordbankPanelProps {
  ownedWordIds: Set<string>;
  highlightedWordIds?: string[];
}

export function WordbankPanel({ ownedWordIds, highlightedWordIds }: WordbankPanelProps) {
  const [activeTab, setActiveTab] = useState<CategoryId>('nature');
  const pin = useWorkbenchStore((s) => s.pin);

  const wordsByCategory = useMemo(() => {
    const map = new Map<CategoryId, WordDef[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat.id, []);
    for (const w of words) {
      if (!ownedWordIds.has(w.id)) continue;
      map.get(w.category)?.push(w);
    }
    return map;
  }, [ownedWordIds]);

  const highlighted = new Set(highlightedWordIds ?? []);

  // A tier-1 hint is only useful if the player can actually see it — jump
  // to whichever tab holds the highlighted word rather than leaving them
  // to stumble across it.
  useEffect(() => {
    if (!highlightedWordIds || highlightedWordIds.length === 0) return;
    const firstHighlighted = words.find((w) => w.id === highlightedWordIds[0]);
    if (firstHighlighted) setActiveTab(firstHighlighted.category);
  }, [highlightedWordIds]);

  return (
    <div className="wordbank-panel">
      <div className="wordbank-panel__tabs" role="tablist">
        {CATEGORY_ORDER.map((cat) => {
          const count = wordsByCategory.get(cat.id)?.length ?? 0;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeTab === cat.id}
              className={`wordbank-panel__tab ${activeTab === cat.id ? 'wordbank-panel__tab--active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.label}
              <span className="wordbank-panel__tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="wordbank-panel__grid paper-texture">
        {(wordsByCategory.get(activeTab) ?? []).map((w) => (
          <WordCard
            key={w.id}
            display={w.display}
            onClick={() => pin(w.id)}
            highlighted={highlighted.has(w.id)}
          />
        ))}
        {(wordsByCategory.get(activeTab)?.length ?? 0) === 0 && (
          <p className="wordbank-panel__empty">Nothing here yet — keep exploring.</p>
        )}
      </div>
    </div>
  );
}
