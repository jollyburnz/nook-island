import * as PIXI from "pixi.js";
import {
  COLORS, DISTRICT_POS, VILLAGER_TO_DISTRICT, VILLAGER_EMOJI,
  WORLD_W, WORLD_H,
} from "../constants";
import type { DistrictKey } from "../constants";
import { WaterTiles } from "./WaterTiles";
import { CloudLayer } from "./CloudLayer";
import { TownHallDistrict } from "./districts/TownHallDistrict";
import { ForestDistrict } from "./districts/ForestDistrict";
import { LibraryDistrict } from "./districts/LibraryDistrict";
import { CafeDistrict } from "./districts/CafeDistrict";
import { CentralPlaza } from "./districts/CentralPlaza";
import { RiverDistrict } from "./districts/RiverDistrict";
import { ArtshedDistrict } from "./districts/ArtshedDistrict";
import { Bottle } from "../objects/Bottle";
import { Mailbox } from "../objects/Mailbox";
import { Sherb } from "../villagers/Sherb";
import { Maple } from "../villagers/Maple";
import { Zucker } from "../villagers/Zucker";
import { Marshal } from "../villagers/Marshal";
import { Piper } from "../villagers/Piper.js";
import { Broccolo } from "../villagers/Broccolo.js";
import { Lily } from "../villagers/Lily.js";
import { Stitches } from "../villagers/Stitches.js";
import type { Villager } from "../villagers/Villager";
import type { Camera } from "../camera/Camera";

export class World extends PIXI.Container {
  private water: WaterTiles;
  private clouds: CloudLayer;
  private bottle: Bottle;
  private mailbox: Mailbox;
  private villagers: Record<string, Villager>;
  private activeVillagerName: string | null = null;
  private activeDistrictKey: DistrictKey | null = null;

  // Districts stored for wireClicks
  private districtMap: Map<DistrictKey, PIXI.Container>;

  constructor(viewW: number, viewH: number) {
    super();

    // 1. Ocean background
    const ocean = new PIXI.Graphics();
    ocean.rect(0, 0, WORLD_W, WORLD_H).fill(COLORS.ocean);
    this.addChild(ocean);

    // 2. Water tile shimmer
    this.water = new WaterTiles();
    this.addChild(this.water);

    // 3. Bridges (drawn before districts so they appear underneath)
    this.drawBridges();

    // 4. District chunks
    const plaza = new CentralPlaza();
    const townhall = new TownHallDistrict();
    const forest = new ForestDistrict();
    const library = new LibraryDistrict();
    const cafe = new CafeDistrict();
    const river = new RiverDistrict();
    const artshed = new ArtshedDistrict();

    this.districtMap = new Map([
      ["plaza",    plaza],
      ["townhall", townhall],
      ["forest",   forest],
      ["library",  library],
      ["cafe",     cafe],
      ["river",    river],
      ["artshed",  artshed],
    ]);

    for (const [key, chunk] of this.districtMap) {
      const pos = DISTRICT_POS[key];
      chunk.x = pos.x;
      chunk.y = pos.y;
      this.addChild(chunk);
    }

    // Expose the plaza mailbox
    this.mailbox = plaza.mailbox;

    // 5. Villagers at their district positions + y offset
    const sherb   = new Sherb();
    const maple   = new Maple();
    const zucker  = new Zucker();
    const marshal = new Marshal();
    const piper   = new Piper();
    const broccolo = new Broccolo();
    const lily = new Lily();
    const stitches = new Stitches();
    this.villagers = { sherb, maple, zucker, marshal, piper, broccolo, lily, stitches };

    for (const [name, v] of Object.entries(this.villagers)) {
      const distKey = VILLAGER_TO_DISTRICT[name];
      const pos = DISTRICT_POS[distKey];
      v.x = pos.x + 20;
      v.y = pos.y + 30;
      (v as unknown as { baseY: number }).baseY = v.y;
      this.addChild(v);
    }

    // Must be AFTER the positioning loop — the loop would overwrite these otherwise:
    piper.x = DISTRICT_POS.plaza.x - 28;
    piper.y = DISTRICT_POS.plaza.y - 5;
    (piper as unknown as { baseY: number }).baseY = piper.y; // baseY is protected — same cast as loop

    broccolo.x = DISTRICT_POS.plaza.x + 28;
    broccolo.y = DISTRICT_POS.plaza.y - 5;
    (broccolo as unknown as { baseY: number }).baseY = broccolo.y;

    // 6. Bottle (hidden initially)
    this.bottle = new Bottle();
    this.addChild(this.bottle);

    // 7. CloudLayer stored separately — NookCanvas adds to stage for viewport-fixed rendering
    this.clouds = new CloudLayer(viewW);
  }

  /** CloudLayer is viewport-fixed; NookCanvas adds it directly to app.stage */
  get cloudLayer(): CloudLayer {
    return this.clouds;
  }

  /** Wire district click events to camera.focusOn() */
  wireClicks(camera: Camera): void {
    for (const [key, chunk] of this.districtMap) {
      chunk.on("pointerdown", () => camera.focusOn(key));
    }
  }

  // ─── Agent events ────────────────────────────────────────────────────────

  activateVillager(name: string): void {
    // Deactivate previous
    if (this.activeVillagerName) {
      this.villagers[this.activeVillagerName]?.setActive(false);
    }
    this.activeVillagerName = name;
    this.activeDistrictKey = (VILLAGER_TO_DISTRICT[name] ?? null) as DistrictKey | null;
    this.villagers[name]?.setActive(true);
  }

  deactivateAll(): void {
    if (this.activeVillagerName) {
      this.villagers[this.activeVillagerName]?.setActive(false);
    }
    this.activeVillagerName = null;
    this.activeDistrictKey = null;
  }

  sendBottle(fromVillager: string, toVillager: string, onDone: () => void): void {
    const from = VILLAGER_TO_DISTRICT[fromVillager];
    const to = VILLAGER_TO_DISTRICT[toVillager];
    if (from && to) {
      this.bottle.travelTo(from, to, onDone);
    }
  }

  onComplete(cost: number): void {
    this.deactivateAll();
    this.mailbox.onComplete(cost);
    for (const v of Object.values(this.villagers)) {
      v.happyBounce();
    }
  }

  resetWorld(): void {
    this.deactivateAll();
    (this.mailbox as Mailbox).reset();
    this.bottle.visible = false;
  }

  // ─── Getters for OffscreenIndicator ──────────────────────────────────────

  get activeDistrictPos(): { x: number; y: number } | null {
    if (!this.activeDistrictKey) return null;
    return DISTRICT_POS[this.activeDistrictKey];
  }

  get activeVillagerEmoji(): string | null {
    if (!this.activeVillagerName) return null;
    return VILLAGER_EMOJI[this.activeVillagerName] ?? null;
  }

  // ─── Tick ─────────────────────────────────────────────────────────────────

  tick(delta: number): void {
    this.water.tick(delta);
    for (const v of Object.values(this.villagers)) {
      v.tick(delta);
    }
    this.bottle.tick(delta);
    this.mailbox.tick(delta);
  }

  // ─── Bridge drawing ───────────────────────────────────────────────────────

  private drawBridges(): void {
    const g = new PIXI.Graphics();
    const p = DISTRICT_POS;
    const pairs: [DistrictKey, DistrictKey][] = [
      ["plaza", "townhall"],
      ["plaza", "forest"],
      ["plaza", "library"],
      ["plaza", "cafe"],
    ];

    for (const [a, b] of pairs) {
      const ax = p[a].x, ay = p[a].y;
      const bx = p[b].x, by = p[b].y;
      const dx = bx - ax, dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len, uy = dy / len; // unit vector along bridge
      const px = -uy, py = ux;           // perpendicular (half-width direction)
      const hw = 18;                      // half-width of bridge
      const TRIM = 90;                    // trim from each end so bridge starts at island edge

      // 4 corners of the rotated bridge rect
      const x0 = ax + ux * TRIM, y0 = ay + uy * TRIM;
      const x1 = bx - ux * TRIM, y1 = by - uy * TRIM;

      g.moveTo(x0 + px * hw, y0 + py * hw)
       .lineTo(x1 + px * hw, y1 + py * hw)
       .lineTo(x1 - px * hw, y1 - py * hw)
       .lineTo(x0 - px * hw, y0 - py * hw)
       .closePath()
       .fill(COLORS.bridge);

      // Edge planks for visual detail
      g.moveTo(x0 + px * hw, y0 + py * hw)
       .lineTo(x1 + px * hw, y1 + py * hw)
       .stroke({ color: 0x8b6340, width: 2, alpha: 0.5 });
      g.moveTo(x0 - px * hw, y0 - py * hw)
       .lineTo(x1 - px * hw, y1 - py * hw)
       .stroke({ color: 0x8b6340, width: 2, alpha: 0.5 });
    }
    this.addChild(g);
  }
}
