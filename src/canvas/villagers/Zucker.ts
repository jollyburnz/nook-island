import { Villager } from "./Villager";
import { COLORS } from "../constants";

export class Zucker extends Villager {
  drawBody(): void {
    const g = this.body;
    // Mantle / head dome
    g.circle(0, -12, 14).fill(COLORS.zucker);
    // 6 tentacle stubs fanning below
    for (let i = 0; i < 6; i++) {
      const angle = ((i / 5) * Math.PI) + 0.05; // spread across bottom semicircle
      const tx = Math.cos(angle) * 13;
      const ty = Math.sin(angle) * 10 + 2;
      g.ellipse(tx, ty, 4, 8).fill(0xc05040);
    }
    // Re-draw mantle on top to cover tentacle tops
    g.circle(0, -12, 14).fill(COLORS.zucker);
    // Eyes
    g.circle(-5, -14, 3).fill(0x2d1010);
    g.circle(5, -14, 3).fill(0x2d1010);
    // Eye shine
    g.circle(-4, -15, 1).fill({ color: 0xffffff, alpha: 0.6 });
    g.circle(6, -15, 1).fill({ color: 0xffffff, alpha: 0.6 });
    // Blush
    g.ellipse(-8, -10, 4, 3).fill({ color: 0xf0a090, alpha: 0.5 });
    g.ellipse(8, -10, 4, 3).fill({ color: 0xf0a090, alpha: 0.5 });
  }
}
