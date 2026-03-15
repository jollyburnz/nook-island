import { Villager } from "./Villager";
import { COLORS } from "../constants";

export class Sherb extends Villager {
  drawBody(): void {
    const g = this.body;
    // Body
    g.roundRect(-10, -8, 20, 20, 4).fill(COLORS.sherb);
    // Head
    g.circle(0, -18, 12).fill(COLORS.sherb);
    // Horns
    g.moveTo(-6, -28).lineTo(-10, -38).lineTo(-2, -28).fill(0xd4c5e8);
    g.moveTo(6, -28).lineTo(10, -38).lineTo(2, -28).fill(0xd4c5e8);
    // Eyes
    g.circle(-4, -19, 2).fill(0x2d1a4a);
    g.circle(4, -19, 2).fill(0x2d1a4a);
    // Snout
    g.ellipse(0, -13, 5, 3).fill(0xddd0f0);
    // Green shirt hint
    g.roundRect(-8, 4, 16, 8, 2).fill(0x5ba840);
  }
}
