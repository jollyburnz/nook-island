import { app } from "electron";
import fs from "fs/promises";
import path from "path";
// ~/Library/Application Support/NookIsland/
export function getDataDir() {
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
];
function emptyJournal(villagerId) {
    return {
        villagerId,
        userFacts: {},
        completedTasks: [],
        relationships: {},
        baseline: null,
    };
}
export async function initDataDir() {
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
        }
        catch {
            await fs.writeFile(file, JSON.stringify(emptyJournal(id), null, 2), "utf8");
            console.log(`[data] created journal: ${id}.json`);
        }
    }
    console.log(`[data] data dir ready: ${base}`);
}
/** Read ~/Library/Application Support/NookIsland/config.json. Returns {} if missing. */
export async function getNookConfig() {
    const configPath = path.join(getDataDir(), "credentials", "config.json");
    try {
        const raw = await fs.readFile(configPath, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
//# sourceMappingURL=data.js.map