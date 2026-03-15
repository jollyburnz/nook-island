export const TILE = 32;
export const WORLD_W = 160 * TILE; // 5120
export const WORLD_H = 100 * TILE; // 3200

export const DISTRICT_POS = {
  plaza:    { x: 2560, y: 1600 },
  townhall: { x: 1120, y: 960  },
  forest:   { x: 4000, y: 960  },
  library:  { x: 1120, y: 2400 },
  cafe:     { x: 4000, y: 2400 },
} as const;

export type DistrictKey = keyof typeof DISTRICT_POS;

export const VILLAGER_TO_DISTRICT: Record<string, DistrictKey> = {
  sherb: "townhall", maple: "forest", zucker: "library", marshal: "cafe",
};

export const VILLAGER_EMOJI: Record<string, string> = {
  sherb: "🐐", maple: "🐻", zucker: "🐙", marshal: "🐿️",
};

export const COLORS = {
  ocean:   0x4a90d9,
  oceanDk: 0x2a70b9,
  sand:    0xf5deb3,
  sandDk:  0xe8d4a8,
  grass:   0x7ec860,
  grassDk: 0x5ba840,
  path:    0xd4c5a9,
  bridge:  0xb89a6a,
  sherb:   0xc3b1e1,
  maple:   0xe8a87c,
  zucker:  0xe07060,
  marshal: 0x9ba7b0,
  mailbox: 0xc0392b,
  bottle:  0x88ccff,
  cork:    0xc3b1e1,
} as const;
