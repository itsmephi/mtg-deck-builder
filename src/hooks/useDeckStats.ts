import { Deck } from "@/types";

export function useDeckStats(activeDeck: Deck | null) {
  const totalCards =
    activeDeck?.cards.reduce((sum, card) => sum + card.quantity, 0) ?? 0;

  const totalValue =
    activeDeck?.cards.reduce(
      (sum, card) =>
        sum + parseFloat(card.prices.usd || "0") * card.quantity,
      0,
    ) ?? 0;

  const remainingCost =
    activeDeck?.cards.reduce(
      (sum, card) =>
        card.isOwned
          ? sum
          : sum + parseFloat(card.prices.usd || "0") * card.quantity,
      0,
    ) ?? 0;

  const hasPriceData =
    activeDeck?.cards.some((card) => card.prices.usd !== null) ?? false;

  const buyOnTCGPlayer = () => {
    if (!activeDeck) return;
    const list = activeDeck.cards
      .filter((c) => !c.isOwned)
      .map(
        (c) =>
          `${c.quantity} ${c.name}${c.set ? ` [${c.set.toUpperCase()}]` : ""}`,
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
      .filter((c) => !c.isOwned)
      .map((c) => `${c.quantity} ${c.name}`)
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
    buyOnTCGPlayer,
    buyOnCardKingdom,
  };
}
