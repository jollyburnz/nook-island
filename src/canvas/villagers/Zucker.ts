import { Villager } from "./Villager";
import { COLORS } from "../constants";

export class Zucker extends Villager {
  drawBody(): void {
    const g = this.body;

    // ── PALE UNDERSIDE GLOW (behind tentacles) ──
    g.ellipse(0, 4, 14, 9).fill(0xf09070);

    // ── TENTACLES (6, fanning below mantle) ──
    for (let i = 0; i < 6; i++) {
      const angle = (i / 5) * Math.PI + 0.08;
      const tx = Math.cos(angle) * 14;
      const ty = Math.sin(angle) * 9 + 3;
      // Tentacle body
      g.ellipse(tx, ty, 4.5, 7.5).fill(COLORS.zucker);
      // Pale sucker tip
      g.ellipse(tx, ty + 3.5, 2.8, 2.8).fill(0xf09070);
    }

    // ── MANTLE / HEAD DOME (redrawn over tentacle tops) ──
    g.circle(0, -9, 16).fill(COLORS.zucker);
    // Highlight sheen on top-left of dome
    g.ellipse(-4, -16, 8, 5).fill({ color: 0xf08070, alpha: 0.55 });

    // ── CHEEKS (large and rosy — Zucker's signature cuteness) ──
    g.ellipse(-10, -7, 6.5, 4.5).fill({ color: 0xff5040, alpha: 0.48 });
    g.ellipse(10, -7, 6.5, 4.5).fill({ color: 0xff5040, alpha: 0.48 });

    // ── SMILE ──
    g.arc(0, -4, 3.5, 0, Math.PI).stroke({ color: 0xaa3020, width: 1.5 });

    // ── EYES: large sclera → dark brown iris → pupil → shine ──
    // (Zucker has big, adorable round eyes)
    // Left
    g.circle(-6.5, -13, 5.5).fill(0xffffff);
    g.circle(-6.5, -13, 4).fill(0x301008);
    g.circle(-7, -13.5, 2.3).fill(0x060202);
    g.circle(-8, -15, 1.4).fill({ color: 0xffffff, alpha: 0.92 });
    // Right
    g.circle(6.5, -13, 5.5).fill(0xffffff);
    g.circle(6.5, -13, 4).fill(0x301008);
    g.circle(6, -13.5, 2.3).fill(0x060202);
    g.circle(5, -15, 1.4).fill({ color: 0xffffff, alpha: 0.92 });
  }
}
