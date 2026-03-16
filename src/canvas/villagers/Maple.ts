import { Villager } from "./Villager";
import { COLORS } from "../constants";

export class Maple extends Villager {
  drawBody(): void {
    const g = this.body;

    // ── BODY ──
    g.roundRect(-11, -7, 22, 19, 6).fill(COLORS.maple);

    // ── EARS (3-tone: outer → inner-dark → inner-light; drawn before head) ──
    // Left ear
    g.circle(-12, -30, 9).fill(COLORS.maple);
    g.circle(-12, -30, 6.5).fill(0xc87850); // dark inner ear
    g.circle(-12, -30, 3.5).fill(0xf5aa80); // light inner highlight
    // Right ear
    g.circle(12, -30, 9).fill(COLORS.maple);
    g.circle(12, -30, 6.5).fill(0xc87850);
    g.circle(12, -30, 3.5).fill(0xf5aa80);

    // ── HEAD ──
    g.circle(0, -21, 14).fill(COLORS.maple);
    // Top highlight
    g.ellipse(-2, -27, 7, 4).fill({ color: 0xf5c898, alpha: 0.5 });

    // ── MUZZLE PATCH (lighter fur area) ──
    g.ellipse(0, -14, 9, 7).fill(0xf5c090);

    // ── CHEEKS (big and prominent — classic Maple) ──
    g.ellipse(-9, -17, 6, 4).fill({ color: 0xe05050, alpha: 0.38 });
    g.ellipse(9, -17, 6, 4).fill({ color: 0xe05050, alpha: 0.38 });

    // ── SNOUT (on muzzle patch) ──
    g.ellipse(0, -13, 5.5, 3.5).fill(0xf0c080);
    g.circle(-2, -13, 1.2).fill(0x3a1a0a); // left nostril
    g.circle(2, -13, 1.2).fill(0x3a1a0a);  // right nostril
    // Smile
    g.arc(0, -10, 3.5, 0, Math.PI).stroke({ color: 0x8a5030, width: 1.5 });

    // ── EYES: sclera → warm brown iris → pupil → shine ──
    // Left
    g.circle(-5, -22, 4.5).fill(0xffffff);
    g.circle(-5, -22, 3.2).fill(0x996633);
    g.circle(-5.5, -22.5, 1.8).fill(0x100800);
    g.circle(-6.3, -23.5, 1.1).fill({ color: 0xffffff, alpha: 0.9 });
    // Right
    g.circle(5, -22, 4.5).fill(0xffffff);
    g.circle(5, -22, 3.2).fill(0x996633);
    g.circle(4.5, -22.5, 1.8).fill(0x100800);
    g.circle(3.7, -23.5, 1.1).fill({ color: 0xffffff, alpha: 0.9 });
  }
}
