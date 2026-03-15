import * as PIXI from "pixi.js";
import { District } from "./District";

export class ForestDistrict extends District {
  constructor() {
    super(100, 75);
    this.drawDetails();
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Three trees: trunk + canopy
    const trees = [
      { x: -30, y: -20 }, { x: 10, y: -35 }, { x: -5, y: -10 },
    ];
    for (const tree of trees) {
      // Trunk
      g.rect(tree.x - 4, tree.y + 10, 8, 20).fill(0x8b5e3c);
      // Canopy shadow layer
      g.circle(tree.x, tree.y, 22).fill(0x3d8a3d);
      // Canopy main
      g.circle(tree.x, tree.y - 4, 20).fill(0x4a9e4a);
      // Highlight
      g.circle(tree.x - 4, tree.y - 8, 8).fill(0x5ec05e);
    }
    // Some small bushes
    g.circle(30, 10, 10).fill(0x4a9e4a);
    g.circle(22, 18, 8).fill(0x3d8a3d);
    this.addChild(g);
  }
}
