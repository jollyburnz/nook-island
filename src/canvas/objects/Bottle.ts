import * as PIXI from "pixi.js";
import { DISTRICT_POS, COLORS } from "../constants";
import type { DistrictKey } from "../constants";

export class Bottle extends PIXI.Container {
  private g = new PIXI.Graphics();
  private floatT = 0;
  private traveling = false;
  private startX = 0;
  private startY = 0;
  private endX = 0;
  private endY = 0;
  private arrivalY = 0;  // anchors idle float so y doesn't accumulate
  private progress = 0;
  private _popT = 0;
  private onArrived?: () => void;

  constructor() {
    super();
    this.addChild(this.g);
    this.draw();
    this.visible = false;
  }

  private draw(): void {
    this.g.clear();
    // Bottle body
    this.g.roundRect(-5, 0, 10, 16, 3).fill(COLORS.bottle);
    // Cork
    this.g.roundRect(-3, -6, 6, 7, 2).fill(COLORS.cork);
    // Shine
    this.g.circle(1, 5, 3).fill({ color: 0xffffff, alpha: 0.3 });
  }

  travelTo(from: DistrictKey, to: DistrictKey, onDone: () => void): void {
    const a = DISTRICT_POS[from];
    const b = DISTRICT_POS[to];
    this.visible = true;
    this.startX = a.x;
    this.startY = a.y;
    this.endX = b.x;
    this.endY = b.y;
    this.x = a.x;
    this.y = a.y;
    this.progress = 0;
    this.traveling = true;
    this.onArrived = onDone;
  }

  tick(delta: number): void {
    this.floatT += delta * 0.05;

    // Cork-pop scale bounce
    if (this._popT > 0) {
      const t = 1 - this._popT / 10;
      this.scale.set(1 + 0.4 * (1 - t * t));
      this._popT -= delta;
      if (this._popT <= 0) this.scale.set(1);
    }

    if (this.traveling) {
      this.progress += delta * 0.006; // ~165 ticks to travel full diagonal
      if (this.progress >= 1) {
        this.progress = 1;
        this.traveling = false;
        this.arrivalY = this.endY; // anchor idle float to arrival position
        this._popT = 10;
        this.onArrived?.();
      }
      // Ease in-out
      const p = this.progress;
      const t = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      this.x = this.startX + (this.endX - this.startX) * t;
      this.y = this.startY + (this.endY - this.startY) * t + Math.sin(this.floatT * 4) * 10;
    } else {
      // Idle float anchored to arrivalY so y doesn't drift over time
      this.y = this.arrivalY + Math.sin(this.floatT) * 4;
    }
  }
}
