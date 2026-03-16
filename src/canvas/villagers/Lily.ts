import * as PIXI from "pixi.js";
import { Villager } from "./Villager.js";
import { COLORS } from "../constants.js";

export class Lily extends Villager {
  drawBody(): void {
    const g = this.body;

    // Main body — squashed ellipse
    g.ellipse(0, 4, 20, 14).fill(COLORS.lily);

    // Belly patch
    g.ellipse(0, 6, 13, 9).fill(0xc8e6c8);

    // Head
    g.circle(0, -10, 13).fill(0xaad4aa);

    // Head highlight
    g.ellipse(-4, -15, 6, 3).fill({ color: 0xd0f0d0, alpha: 0.5 });

    // Left eye (4 layers: sclera → iris → pupil → shine)
    g.circle(-6, -16, 4.5).fill(0xffffff);
    g.circle(-6, -16, 3.2).fill(0x2a4a1a);
    g.circle(-6.5, -16.5, 1.8).fill(0x0a1a08);
    g.circle(-7.3, -17.5, 1.0).fill({ color: 0xffffff, alpha: 0.9 });

    // Right eye
    g.circle(6, -16, 4.5).fill(0xffffff);
    g.circle(6, -16, 3.2).fill(0x2a4a1a);
    g.circle(5.5, -16.5, 1.8).fill(0x0a1a08);
    g.circle(4.7, -17.5, 1.0).fill({ color: 0xffffff, alpha: 0.9 });

    // Nostril dots
    g.circle(-3, -8, 1.2).fill(0x6a9a6a);
    g.circle(3, -8, 1.2).fill(0x6a9a6a);

    // Cheeks
    g.ellipse(-9, -10, 5, 3).fill({ color: 0xffb6c1, alpha: 0.4 });
    g.ellipse(9, -10, 5, 3).fill({ color: 0xffb6c1, alpha: 0.4 });

    // Smile
    g.moveTo(-6, -6).quadraticCurveTo(0, -2, 6, -6).stroke({ color: 0x4a7a4a, width: 1.5 });

    // Front arm nubs
    g.ellipse(-18, 4, 5, 4).fill(0x6a9a6a);
    g.ellipse(18, 4, 5, 4).fill(0x6a9a6a);

    // Back leg nubs
    g.ellipse(-12, 17, 7, 5).fill(0x6a9a6a);
    g.ellipse(12, 17, 7, 5).fill(0x6a9a6a);
  }
}
