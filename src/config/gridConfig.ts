export const TILE_SIZE_STOPS = [
  { key: "xs", minWidth: 130, gap: 10 },
  { key: "s",  minWidth: 148, gap: 12 },
  { key: "m",  minWidth: 185, gap: 16 },
  { key: "l",  minWidth: 258, gap: 18 },
  { key: "xl", minWidth: 395, gap: 20 },
] as const;

export type TileSizeKey = (typeof TILE_SIZE_STOPS)[number]["key"];
export const DEFAULT_TILE_SIZE: TileSizeKey = "m";
export const TILE_SIZE_STORAGE_KEY = "mtg-tile-size";
