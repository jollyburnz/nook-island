import * as PIXI from "pixi.js";
import { COLORS, WORLD_W, WORLD_H, TILE } from "../constants";

/**
 * Ocean water shimmer.
 *
 * Previous approach: 16,000 individual rect().fill() calls per redraw → catastrophic GPU load.
 * New approach: one TilingSprite with a 2×2 checker texture baked from a Canvas2D element.
 * Shimmer effect: shift tilePosition.x by TILE each phase toggle → 1 GPU draw call total.
 */
export class WaterTiles extends PIXI.Container {
  private tiling: PIXI.TilingSprite;
  private t = 0;
  private phase = false;

  constructor() {
    super();

    // Build a (TILE*2) × (TILE*2) canvas with a 2×2 checker pattern
    const size = TILE * 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Convert hex numbers to CSS color strings
    const c1 = `#${COLORS.ocean.toString(16).padStart(6, "0")}`;   // light ocean
    const c2 = `#${COLORS.oceanDk.toString(16).padStart(6, "0")}`; // dark ocean

    // Top-left + bottom-right: light; top-right + bottom-left: dark
    ctx.fillStyle = c1; ctx.fillRect(0,    0,    TILE, TILE);
    ctx.fillStyle = c2; ctx.fillRect(TILE, 0,    TILE, TILE);
    ctx.fillStyle = c2; ctx.fillRect(0,    TILE, TILE, TILE);
    ctx.fillStyle = c1; ctx.fillRect(TILE, TILE, TILE, TILE);

    const texture = PIXI.Texture.from(canvas);
    this.tiling = new PIXI.TilingSprite({ texture, width: WORLD_W, height: WORLD_H });
    this.addChild(this.tiling);
  }

  tick(delta: number): void {
    this.t += delta;
    if (this.t > 30) {
      this.t = 0;
      this.phase = !this.phase;
      // Shift by one tile to invert the checker pattern — produces shimmer with zero redraws
      this.tiling.tilePosition.x = this.phase ? TILE : 0;
    }
  }
}
