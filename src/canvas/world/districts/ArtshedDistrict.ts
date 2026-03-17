import * as PIXI from "pixi.js";
import { District } from "./District";

export class ArtshedDistrict extends District {
  constructor() {
    super(100, 72);
    this.drawDetails();
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Shed body (light pink/cream)
    g.roundRect(-26, -46, 52, 36, 4).fill(0xfde0eb);
    // Patchwork roof — base strip (COLORS.stitches = 0xf4a7b9)
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
