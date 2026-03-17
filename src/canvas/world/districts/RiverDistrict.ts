import * as PIXI from "pixi.js";
import { District } from "./District";

export class RiverDistrict extends District {
  constructor() {
    super(95, 70);
    this.drawDetails();
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Cottage body (cream)
    g.roundRect(-22, -44, 44, 34, 4).fill(0xf0ede4);
    // Peaked roof (sage green — COLORS.lily = 0x8db48e)
    g.moveTo(-26, -44).lineTo(0, -64).lineTo(26, -44).fill(0x8db48e);
    // Door (wood brown)
    g.roundRect(-8, -26, 16, 16, 3).fill(0x8b6340);
    // Left window
    g.roundRect(-20, -40, 12, 10, 2).fill(0xadc6e8);
    // Right window
    g.roundRect(8, -40, 12, 10, 2).fill(0xadc6e8);
    // Small pond (soft blue)
    g.ellipse(28, 14, 18, 9).fill(0x5ba4d0);
    // Lily pads
    g.circle(24, 12, 5).fill(0x5a9a5a);
    g.circle(34, 10, 4).fill(0x5a9a5a);
    // Lily flower dots (white)
    g.circle(24, 12, 2).fill(0xffffff);
    g.circle(34, 10, 1.5).fill(0xffffff);
    this.addChild(g);
  }
}
