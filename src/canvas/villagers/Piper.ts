import * as PIXI from "pixi.js";
import { Villager } from "./Villager.js";
import { COLORS } from "../constants.js";

export class Piper extends Villager {
  drawBody(): void {
    const g = this.body;
    // Body
    g.ellipse(0, -4, 13, 11).fill(COLORS.piper);
    // Wings (slightly darker gold)
    g.ellipse(-14, -2, 7, 10).fill(0xe8c850);
    g.ellipse(14, -2, 7, 10).fill(0xe8c850);
    // Head
    g.circle(0, -18, 11).fill(COLORS.piper);
    // Head highlight
    g.ellipse(-3, -22, 5, 3).fill({ color: 0xffee99, alpha: 0.5 });
    // Cheeks
    g.ellipse(-7, -16, 4, 3).fill({ color: 0xffaa44, alpha: 0.42 });
    g.ellipse(7, -16, 4, 3).fill({ color: 0xffaa44, alpha: 0.42 });
    // Tail feathers
    g.moveTo(-6, 5).lineTo(0, 14).lineTo(6, 5).fill(0xe8c850);
    g.moveTo(-3, 5).lineTo(0, 12).lineTo(3, 5).fill(COLORS.piper);
    // Beak (orange triangle, facing right)
    g.moveTo(10, -18).lineTo(16, -16).lineTo(10, -14).fill(0xff8c00);
    // Eyes: sclera → dark iris → pupil → shine
    g.circle(-4, -20, 3.5).fill(0xffffff);
    g.circle(-4, -20, 2.4).fill(0x2a1a00);
    g.circle(-4.5, -20.5, 1.3).fill(0x080400);
    g.circle(-5.2, -21.5, 0.8).fill({ color: 0xffffff, alpha: 0.92 });
    g.circle(4, -20, 3.5).fill(0xffffff);
    g.circle(4, -20, 2.4).fill(0x2a1a00);
    g.circle(3.5, -20.5, 1.3).fill(0x080400);
    g.circle(2.8, -21.5, 0.8).fill({ color: 0xffffff, alpha: 0.92 });
    // Quill detail at beak tip (she's the writer)
    g.moveTo(15, -16).lineTo(20, -13).stroke({ color: 0xff8c00, width: 1.2 });
  }
}
