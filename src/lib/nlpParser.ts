export interface ParsedToken {
  label: string;
  value: string;
  scryfall: string;
  matchedText: string;
}

export interface ParseResult {
  tokens: ParsedToken[];
  remainder: string;
  scryfallQuery: string;
}

interface PatternEntry {
  regex: RegExp;
  token?: Omit<ParsedToken, "matchedText">;
  dynamic?: (m: RegExpMatchArray) => Omit<ParsedToken, "matchedText">;
}

const PATTERNS: PatternEntry[] = [
  // Colors
  { regex: /\b(red)\b/i, token: { label: "color", value: "Red", scryfall: "c:R" } },
  { regex: /\b(green)\b/i, token: { label: "color", value: "Green", scryfall: "c:G" } },
  { regex: /\b(blue)\b/i, token: { label: "color", value: "Blue", scryfall: "c:U" } },
  { regex: /\b(white)\b/i, token: { label: "color", value: "White", scryfall: "c:W" } },
  { regex: /\b(black)\b/i, token: { label: "color", value: "Black", scryfall: "c:B" } },
  { regex: /\b(colorless)\b/i, token: { label: "color", value: "Colorless", scryfall: "c:C" } },

  // Card types
  { regex: /\b(creature)s?\b/i, token: { label: "type", value: "Creature", scryfall: "t:creature" } },
  { regex: /\b(instant)s?\b/i, token: { label: "type", value: "Instant", scryfall: "t:instant" } },
  { regex: /\b(sorcery|sorceries)\b/i, token: { label: "type", value: "Sorcery", scryfall: "t:sorcery" } },
  { regex: /\b(enchantment)s?\b/i, token: { label: "type", value: "Enchantment", scryfall: "t:enchantment" } },
  { regex: /\b(artifact)s?\b/i, token: { label: "type", value: "Artifact", scryfall: "t:artifact" } },
  { regex: /\b(land)s?\b/i, token: { label: "type", value: "Land", scryfall: "t:land" } },
  { regex: /\b(planeswalker)s?\b/i, token: { label: "type", value: "Planeswalker", scryfall: "t:planeswalker" } },
  { regex: /\b(legendary)\b/i, token: { label: "type", value: "Legendary", scryfall: "t:legendary" } },

  // Keywords
  { regex: /\bflying\b/i, token: { label: "kw", value: "Flying", scryfall: "o:flying" } },
  { regex: /\btrample\b/i, token: { label: "kw", value: "Trample", scryfall: "o:trample" } },
  { regex: /\bdeathtouch\b/i, token: { label: "kw", value: "Deathtouch", scryfall: "o:deathtouch" } },
  { regex: /\blifelink\b/i, token: { label: "kw", value: "Lifelink", scryfall: "o:lifelink" } },
  { regex: /\bhaste\b/i, token: { label: "kw", value: "Haste", scryfall: "o:haste" } },
  { regex: /\bmenace\b/i, token: { label: "kw", value: "Menace", scryfall: "o:menace" } },
  { regex: /\bhexproof\b/i, token: { label: "kw", value: "Hexproof", scryfall: "o:hexproof" } },
  { regex: /\bindestructible\b/i, token: { label: "kw", value: "Indestructible", scryfall: "o:indestructible" } },
  { regex: /\bward\b/i, token: { label: "kw", value: "Ward", scryfall: "o:ward" } },
  { regex: /\bfear\b/i, token: { label: "kw", value: "Fear", scryfall: "o:fear" } },
  { regex: /\bdouble strike\b/i, token: { label: "kw", value: "Double Strike", scryfall: 'o:"double strike"' } },

  // CMC — must come before price to avoid "under 5 mana" being parsed as price
  {
    regex: /under\s*(\d+)\s*mana/i,
    dynamic: (m) => ({ label: "cmc", value: `≤ ${m[1]}`, scryfall: `cmc<=${m[1]}` }),
  },
  {
    regex: /(\d+)\s*(?:cmc|mana)\s*or\s*less/i,
    dynamic: (m) => ({ label: "cmc", value: `≤ ${m[1]}`, scryfall: `cmc<=${m[1]}` }),
  },
  {
    regex: /(\d+)\s*drop/i,
    dynamic: (m) => ({ label: "cmc", value: `= ${m[1]}`, scryfall: `cmc=${m[1]}` }),
  },

  // Price (dynamic — after CMC to avoid matching "under 5 mana")
  {
    regex: /under\s*\$?(\d+)/i,
    dynamic: (m) => ({ label: "price", value: `< $${m[1]}`, scryfall: `usd<${m[1]}` }),
  },
  {
    regex: /less than\s*\$?(\d+)/i,
    dynamic: (m) => ({ label: "price", value: `< $${m[1]}`, scryfall: `usd<${m[1]}` }),
  },

  // Archetypes
  {
    regex: /\bramp\b/i,
    token: { label: "archetype", value: "Ramp", scryfall: 'o:"add" (t:creature OR t:artifact OR t:sorcery)' },
  },
  {
    regex: /\bboard\s*wipes?\b/i,
    token: { label: "archetype", value: "Board Wipe", scryfall: 'o:"destroy all" OR o:"exile all"' },
  },
  {
    regex: /\bremoval\b/i,
    token: { label: "archetype", value: "Removal", scryfall: 'o:"destroy target" OR o:"exile target"' },
  },
  {
    regex: /\bcard\s*draw\b/i,
    token: { label: "archetype", value: "Card Draw", scryfall: 'o:"draw" -t:land' },
  },
  {
    regex: /\btutor\b/i,
    token: { label: "archetype", value: "Tutor", scryfall: 'o:"search your library"' },
  },
  {
    regex: /\bcounter\s*spell\b/i,
    token: { label: "archetype", value: "Counterspell", scryfall: 'o:"counter target"' },
  },
  {
    regex: /\bprotection\b/i,
    token: { label: "archetype", value: "Protection", scryfall: 'o:"hexproof" OR o:"indestructible"' },
  },
  {
    regex: /\btoken\b/i,
    token: { label: "archetype", value: "Token Maker", scryfall: 'o:"create" o:"token"' },
  },
  {
    regex: /\blifegain\b/i,
    token: { label: "archetype", value: "Lifegain", scryfall: 'o:"gain" o:"life"' },
  },

  // Rarity
  { regex: /\bcommon\b/i, token: { label: "rarity", value: "Common", scryfall: "r:common" } },
  { regex: /\buncommon\b/i, token: { label: "rarity", value: "Uncommon", scryfall: "r:uncommon" } },
  { regex: /\brare\b/i, token: { label: "rarity", value: "Rare", scryfall: "r:rare" } },
  { regex: /\bmythic\b/i, token: { label: "rarity", value: "Mythic", scryfall: "r:mythic" } },

  // Budget shortcut
  { regex: /\bbudget\b/i, token: { label: "price", value: "< $2", scryfall: "usd<2" } },
];

export function parseSearchQuery(input: string): ParseResult {
  const tokens: ParsedToken[] = [];
  let remainder = input;

  for (const pattern of PATTERNS) {
    const match = remainder.match(pattern.regex);
    if (match) {
      const base = pattern.dynamic ? pattern.dynamic(match) : pattern.token!;
      tokens.push({ ...base, matchedText: match[0] });
      remainder = remainder.replace(match[0], "").replace(/\s+/g, " ").trim();
    }
  }

  const scryfallParts = tokens.map((t) => t.scryfall);
  if (remainder) scryfallParts.push(remainder);
  const scryfallQuery = scryfallParts.join(" ").trim();

  return { tokens, remainder, scryfallQuery };
}
