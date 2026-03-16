import * as PIXI from "pixi.js";
import { Villager } from "./Villager.js";
import { COLORS } from "../constants.js";

export class Broccolo extends Villager {
  drawBody(): void {
    const g = this.body;

    // Three body segments
    g.ellipse(-14, 0, 10, 9).fill(COLORS.broccolo);
    g.ellipse(0, 2, 11, 10).fill(COLORS.broccolo);
    g.ellipse(14, 0, 10, 9).fill(COLORS.broccolo);

    // Segment dividers
    g.moveTo(-5, -7).lineTo(-5, 7).stroke({ color: 0xd4a820, width: 1.2 });
    g.moveTo(5, -7).lineTo(5, 7).stroke({ color: 0xd4a820, width: 1.2 });

    // Legs (nubs below each segment)
    g.ellipse(-14, 9, 3, 2).fill(0xd4a820);
    g.ellipse(0, 11, 3, 2).fill(0xd4a820);
    g.ellipse(14, 9, 3, 2).fill(0xd4a820);

    // Head (leftmost, slightly larger and raised)
    g.circle(-22, -6, 11).fill(COLORS.broccolo);
    g.ellipse(-24, -10, 5, 3).fill({ color: 0xffee99, alpha: 0.5 });

    // Antennas
    g.moveTo(-26, -16).lineTo(-30, -23).stroke({ color: 0xd4a820, width: 1.5 });
    g.moveTo(-18, -16).lineTo(-15, -23).stroke({ color: 0xd4a820, width: 1.5 });
    g.circle(-30, -24, 2).fill(0xd4a820);
    g.circle(-15, -24, 2).fill(0xd4a820);

    // Left eye: sclera → iris → pupil → shine
    g.circle(-25, -7, 3.5).fill(0xffffff);
    g.circle(-25, -7, 2.4).fill(0x3a2800);
    g.circle(-25.5, -7.5, 1.3).fill(0x100800);
    g.circle(-26.2, -8.5, 0.8).fill({ color: 0xffffff, alpha: 0.9 });

    // Right eye
    g.circle(-19, -7, 3.5).fill(0xffffff);
    g.circle(-19, -7, 2.4).fill(0x3a2800);
    g.circle(-19.5, -7.5, 1.3).fill(0x100800);
    g.circle(-20.2, -8.5, 0.8).fill({ color: 0xffffff, alpha: 0.9 });

    // Cheeks
    g.ellipse(-28, -4, 4, 3).fill({ color: 0xffaa44, alpha: 0.38 });
    g.ellipse(-16, -4, 4, 3).fill({ color: 0xffaa44, alpha: 0.38 });

    // Smile
    g.moveTo(-24, -2).quadraticCurveTo(-22, 0, -20, -2).stroke({ color: 0xd4a820, width: 1.2 });
  }
}
