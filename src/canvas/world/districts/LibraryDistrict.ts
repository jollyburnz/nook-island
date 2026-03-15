import * as PIXI from "pixi.js";
import { District } from "./District";

export class LibraryDistrict extends District {
  constructor() {
    super(105, 78);
    this.drawDetails();
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Main building
    g.roundRect(-30, -54, 52, 42, 4).fill(0x5ba4a4);
    // Roof
    g.rect(-32, -58, 56, 8).fill(0x4a8a8a);
    // Sign
    g.roundRect(-20, -50, 32, 10, 2).fill(0x4a8a8a);
    // Windows
    g.roundRect(-24, -44, 14, 14, 2).fill(0xadd8e6);
    g.roundRect(-6, -44, 14, 14, 2).fill(0xadd8e6);
    // Door
    g.roundRect(10, -30, 12, 18, 3).fill(0x8b6340);
    // Dock extending to the right (over water)
    g.rect(20, -6, 55, 10).fill(0x8b6340);
    g.rect(20, -6, 55, 3).fill(0xa07848); // dock top
    // Dock posts
    for (let i = 0; i < 3; i++) {
      g.rect(28 + i * 16, 4, 4, 14).fill(0x6b4c28);
    }
    this.addChild(g);
  }
}
