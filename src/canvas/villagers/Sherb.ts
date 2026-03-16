import { Villager } from "./Villager";
import { COLORS } from "../constants";

export class Sherb extends Villager {
  drawBody(): void {
    const g = this.body;

    // ── SHIRT (draw first so body overlaps its top) ──
    g.roundRect(-10, 3, 20, 11, 4).fill(0x5ba840);
    g.roundRect(-7, 3, 14, 5, 2).fill(0x7ec860); // lighter band at collar

    // ── BODY ──
    g.roundRect(-11, -7, 22, 18, 5).fill(COLORS.sherb);
    // Subtle shadow at body bottom
    g.roundRect(-11, 4, 22, 7, 5).fill(0xb3a1d1);
    g.roundRect(-11, -7, 22, 14, 5).fill(COLORS.sherb);

    // ── HORNS (before head; head covers their base) ──
    // Left horn — wider triangle with rounded tip
    g.moveTo(-7, -30).lineTo(-13, -45).lineTo(-2, -30).fill(0xd4c5e8);
    g.circle(-10, -44, 2.5).fill(0xc0b0e0); // darker rounded tip
    // Right horn
    g.moveTo(7, -30).lineTo(13, -45).lineTo(2, -30).fill(0xd4c5e8);
    g.circle(10, -44, 2.5).fill(0xc0b0e0);

    // ── HEAD ──
    g.circle(0, -21, 14).fill(COLORS.sherb);
    // Subtle top highlight
    g.ellipse(-2, -27, 7, 4).fill({ color: 0xd8ccf0, alpha: 0.45 });

    // ── CHEEKS ──
    g.ellipse(-8, -16, 5, 3.5).fill({ color: 0xff5577, alpha: 0.38 });
    g.ellipse(8, -16, 5, 3.5).fill({ color: 0xff5577, alpha: 0.38 });

    // ── SNOUT ──
    g.ellipse(0, -13, 7, 4.5).fill(0xe0d0f8);
    g.circle(-2.5, -13, 1.2).fill(0xa090c0); // left nostril
    g.circle(2.5, -13, 1.2).fill(0xa090c0);  // right nostril
    // Smile
    g.arc(0, -10, 3.5, 0, Math.PI).stroke({ color: 0x9080b8, width: 1.5 });

    // ── EYES: sclera → blue iris (Sherb's signature) → pupil → shine ──
    // Left
    g.circle(-5, -23, 4.5).fill(0xffffff);
    g.circle(-5, -23, 3.2).fill(0x5577cc);
    g.circle(-5.5, -23.5, 1.8).fill(0x08031a);
    g.circle(-6.3, -24.5, 1.1).fill({ color: 0xffffff, alpha: 0.92 });
    // Right
    g.circle(5, -23, 4.5).fill(0xffffff);
    g.circle(5, -23, 3.2).fill(0x5577cc);
    g.circle(4.5, -23.5, 1.8).fill(0x08031a);
    g.circle(3.7, -24.5, 1.1).fill({ color: 0xffffff, alpha: 0.92 });
  }
}
