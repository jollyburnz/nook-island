import { Villager } from "./Villager";
import { COLORS } from "../constants";

export class Maple extends Villager {
  drawBody(): void {
    const g = this.body;
    // Body
    g.roundRect(-10, -8, 20, 20, 4).fill(COLORS.maple);
    // Head
    g.circle(0, -18, 13).fill(COLORS.maple);
    // Ears
    g.circle(-10, -27, 7).fill(COLORS.maple);
    g.circle(10, -27, 7).fill(COLORS.maple);
    g.circle(-10, -27, 5).fill(0xd4906a); // inner ear
    g.circle(10, -27, 5).fill(0xd4906a);
    // Eyes
    g.circle(-4, -19, 2.5).fill(0x3a1a0a);
    g.circle(4, -19, 2.5).fill(0x3a1a0a);
    // Snout
    g.ellipse(0, -13, 6, 4).fill(0xf0c090);
    // Nostrils
    g.circle(-2, -12, 1.2).fill(0x3a1a0a);
    g.circle(2, -12, 1.2).fill(0x3a1a0a);
    // Rosy cheeks
    g.circle(-7, -16, 3).fill({ color: 0xe07060, alpha: 0.3 });
    g.circle(7, -16, 3).fill({ color: 0xe07060, alpha: 0.3 });
  }
}
