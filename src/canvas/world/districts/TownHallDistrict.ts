import * as PIXI from "pixi.js";
import { District } from "./District";

export class TownHallDistrict extends District {
  constructor() {
    super(110, 80);
    this.drawDetails();
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Building main body
    g.roundRect(-28, -52, 56, 40, 4).fill(0xd4c5e8);
    // Roof triangle
    g.moveTo(-32, -52).lineTo(0, -74).lineTo(32, -52).fill(0xb8a8d8);
    // Door
    g.roundRect(-8, -28, 16, 20, 4).fill(0x8a70c0);
    // Windows
    g.roundRect(-24, -46, 14, 12, 2).fill(0xadc6e8);
    g.roundRect(10, -46, 14, 12, 2).fill(0xadc6e8);
    // Flag pole + flag
    g.rect(-1, -90, 2, 20).fill(0x7f8c8d);
    g.rect(0, -90, 12, 8).fill(0xe74c3c);
    this.addChild(g);
  }
}
