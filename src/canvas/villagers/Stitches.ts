import { Villager } from "./Villager.js";
import { COLORS } from "../constants.js";

export class Stitches extends Villager {
  drawBody(): void {
    const g = this.body;

    // Body patches (overlapping ellipses = patchwork effect)
    g.ellipse(0, 4, 18, 16).fill(COLORS.stitches);       // main patch
    g.ellipse(-7, -1, 11, 10).fill(0xfac0d0);             // upper-left patch (lighter)
    g.ellipse(7, 8, 10, 9).fill(0xe89ab0);                // lower-right patch (darker)

    // Belly patch
    g.ellipse(0, 7, 9, 7).fill(0xfde0eb);

    // Stitch marks (short strokes at patch seams)
    g.moveTo(-1, -5).lineTo(3, -3).stroke({ color: 0x9a506a, width: 1 });
    g.moveTo(-5, 7).lineTo(-1, 9).stroke({ color: 0x9a506a, width: 1 });
    g.moveTo(6, 1).lineTo(10, 3).stroke({ color: 0x9a506a, width: 1 });

    // Head
    g.circle(0, -14, 13).fill(COLORS.stitches);

    // Head patch (lighter section — patchwork asymmetry)
    g.ellipse(4, -18, 8, 5).fill(0xfac0d0);
    g.moveTo(2, -10).lineTo(6, -9).stroke({ color: 0x9a506a, width: 1 }); // head stitch

    // Head highlight
    g.ellipse(-4, -20, 5, 3).fill({ color: 0xfde0eb, alpha: 0.6 });

    // Ears (circles with inner lighter circle)
    g.circle(-10, -25, 5).fill(COLORS.stitches);
    g.circle(-10, -25, 3).fill(0xfde0eb);
    g.circle(10, -25, 5).fill(COLORS.stitches);
    g.circle(10, -25, 3).fill(0xfde0eb);

    // Left eye (4 layers: sclera → iris → pupil → shine)
    g.circle(-5, -16, 3.5).fill(0xffffff);
    g.circle(-5, -16, 2.4).fill(0x2a1a00);
    g.circle(-5.5, -16.5, 1.3).fill(0x080400);
    g.circle(-6.3, -17.5, 0.8).fill({ color: 0xffffff, alpha: 0.92 });

    // Right eye
    g.circle(5, -16, 3.5).fill(0xffffff);
    g.circle(5, -16, 2.4).fill(0x2a1a00);
    g.circle(4.5, -16.5, 1.3).fill(0x080400);
    g.circle(3.7, -17.5, 0.8).fill({ color: 0xffffff, alpha: 0.92 });

    // Nose
    g.ellipse(0, -12, 3, 2).fill(0xc06080);

    // Cheeks
    g.ellipse(-8, -13, 5, 3).fill({ color: 0xff88aa, alpha: 0.5 });
    g.ellipse(8, -13, 5, 3).fill({ color: 0xff88aa, alpha: 0.5 });

    // Smile
    g.moveTo(-5, -9).quadraticCurveTo(0, -6, 5, -9).stroke({ color: 0x9a506a, width: 1.5 });

    // Paw nubs
    g.ellipse(-16, 5, 5, 4).fill(COLORS.stitches);
    g.ellipse(16, 5, 5, 4).fill(COLORS.stitches);
  }
}
