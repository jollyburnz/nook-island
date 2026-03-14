import { app } from "electron";
import fs from "fs/promises";
import path from "path";

// ~/Library/Application Support/NookIsland/
export function getDataDir(): string {
  return path.join(app.getPath("appData"), "NookIsland");
}

export const VILLAGERS = [
  "sherb",
  "maple",
  "zucker",
  "marshal",
  "stitches",
  "lily",
  "broccolo",
  "piper",
] as const;

export type VillagerId = (typeof VILLAGERS)[number];

export interface JournalFile {
  villagerId: VillagerId;
  userFacts: Record<string, string>;
  completedTasks: Array<{ taskId: string; summary: string }>;
  relationships: Record<string, string>;
  baseline: null;
}

function emptyJournal(villagerId: VillagerId): JournalFile {
  return {
    villagerId,
    userFacts: {},
    completedTasks: [],
    relationships: {},
    baseline: null,
  };
}

export async function initDataDir(): Promise<void> {
  const base = getDataDir();
  const journals = path.join(base, "journals");
  const tasks = path.join(base, "tasks");

  // Create directories — no-op if they already exist
  await fs.mkdir(journals, { recursive: true });
  await fs.mkdir(tasks, { recursive: true });

  // Seed each journal file only if it doesn't exist yet — never overwrite
  for (const id of VILLAGERS) {
    const file = path.join(journals, `${id}.json`);
    try {
      await fs.access(file);
      // file exists — leave it alone
    } catch {
      await fs.writeFile(
        file,
        JSON.stringify(emptyJournal(id), null, 2),
        "utf8"
      );
      console.log(`[data] created journal: ${id}.json`);
    }
  }

  console.log(`[data] data dir ready: ${base}`);
}
