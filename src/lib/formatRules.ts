import { DeckCard } from "@/types";

export type DeckFormat = "freeform" | "standard" | "commander";

interface FormatRules {
  targetDeckSize: number | null;
  copyLimit: number;
  softWarnThreshold: number;
  sideboardAllowed: boolean;
  sideboardMax: number | null;
  hasCommanderSlot: boolean;
  hasColorIdentityCheck: boolean;
  hasLegalityCheck: boolean;
  legalityFormat: string | null;
  probGreen: number;
  probYellow: number;
  excludeCommanderFromLibrary: boolean;
  cardCountGreen: number | null;
  cardCountRed: (count: number) => boolean;
}

export function getFormatRules(format: DeckFormat): FormatRules {
  if (format === "commander") {
    return {
      targetDeckSize: 100,
      copyLimit: 1,
      softWarnThreshold: 2,
      sideboardAllowed: false,
      sideboardMax: null,
      hasCommanderSlot: true,
      hasColorIdentityCheck: true,
      hasLegalityCheck: true,
      legalityFormat: "commander",
      probGreen: 0.05,
      probYellow: 0.02,
      excludeCommanderFromLibrary: true,
      cardCountGreen: 100,
      cardCountRed: (count: number) => count > 100,
    };
  }

  if (format === "standard") {
    return {
      targetDeckSize: 60,
      copyLimit: 4,
      softWarnThreshold: 5,
      sideboardAllowed: true,
      sideboardMax: 15,
      hasCommanderSlot: false,
      hasColorIdentityCheck: false,
      hasLegalityCheck: true,
      legalityFormat: "standard",
      probGreen: 0.08,
      probYellow: 0.04,
      excludeCommanderFromLibrary: false,
      cardCountGreen: 60,
      cardCountRed: (count: number) => count > 60,
    };
  }

  // freeform
  return {
    targetDeckSize: null,
    copyLimit: 4,
    softWarnThreshold: 5,
    sideboardAllowed: true,
    sideboardMax: null,
    hasCommanderSlot: false,
    hasColorIdentityCheck: false,
    hasLegalityCheck: false,
    legalityFormat: null,
    probGreen: 0.08,
    probYellow: 0.04,
    excludeCommanderFromLibrary: false,
    cardCountGreen: null,
    cardCountRed: () => false,
  };
}

function isExemptFromCopyLimit(card: DeckCard): boolean {
  return (
    (card.type_line?.includes("Basic Land") ?? false) ||
    (card.oracle_text?.includes("A deck can have any number") ?? false)
  );
}

export function getCardWarnings(
  card: DeckCard,
  format: DeckFormat,
  commanderIdentity?: string[],
): string[] {
  const rules = getFormatRules(format);
  const warnings: string[] = [];

  // Copy limit check
  if (!isExemptFromCopyLimit(card) && card.quantity >= rules.softWarnThreshold) {
    if (format === "commander") {
      warnings.push("Exceeds singleton limit");
    } else {
      warnings.push(`Exceeds ${rules.copyLimit}-copy limit`);
    }
  }

  // Format legality check
  if (rules.hasLegalityCheck && rules.legalityFormat) {
    const legality = card.legalities?.[rules.legalityFormat];
    if (legality === "not_legal" || legality === "banned") {
      const formatName =
        format === "standard" ? "Standard" : "Commander";
      warnings.push(`Not legal in ${formatName}`);
    }
  }

  // Color identity check
  if (rules.hasColorIdentityCheck && commanderIdentity) {
    const cardIdentity = card.color_identity ?? [];
    if (!cardIdentity.every((c) => commanderIdentity.includes(c))) {
      warnings.push(`Outside commander's color identity`);
    }
  }

  return warnings;
}

export function isEligibleCommander(card: DeckCard): boolean {
  return (
    (card.type_line?.includes("Legendary") ?? false) ||
    (card.oracle_text?.includes("can be your commander") ?? false)
  );
}
