import { Villager } from "./Villager";
import { COLORS } from "../constants";

export class Marshal extends Villager {
  drawBody(): void {
    const g = this.body;
    // Body
    g.roundRect(-9, -8, 18, 20, 4).fill(COLORS.marshal);
    // Head
    g.circle(0, -18, 12).fill(COLORS.marshal);
    // Pointy ears
    g.moveTo(-8, -26).lineTo(-12, -36).lineTo(-4, -28).fill(COLORS.marshal);
    g.moveTo(8, -26).lineTo(12, -36).lineTo(4, -28).fill(COLORS.marshal);
    g.moveTo(-8, -26).lineTo(-11, -33).lineTo(-5, -28).fill(0xd0d8e0); // inner ear
    g.moveTo(8, -26).lineTo(11, -33).lineTo(5, -28).fill(0xd0d8e0);
    // Striped belly
    g.roundRect(-7, -4, 14, 12, 3).fill(0xdde3e8);
    for (let s = 0; s < 3; s++) {
      g.rect(-6, -2 + s * 3, 12, 1.5).fill(0xbbc5cc);
    }
    // Eyes
    g.circle(-4, -19, 2).fill(0x1a1a2d);
    g.circle(4, -19, 2).fill(0x1a1a2d);
    // Nose
    g.circle(0, -15, 1.5).fill(0x3a3a50);
    // Bushy tail arc (right side)
    g.arc(16, -2, 9, -Math.PI * 0.85, -Math.PI * 0.05).stroke({ color: COLORS.marshal, width: 7 });
    g.arc(16, -2, 9, -Math.PI * 0.85, -Math.PI * 0.05).stroke({ color: 0xdde3e8, width: 3 });
  }
}
