export const TILE_SIZE_STOPS = [
  { key: "xs", minWidth: 126, gap: 10 },  // target 12 cols @ 1624px effective grid
  { key: "s",  minWidth: 142, gap: 12 },  // target 10 cols @ 1624px
  { key: "m",  minWidth: 178, gap: 16 },  // target 8 cols @ 1624px
  { key: "l",  minWidth: 248, gap: 18 },  // target 6 cols @ 1624px
  { key: "xl", minWidth: 380, gap: 20 },  // target 4 cols @ 1624px
] as const;

export type TileSizeKey = (typeof TILE_SIZE_STOPS)[number]["key"];
export const DEFAULT_TILE_SIZE: TileSizeKey = "m";
export const TILE_SIZE_STORAGE_KEY = "mtg-tile-size";
