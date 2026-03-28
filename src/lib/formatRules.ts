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
  // Get type_line and oracle_text, checking card_faces as fallback for reversible cards
  const typeLine = card.type_line ?? card.card_faces?.[0]?.type_line ?? '';
  const oracleText = card.oracle_text ?? card.card_faces?.[0]?.oracle_text ?? '';

  const isLegendary = typeLine.includes("Legendary");

  // Traditional: Legendary Creature
  const isLegendaryCreature = isLegendary && typeLine.includes("Creature");

  // Explicit commander text (e.g., Grist, the Hunger Tide)
  const hasCommanderText = oracleText.includes("can be your commander");

  // July 2025 rule: Legendary Vehicle or Spacecraft with P/T
  const isLegendaryVehicle = isLegendary && typeLine.includes("Vehicle");
  const isLegendarySpacecraft = isLegendary && typeLine.includes("Spacecraft");
  const hasPowerToughness = card.power !== undefined && card.toughness !== undefined;
  const isEligibleArtifact = (isLegendaryVehicle || isLegendarySpacecraft) && hasPowerToughness;

  return isLegendaryCreature || hasCommanderText || isEligibleArtifact;
}

// --- Partner Detection & Validation ---

export type PartnerType = 'partner' | 'partner-with' | 'friends-forever' | null;

export function getPartnerType(card: DeckCard): PartnerType {
  const keywords = card.keywords;
  const oracleText = card.oracle_text ?? card.card_faces?.[0]?.oracle_text ?? '';

  if (keywords && keywords.length > 0) {
    const kw = keywords.map((k) => k.toLowerCase());
    if (kw.includes('friends forever')) return 'friends-forever';
    if (kw.includes('partner')) {
      // Distinguish "Partner with X" from generic Partner
      if (/Partner with /i.test(oracleText)) return 'partner-with';
      return 'partner';
    }
    return null;
  }

  // Fallback to oracle text for cards stored before keywords were typed
  if (/friends forever/i.test(oracleText)) return 'friends-forever';
  if (/Partner with /i.test(oracleText)) return 'partner-with';
  if (/\bPartner\b(?!\s+with\b)/i.test(oracleText)) return 'partner';
  return null;
}

export function getPartnerWithName(card: DeckCard): string | null {
  const oracleText = card.oracle_text ?? card.card_faces?.[0]?.oracle_text ?? '';
  const match = oracleText.match(/Partner with ([^\n(.]+)/i);
  return match ? match[1].trim() : null;
}

export function hasPartnerAbility(card: DeckCard): boolean {
  return getPartnerType(card) !== null;
}

export function canPartnerWith(
  cardA: DeckCard,
  cardB: DeckCard,
): { valid: boolean; warning?: string } {
  const typeA = getPartnerType(cardA);
  const typeB = getPartnerType(cardB);

  if (typeA === null && typeB === null) {
    return { valid: false, warning: "Neither commander has a partner ability" };
  }
  if (typeA === null) {
    return { valid: false, warning: `${cardA.name} doesn't have a partner ability` };
  }
  if (typeB === null) {
    return { valid: false, warning: `${cardB.name} doesn't have a partner ability` };
  }

  // Both generic partner
  if (typeA === 'partner' && typeB === 'partner') return { valid: true };

  // Both friends-forever
  if (typeA === 'friends-forever' && typeB === 'friends-forever') return { valid: true };

  // partner ↔ friends-forever: incompatible
  if (
    (typeA === 'partner' || typeA === 'friends-forever') &&
    (typeB === 'partner' || typeB === 'friends-forever') &&
    typeA !== typeB
  ) {
    return { valid: false, warning: "Partner and Friends Forever are incompatible" };
  }

  // cardA is partner-with: valid if cardB is the named partner
  if (typeA === 'partner-with') {
    const expectedName = getPartnerWithName(cardA);
    if (expectedName && cardB.name === expectedName) return { valid: true };
    return {
      valid: false,
      warning: `${cardA.name} can only partner with ${expectedName ?? 'its named partner'}`,
    };
  }

  // cardB is partner-with: valid if cardA is the named partner
  if (typeB === 'partner-with') {
    const expectedName = getPartnerWithName(cardB);
    if (expectedName && cardA.name === expectedName) return { valid: true };
    return {
      valid: false,
      warning: `${cardB.name} can only partner with ${expectedName ?? 'its named partner'}`,
    };
  }

  return { valid: false, warning: "Incompatible partner abilities" };
}

export function isVehicleOrSpacecraftCommander(card: DeckCard): boolean {
  const typeLine = card.type_line ?? card.card_faces?.[0]?.type_line ?? '';
  const isLegendary = typeLine.includes("Legendary");
  const isVehicle = typeLine.includes("Vehicle");
  const isSpacecraft = typeLine.includes("Spacecraft");
  const hasPT = card.power !== undefined && card.toughness !== undefined;
  return isLegendary && (isVehicle || isSpacecraft) && hasPT;
}
