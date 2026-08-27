import { useGameStore, getExpeditionById, allExpeditions } from '@/state/gameStore';
import { ClueCard } from '../expedition/ClueCard';
import { IngredientNudge } from '../expedition/IngredientNudge';
import { SolvedOverlay } from '../expedition/SolvedOverlay';
import { HintBar } from '../expedition/HintBar';
import { HintReveal } from '../expedition/HintReveal';
import { Workbench } from '../workbench/Workbench';
import { WordbankPanel } from '../wordbank/WordbankPanel';
import { wordById } from '@/engine/inkEconomy';
import regionData from '@/content/regions/coastal-fog.json';
import './ExpeditionScreen.css';

export function ExpeditionScreen() {
  const activeExpeditionId = useGameStore((s) => s.activeExpeditionId);
  const moves = useGameStore((s) => s.currentExpeditionMoves);
  const wordsUsed = useGameStore((s) => s.currentExpeditionWordsUsed);
  const ownedWordIds = useGameStore((s) => s.ownedWordIds)();
  const ingredientNudge = useGameStore((s) => s.ingredientNudge);
  const dismissNudge = useGameStore((s) => s.dismissNudge);
  const justSolvedExpeditionId = useGameStore((s) => s.justSolvedExpeditionId);
  const save = useGameStore((s) => s.save);
  const advanceToNext = useGameStore((s) => s.advanceToNext);
  const hintHighlightWordIds = useGameStore((s) => s.hintHighlightWordIds);
  const hintReveal = useGameStore((s) => s.hintReveal);
  const useHint = useGameStore((s) => s.useHint);

  const expedition = activeExpeditionId ? getExpeditionById(activeExpeditionId) : undefined;
  const solvedExpedition = justSolvedExpeditionId ? getExpeditionById(justSolvedExpeditionId) : undefined;

  if (!expedition) {
    return (
      <div className="expedition-screen expedition-screen--empty">
        <p>Every expedition in {regionData.region.title} is complete for now.</p>
      </div>
    );
  }

  const hasNext = save ? allExpeditions().some((e) => !save.completedExpeditionIds.includes(e.id)) : false;

  return (
    <div className="expedition-screen">
      <ClueCard
        clue={expedition.clue}
        regionTitle={regionData.region.title}
        moveCount={moves}
        isLandmark={expedition.isLandmark}
      />

      {ingredientNudge && <IngredientNudge onDismiss={dismissNudge} />}
      {hintReveal && <HintReveal inputs={hintReveal} />}

      <HintBar inkBalance={save?.ink.balance ?? 0} onUseHint={useHint} />

      <div className="expedition-screen__split">
        <Workbench />
        <WordbankPanel ownedWordIds={ownedWordIds} highlightedWordIds={hintHighlightWordIds ?? undefined} />
      </div>

      {solvedExpedition && (
        <SolvedOverlay
          expeditionTitle={wordById(solvedExpedition.targetId)?.display ?? solvedExpedition.targetId}
          moveCount={moves}
          wordsUsed={wordsUsed}
          isLandmark={solvedExpedition.isLandmark}
          hasNext={hasNext}
          onContinue={advanceToNext}
        />
      )}
    </div>
  );
}
