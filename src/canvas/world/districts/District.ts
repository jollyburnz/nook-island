import * as PIXI from "pixi.js";
import { COLORS } from "../../constants";

export abstract class District extends PIXI.Container {
  protected ground = new PIXI.Graphics();

  constructor(protected rx: number, protected ry: number) {
    super();
    this.addChild(this.ground);
    this.drawIsland();

    // Click-to-focus: make the district clickable
    this.eventMode = "static";
    this.cursor = "pointer";
    this.hitArea = new PIXI.Ellipse(0, 0, rx + 14, ry + 10);
  }

  protected drawIsland(): void {
    const g = this.ground;
    // Beach rim (slightly larger ellipse)
    g.ellipse(0, 0, this.rx + 12, this.ry + 8).fill(COLORS.sand);
    // Grass interior
    g.ellipse(0, 0, this.rx, this.ry).fill(COLORS.grass);
  }

  abstract drawDetails(): void;
}
