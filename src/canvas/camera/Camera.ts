import * as PIXI from "pixi.js";
import { DISTRICT_POS } from "../constants";
import type { DistrictKey } from "../constants";

export class Camera {
  private targetX = 0;
  private targetY = 0;

  constructor(private world: PIXI.Container, private vw: number, private vh: number) {
    this.focusOn("plaza");
  }

  focusOn(key: DistrictKey): void {
    const pos = DISTRICT_POS[key];
    this.targetX = this.vw / 2 - pos.x;
    this.targetY = this.vh / 2 - pos.y;
  }

  /** Convert a world-space point to current screen-space coordinates. */
  screenPos(worldX: number, worldY: number): { x: number; y: number } {
    return { x: worldX + this.world.x, y: worldY + this.world.y };
  }

  /** True if the given world-space point is currently inside the viewport. */
  isOnScreen(worldX: number, worldY: number, margin = 60): boolean {
    const { x, y } = this.screenPos(worldX, worldY);
    return x > -margin && x < this.vw + margin && y > -margin && y < this.vh + margin;
  }

  tick(delta: number): void {
    const s = Math.min(0.08 * delta, 1);
    this.world.x += (this.targetX - this.world.x) * s;
    this.world.y += (this.targetY - this.world.y) * s;
  }
}
