import * as PIXI from "pixi.js";
import type { Camera } from "../camera/Camera";
import type { World } from "../world/World";

const MARGIN = 36; // px inset from viewport edges

/**
 * Viewport-fixed arrow + emoji that appears at the screen edge when the active
 * district scrolls off-screen.
 *
 * Fix: pill background and arrow triangle are separate Graphics children so
 * only arrowShape.rotation changes — the pill stays axis-aligned.
 */
export class OffscreenIndicator extends PIXI.Container {
  private pill = new PIXI.Graphics();        // background — never rotated
  private arrowShape = new PIXI.Graphics();  // triangle — rotated toward target
  private emojiLabel: PIXI.Text;

  constructor(
    private camera: Camera,
    private world: World,
    private vw: number,
    private vh: number,
  ) {
    super();
    this.emojiLabel = new PIXI.Text({
      text: "",
      style: { fontSize: 20 },
    });
    this.emojiLabel.anchor.set(0.5);
    this.addChild(this.pill, this.arrowShape, this.emojiLabel);
    this.visible = false;
  }

  tick(_delta: number): void {
    const pos = this.world.activeDistrictPos;
    if (!pos) {
      this.visible = false;
      return;
    }

    // If the active district is on screen, hide the indicator
    if (this.camera.isOnScreen(pos.x, pos.y, -40)) {
      this.visible = false;
      return;
    }

    this.visible = true;

    const screen = this.camera.screenPos(pos.x, pos.y);

    // Clamp indicator position to viewport edges
    const cx = Math.max(MARGIN, Math.min(this.vw - MARGIN, screen.x));
    const cy = Math.max(MARGIN, Math.min(this.vh - MARGIN, screen.y));
    this.x = cx;
    this.y = cy;

    // Pill background — static, never rotated
    this.pill.clear();
    this.pill.roundRect(-18, -18, 36, 36, 10).fill({ color: 0x000000, alpha: 0.35 });

    // Arrow triangle — rotated to point toward the off-screen district
    const angle = Math.atan2(screen.y - cy, screen.x - cx);
    this.arrowShape.clear();
    this.arrowShape.rotation = angle;
    this.arrowShape.moveTo(14, 0)
      .lineTo(-7, -7)
      .lineTo(-7, 7)
      .closePath()
      .fill({ color: 0xffffff, alpha: 0.95 });

    // Emoji label above the indicator
    this.emojiLabel.text = this.world.activeVillagerEmoji ?? "";
    this.emojiLabel.x = 0;
    this.emojiLabel.y = -30;
  }
}
