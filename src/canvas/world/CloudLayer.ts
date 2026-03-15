import * as PIXI from "pixi.js";

type CloudData = { g: PIXI.Graphics; speed: number; wrapX: number };

export class CloudLayer extends PIXI.Container {
  private clouds: CloudData[] = [];

  constructor(viewW: number) {
    super();
    for (let i = 0; i < 7; i++) {
      const g = new PIXI.Graphics();
      const r = 18 + Math.random() * 16;
      // Three overlapping circles = cloud shape
      g.circle(0, 0, r).fill({ color: 0xffffff, alpha: 0.5 });
      g.circle(r * 0.75, -r * 0.25, r * 0.7).fill({ color: 0xffffff, alpha: 0.5 });
      g.circle(-r * 0.65, -r * 0.15, r * 0.65).fill({ color: 0xffffff, alpha: 0.5 });
      g.x = Math.random() * viewW;
      g.y = 50 + Math.random() * 140;
      this.addChild(g);
      this.clouds.push({ g, speed: 0.08 + Math.random() * 0.14, wrapX: viewW });
    }
  }

  tick(delta: number): void {
    for (const cloud of this.clouds) {
      cloud.g.x += cloud.speed * delta;
      if (cloud.g.x > cloud.wrapX + 80) {
        cloud.g.x = -80;
      }
    }
  }
}
