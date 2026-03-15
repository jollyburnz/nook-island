import * as PIXI from "pixi.js";
import { COLORS } from "../constants";

export class Mailbox extends PIXI.Container {
  private g = new PIXI.Graphics();
  private flagRaised = false;
  private glowAlpha = 0;
  private glowDir = 1;
  private costText: PIXI.Text | null = null;

  constructor() {
    super();
    this.addChild(this.g);
    this.redraw();
  }

  private redraw(): void {
    const g = this.g;
    g.clear();
    // Glow halo when complete
    if (this.flagRaised && this.glowAlpha > 0) {
      g.circle(0, -28, 20).fill({ color: 0xffd700, alpha: this.glowAlpha });
    }
    // Post
    g.rect(-1, -24, 2, 24).fill(0x7f8c8d);
    // Box body
    g.roundRect(-10, -42, 20, 18, 3).fill(COLORS.mailbox);
    // Lid
    g.roundRect(-10, -44, 20, 5, 2).fill(0xe74c3c);
    // Flag
    if (this.flagRaised) {
      g.rect(10, -40, 2, 14).fill(0x7f8c8d);
      g.rect(12, -40, 9, 6).fill(0xe74c3c);
    } else {
      // Flag down
      g.rect(10, -32, 2, 8).fill(0x7f8c8d);
      g.rect(10, -32, 6, 5).fill(0xe74c3c);
    }
  }

  onComplete(cost: number): void {
    this.flagRaised = true;
    this.glowDir = 1;
    // Floating cost text
    const t = new PIXI.Text({
      text: `$${cost.toFixed(4)}`,
      style: { fontSize: 16, fill: 0xffd700, fontWeight: "bold", dropShadow: { alpha: 0.5, angle: Math.PI / 4, blur: 2, distance: 2 } },
    });
    t.anchor.set(0.5);
    t.x = 0;
    t.y = -60;
    this.addChild(t);
    this.costText = t;
  }

  tick(delta: number): void {
    if (!this.flagRaised) return;

    // Glow pulse
    this.glowAlpha += this.glowDir * 0.015 * delta;
    if (this.glowAlpha > 0.55) this.glowDir = -1;
    if (this.glowAlpha < 0.15) this.glowDir = 1;
    this.redraw();

    // Float cost text up and fade
    if (this.costText) {
      this.costText.y -= 0.4 * delta;
      this.costText.alpha -= 0.004 * delta;
      if (this.costText.alpha <= 0) {
        this.removeChild(this.costText);
        this.costText.destroy();
        this.costText = null;
      }
    }
  }

  reset(): void {
    this.flagRaised = false;
    this.glowAlpha = 0;
    if (this.costText) {
      this.removeChild(this.costText);
      this.costText.destroy();
      this.costText = null;
    }
    this.redraw();
  }
}
