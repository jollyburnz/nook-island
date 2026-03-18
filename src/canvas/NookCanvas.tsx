import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { ColorMatrixFilter, NoiseFilter } from "pixi.js";
import { eventBus } from "../core/eventBus";
import type { IslandEvent } from "../core/types";
import { World } from "./world/World";
import { Camera } from "./camera/Camera";
import { OffscreenIndicator } from "./objects/OffscreenIndicator";
import { VILLAGER_TO_DISTRICT } from "./constants";
import type { DistrictKey } from "./constants";

export function NookCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let destroyed = false;
    let initDone = false; // guards against destroy-before-init (ResizePlugin._cancelResize not yet set)
    let app: PIXI.Application | null = null;
    let unsub: (() => void) | null = null;

    (async () => {
      app = new PIXI.Application();
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x4a90d9,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });
      initDone = true; // ResizePlugin.init() has run; _cancelResize is now safe to call

      if (destroyed) {
        // Cleanup fired while init was in progress. Now that init is done it's safe to destroy.
        app.destroy(true, { children: true });
        app = null;
        return;
      }

      el.appendChild(app.canvas as HTMLCanvasElement);

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const world = new World(vw, vh);
      const camera = new Camera(world, vw, vh);
      const indicator = new OffscreenIndicator(camera, world, vw, vh);

      // Layer order: world → clouds (viewport-fixed) → indicator (viewport-fixed)
      app.stage.addChild(world);
      app.stage.addChild(world.cloudLayer);
      app.stage.addChild(indicator);

      // ── Criterion Cozy: world-level grain + warm tint ──────────────────────
      // Applied to `world` only — clouds and indicator stay clean
      const worldWarm = new ColorMatrixFilter();
      worldWarm.tint(0xfff8e7, false);  // Cream Press warm tint
      worldWarm.saturate(-0.12, false); // mild desaturation
      const grain = new NoiseFilter({ noise: 0.055, seed: Math.random() });
      world.filters = [worldWarm, grain];

      // Animate grain seed each frame so it feels like real film grain
      app.ticker.add(() => { grain.seed = Math.random(); });

      // Wire district clicks to camera
      world.wireClicks(camera);

      // Animation ticker
      app.ticker.add((ticker) => {
        camera.tick(ticker.deltaTime);
        world.tick(ticker.deltaTime);
        indicator.tick(ticker.deltaTime);
      });

      // Track previous agent for bottle travel
      let prevAgent: string | null = null;

      unsub = eventBus.subscribe((raw) => {
        const e = raw as IslandEvent;
        if (!e?.type) return;

        if (e.type === "plan_proposed") {
          camera.focusOn("townhall");
        } else if (e.type === "agent_activated") {
          const distKey = (VILLAGER_TO_DISTRICT[e.agentId] ?? "plaza") as DistrictKey;
          camera.focusOn(distKey);
          world.activateVillager(e.agentId);
          if (prevAgent && prevAgent !== e.agentId) {
            world.sendBottle(prevAgent, e.agentId, () => {});
          }
          prevAgent = e.agentId;
        } else if (e.type === "task_complete") {
          world.onComplete(e.cost_usd);
          camera.focusOn("plaza");
          prevAgent = null;
        } else if (e.type === "task_received") {
          // Reset world for new task
          world.resetWorld();
          prevAgent = null;
        }
      });
    })();

    return () => {
      destroyed = true;
      unsub?.();
      if (initDone && app) {
        // Init completed — ResizePlugin._cancelResize is set up, safe to destroy now.
        app.destroy(true, { children: true });
        app = null;
      }
      // If !initDone: init is still in progress. When it finishes the if(destroyed) guard
      // inside the async IIFE will call destroy (with _cancelResize properly initialised).
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    />
  );
}
