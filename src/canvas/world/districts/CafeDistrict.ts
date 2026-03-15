import * as PIXI from "pixi.js";
import { District } from "./District";

export class CafeDistrict extends District {
  constructor() {
    super(100, 75);
    this.drawDetails();
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Building body
    g.roundRect(-26, -48, 52, 38, 4).fill(0x9ba7b0);
    // Roof
    g.rect(-28, -52, 56, 8).fill(0x7a8890);
    // Awning stripes (alternating)
    for (let i = 0; i < 5; i++) {
      g.rect(-26 + i * 10, -52, 6, 8).fill(i % 2 === 0 ? 0xe07060 : 0x9ba7b0);
    }
    // Window
    g.roundRect(-18, -40, 18, 16, 2).fill(0xadc6e8);
    // Door
    g.roundRect(4, -28, 14, 18, 3).fill(0x6b4c28);
    // Coffee cup sign
    g.circle(-10, -60, 8).fill(0xffffff);
    g.circle(-10, -60, 5).fill(0x8b4513);
    // Chimney with smoke
    g.rect(14, -62, 8, 14).fill(0x7a8890);
    g.circle(18, -65, 5).fill({ color: 0xffffff, alpha: 0.4 });
    g.circle(22, -70, 4).fill({ color: 0xffffff, alpha: 0.3 });
    this.addChild(g);
  }
}
