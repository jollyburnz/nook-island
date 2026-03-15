import * as PIXI from "pixi.js";
import { District } from "./District";
import { Mailbox } from "../../objects/Mailbox";

export class CentralPlaza extends District {
  readonly mailbox: Mailbox;

  constructor() {
    super(72, 56);
    this.mailbox = new Mailbox();
    this.drawDetails();
    // Mailbox at center-ish of the plaza
    this.mailbox.x = 10;
    this.mailbox.y = -10;
    this.addChild(this.mailbox);
  }

  drawDetails(): void {
    const g = new PIXI.Graphics();
    // Stone tile checkerboard floor
    const TS = 16;
    for (let tx = -60; tx <= 60; tx += TS) {
      for (let ty = -44; ty <= 44; ty += TS) {
        const checker = ((Math.floor(tx / TS) + Math.floor(ty / TS)) % 2 === 0);
        g.rect(tx, ty, TS, TS).fill(checker ? 0xd4c5a9 : 0xc4b599);
      }
    }
    // Clip to ellipse by drawing the island grass on top at edges —
    // the base District ellipse is already drawn underneath, so stones
    // only show inside the grass area visually
    // Small fountain / flower center
    g.circle(0, 0, 10).fill(0xadd8e6);
    g.circle(0, 0, 6).fill(0x5ba4a4);
    // Path signs / benches suggestion
    g.roundRect(-35, 20, 20, 8, 2).fill(0x8b6340); // bench
    g.roundRect(15, 20, 20, 8, 2).fill(0x8b6340);
    this.addChildAt(g, 1); // behind mailbox, above island grass
  }
}
