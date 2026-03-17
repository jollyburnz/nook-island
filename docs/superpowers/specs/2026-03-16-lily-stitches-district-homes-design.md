# Lily & Stitches District Homes — Design Spec
Date: 2026-03-16

## Context

Lily (🐸 River district) and Stitches (🧸 ArtShed district) were added to the Nook Island canvas without land chunks — they stand on ocean water south and north of the plaza. All other villagers (Sherb, Maple, Zucker, Marshal) have named District classes that render a grass+sand island ellipse with a character-appropriate building. This spec adds the two missing districts so every villager has a home.

## Architecture

**Pattern** (identical to all 5 existing districts):
- Class extends `District` (`src/canvas/world/districts/District.ts`)
- Constructor: `super(rx, ry)` → `this.drawDetails()`
- `drawDetails()`: create a `new PIXI.Graphics()`, draw building shapes, `this.addChild(g)`
- `District` base handles: sand+grass ellipses, click hitArea, `eventMode: "static"`

**New files:**
- `src/canvas/world/districts/RiverDistrict.ts`
- `src/canvas/world/districts/ArtshedDistrict.ts`

**Modified file:**
- `src/canvas/world/World.ts` — add import, instantiation, districtMap entries for both

## RiverDistrict (`lily`)

**Size:** rx=95, ry=70

**Theme:** Sage green cottage with riverside details. Color palette anchored to `COLORS.lily` = 0x8db48e.

**`drawDetails()` implementation:**

```typescript
import * as PIXI from "pixi.js";
import { District } from "./District.js";

export class RiverDistrict extends District {
  constructor() {
    super(95, 70);
    this.drawDetails();
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Cottage body (cream)
    g.roundRect(-22, -44, 44, 34, 4).fill(0xf0ede4);
    // Peaked roof (sage green)
    g.moveTo(-26, -44).lineTo(0, -64).lineTo(26, -44).fill(0x8db48e);
    // Door (wood brown)
    g.roundRect(-8, -26, 16, 16, 3).fill(0x8b6340);
    // Left window
    g.roundRect(-20, -40, 12, 10, 2).fill(0xadc6e8);
    // Right window
    g.roundRect(8, -40, 12, 10, 2).fill(0xadc6e8);
    // Small pond (soft blue ellipse)
    g.ellipse(28, 14, 18, 9).fill(0x5ba4d0);
    // Lily pads on the pond
    g.circle(24, 12, 5).fill(0x5a9a5a);
    g.circle(34, 10, 4).fill(0x5a9a5a);
    // Lily flower dots (white)
    g.circle(24, 12, 2).fill(0xffffff);
    g.circle(34, 10, 1.5).fill(0xffffff);
    this.addChild(g);
  }
}
```

**Key coordinates:**
- Building body: x: -22 to 22, y: -44 to -10 (centered on district origin)
- Roof peak: y=-64
- Pond: right-forward at (28, 14) — partially off-grass edge is fine (same precedent as Zucker's dock)

## ArtshedDistrict (`stitches`)

**Size:** rx=100, ry=72

**Theme:** Creative workshop shed with patchwork roof and freestanding easel. Color palette anchored to `COLORS.stitches` = 0xf4a7b9.

**`drawDetails()` implementation:**

```typescript
import * as PIXI from "pixi.js";
import { District } from "./District.js";

export class ArtshedDistrict extends District {
  constructor() {
    super(100, 72);
    this.drawDetails();
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Shed body (light pink/cream)
    g.roundRect(-26, -46, 52, 36, 4).fill(0xfde0eb);
    // Patchwork roof — base strip
    g.rect(-28, -52, 56, 10).fill(0xf4a7b9);
    // Left roof patch (darker pink)
    g.rect(-28, -52, 18, 10).fill(0xe89ab0);
    // Right roof patch (lighter pink)
    g.rect(10, -52, 18, 10).fill(0xfac0d0);
    // Stitch marks between patches
    g.moveTo(-10, -52).lineTo(-10, -42).stroke({ color: 0x9a506a, width: 1 });
    g.moveTo(10, -52).lineTo(10, -42).stroke({ color: 0x9a506a, width: 1 });
    // Door (wood brown)
    g.roundRect(6, -28, 14, 18, 3).fill(0x8b6340);
    // Window (light blue)
    g.roundRect(-22, -40, 18, 14, 2).fill(0xadc6e8);
    // Freestanding easel (right of shed)
    g.moveTo(34, 8).lineTo(42, -14).stroke({ color: 0x8b6340, width: 2 }); // left leg
    g.moveTo(52, 8).lineTo(42, -14).stroke({ color: 0x8b6340, width: 2 }); // right leg
    g.moveTo(36, 4).lineTo(50, 4).stroke({ color: 0x8b6340, width: 2 });   // cross brace
    // Canvas on easel
    g.rect(30, -14, 22, 16).fill(0xffffff);
    // Paint marks on canvas (3 dabs)
    g.circle(35, -8, 3).fill(0xff6b6b);  // red
    g.circle(41, -10, 3).fill(0xf4a7b9); // pink
    g.circle(47, -6, 3).fill(0xffe066);  // yellow
    this.addChild(g);
  }
}
```

**Key coordinates:**
- Building body: x: -26 to 26, y: -46 to -10
- Roof peak (flat, rect): y=-52 to -42
- Easel: x: 34 to 52, y: -14 to 8 — within rx=100 grass extent at those y values (≈ x±99)

## World.ts Integration

File: `src/canvas/world/World.ts`

**Add imports** (after existing district imports):
```typescript
import { RiverDistrict } from "./districts/RiverDistrict.js";
import { ArtshedDistrict } from "./districts/ArtshedDistrict.js";
```

**Instantiate** (with the other 5 districts):
```typescript
const river = new RiverDistrict();
const artshed = new ArtshedDistrict();
```

**Add to `districtMap`:**
```typescript
this.districtMap = new Map([
  ["plaza",    plaza],
  ["townhall", townhall],
  ["forest",   forest],
  ["library",  library],
  ["cafe",     cafe],
  ["river",    river],    // ← new
  ["artshed",  artshed],  // ← new
]);
```

⚠️ The `this.mailbox = plaza.mailbox` line immediately after the map construction must be preserved — do not remove or reorder it.

The existing for-loop that iterates `districtMap` automatically positions each chunk at `DISTRICT_POS[key]`:
- `river` → `DISTRICT_POS.river` = `{ x: 2560, y: 480 }` ✓
- `artshed` → `DISTRICT_POS.artshed` = `{ x: 2560, y: 2880 }` ✓

No changes to `DISTRICT_POS` or `VILLAGER_TO_DISTRICT` needed (already set in constants.ts from v2-lily and v2-stitches work).

## Import Convention Note

Existing district imports in `World.ts` inconsistently use `.js` extension (newer imports have it, older don't). New imports **must** use `.js` extension to be consistent with the Piper/Broccolo/Lily/Stitches pattern and Node ESM requirements. The new District files themselves should also use `.js` on their `District` import.

## Verification

1. `npm run dev` — both districts appear as land chunks on the canvas
2. Lily's cottage visible at top-center of island (north of plaza)
3. Stitches' art shed visible at bottom-center (south of plaza)
4. Click either district → camera lerps to focus on it
5. `npx tsc --project tsconfig.json --noEmit` — zero errors
6. `npx tsc --project tsconfig.electron.json --noEmit` — zero errors
