import { Deck } from "@/types";
import { DeckFormat, getFormatRules } from "@/lib/formatRules";

export function useDeckStats(activeDeck: Deck | null, format?: DeckFormat) {
  const totalCards =
    activeDeck?.cards.reduce((sum, card) => sum + card.quantity, 0) ?? 0;

  const resolvedFormat = format ?? activeDeck?.format ?? "freeform";
  const rules = getFormatRules(resolvedFormat);
  const targetDeckSize = rules.targetDeckSize;
  const isAtTarget = targetDeckSize !== null && totalCards === targetDeckSize;
  const isOverTarget = targetDeckSize !== null && totalCards > targetDeckSize;

  const hasSideboard = activeDeck?.sideboard !== undefined;

  const mainValue =
    activeDeck?.cards.reduce(
      (sum, card) =>
        sum + parseFloat(card.prices.usd || "0") * card.quantity,
      0,
    ) ?? 0;

  const sideboardValue =
    hasSideboard
      ? (activeDeck?.sideboard ?? []).reduce(
          (sum, card) =>
            sum + parseFloat(card.prices.usd || "0") * card.quantity,
          0,
        )
      : 0;

  const totalValue = mainValue + sideboardValue;

  const mainRemainingCost =
    activeDeck?.cards.reduce(
      (sum, card) =>
        sum +
        parseFloat(card.prices.usd || "0") *
          Math.max(0, card.quantity - (card.isOwned ? card.ownedQty : 0)),
      0,
    ) ?? 0;

  const sideboardRemainingCost =
    hasSideboard
      ? (activeDeck?.sideboard ?? []).reduce(
          (sum, card) =>
            sum +
            parseFloat(card.prices.usd || "0") *
              Math.max(0, card.quantity - (card.isOwned ? card.ownedQty : 0)),
          0,
        )
      : 0;

  const remainingCost = mainRemainingCost + sideboardRemainingCost;

  const hasPriceData =
    activeDeck?.cards.some((card) => card.prices.usd !== null) ?? false;

  const buyOnTCGPlayer = () => {
    if (!activeDeck) return;
    const list = activeDeck.cards
      .map((c) => ({ ...c, buyQty: c.quantity - (c.isOwned ? c.ownedQty : 0) }))
      .filter((c) => c.buyQty > 0)
      .map(
        (c) =>
          `${c.buyQty} ${c.name}${c.set ? ` [${c.set.toUpperCase()}]` : ""}`,
      )
      .join("||");
    window.open(
      `https://www.tcgplayer.com/massentry?c=${encodeURIComponent(list)}`,
      "_blank",
    );
  };

  const buyOnCardKingdom = () => {
    if (!activeDeck) return;
    const list = activeDeck.cards
      .map((c) => ({ ...c, buyQty: c.quantity - (c.isOwned ? c.ownedQty : 0) }))
      .filter((c) => c.buyQty > 0)
      .map((c) => `${c.buyQty} ${c.name}`)
      .join("\n");
    window.open(
      `https://www.cardkingdom.com/builder?main_deck=${encodeURIComponent(list)}`,
      "_blank",
    );
  };

  return {
    totalCards,
    totalValue,
    remainingCost,
    hasPriceData,
    hasSideboard,
    targetDeckSize,
    isAtTarget,
    isOverTarget,
    buyOnTCGPlayer,
    buyOnCardKingdom,
  };
}
