import * as PIXI from "pixi.js";

export abstract class Villager extends PIXI.Container {
  protected body = new PIXI.Graphics();
  private thinkBubble = new PIXI.Graphics();
  private highlightRing = new PIXI.Graphics();
  private idleT = 0;
  protected baseY = 0;
  private active = false;
  private highlightAlpha = 0.3;
  private highlightDir = 1;
  private _bouncesLeft = 0;

  constructor() {
    super();
    this.addChild(this.highlightRing, this.body, this.thinkBubble);
    this.drawBody();
    this.drawThinkBubble();
    this.thinkBubble.visible = false;
  }

  abstract drawBody(): void;

  private drawThinkBubble(): void {
    const g = this.thinkBubble;
    // Slightly higher to give taller sprites (ears/horns) breathing room
    g.circle(-8, -56, 3.5).fill({ color: 0xffffff, alpha: 0.9 });
    g.circle(0, -56, 3.5).fill({ color: 0xffffff, alpha: 0.9 });
    g.circle(8, -56, 3.5).fill({ color: 0xffffff, alpha: 0.9 });
  }

  setActive(active: boolean): void {
    this.active = active;
    this.thinkBubble.visible = active;
  }

  happyBounce(): void {
    this._bouncesLeft = 30;
  }

  tick(delta: number): void {
    this.idleT += delta * 0.04;
    if (this._bouncesLeft > 0) {
      this.y = this.baseY + Math.sin(this.idleT * 6) * 10;
      this._bouncesLeft -= delta;
    } else {
      const amp = this.active ? 4 : 1.5;
      this.y = this.baseY + Math.sin(this.idleT) * amp;
    }
    // Highlight ring pulse
    if (this.active) {
      this.highlightAlpha += this.highlightDir * 0.012 * delta;
      if (this.highlightAlpha > 0.7) this.highlightDir = -1;
      if (this.highlightAlpha < 0.2) this.highlightDir = 1;
      this.highlightRing.clear();
      this.highlightRing.circle(0, 4, 30).fill({ color: 0xffffff, alpha: this.highlightAlpha });
    } else {
      this.highlightRing.clear();
    }
  }
}
