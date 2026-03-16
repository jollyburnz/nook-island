import { Villager } from "./Villager";
import { COLORS } from "../constants";

export class Marshal extends Villager {
  drawBody(): void {
    const g = this.body;

    // ── BUSHY TAIL (behind body, right side) ──
    // Layered arcs give a fluffy 3D look
    g.arc(17, -2, 11, -Math.PI * 0.9, 0.1).stroke({ color: 0x7a8590, width: 10 }); // shadow layer
    g.arc(16, -2, 11, -Math.PI * 0.9, 0.1).stroke({ color: COLORS.marshal, width: 10 });
    g.arc(16, -2, 11, -Math.PI * 0.9, 0.1).stroke({ color: 0xcfd8e0, width: 5 }); // highlight stripe
    g.arc(16, -2, 11, -Math.PI * 0.9, 0.1).stroke({ color: 0xe8f0f5, width: 2 }); // bright centre

    // ── BODY ──
    g.roundRect(-10, -6, 20, 18, 5).fill(COLORS.marshal);

    // ── CREAM BELLY with brown stripes ──
    g.roundRect(-7, -1, 14, 13, 4).fill(0xeef2f5);
    g.rect(-6, 2, 12, 2).fill(0xb0bcc5);   // stripe 1
    g.rect(-6, 6, 12, 2).fill(0xb0bcc5);   // stripe 2
    g.rect(-6, 10, 12, 2).fill(0xb0bcc5);  // stripe 3

    // ── EARS (before head; head covers their base) ──
    // Left ear — pointy triangle + pink inner
    g.moveTo(-5, -27).lineTo(-14, -43).lineTo(-1, -27).fill(COLORS.marshal); // outer
    g.moveTo(-6, -28).lineTo(-12, -40).lineTo(-2, -28).fill(0xf0b0b8);       // pink inner
    // Right ear
    g.moveTo(5, -27).lineTo(14, -43).lineTo(1, -27).fill(COLORS.marshal);
    g.moveTo(6, -28).lineTo(12, -40).lineTo(2, -28).fill(0xf0b0b8);

    // ── HEAD ──
    g.circle(0, -20, 13).fill(COLORS.marshal);
    // Subtle highlight
    g.ellipse(-2, -26, 6, 3.5).fill({ color: 0xc5cfd5, alpha: 0.45 });

    // ── OVAL NOSE ──
    g.ellipse(0, -13, 3.5, 2.5).fill(0x3a3a52);

    // ── SMILE ──
    g.arc(0, -11, 3, 0, Math.PI).stroke({ color: 0x3a3a52, width: 1.3 });

    // ── EYES: sclera → very dark iris (Marshal's "cool" look) → pupil → shine ──
    // Left
    g.circle(-4.5, -21, 4).fill(0xffffff);
    g.circle(-4.5, -21, 2.8).fill(0x1c1c2e);
    g.circle(-5, -21.5, 1.6).fill(0x04040c);
    g.circle(-5.8, -22.5, 0.9).fill({ color: 0xffffff, alpha: 0.92 });
    // Right
    g.circle(4.5, -21, 4).fill(0xffffff);
    g.circle(4.5, -21, 2.8).fill(0x1c1c2e);
    g.circle(4, -21.5, 1.6).fill(0x04040c);
    g.circle(3.2, -22.5, 0.9).fill({ color: 0xffffff, alpha: 0.92 });
  }
}
