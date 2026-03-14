"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VILLAGERS = void 0;
exports.getDataDir = getDataDir;
exports.initDataDir = initDataDir;
const electron_1 = require("electron");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// ~/Library/Application Support/NookIsland/
function getDataDir() {
    return path_1.default.join(electron_1.app.getPath("appData"), "NookIsland");
}
exports.VILLAGERS = [
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
async function initDataDir() {
    const base = getDataDir();
    const journals = path_1.default.join(base, "journals");
    const tasks = path_1.default.join(base, "tasks");
    // Create directories — no-op if they already exist
    await promises_1.default.mkdir(journals, { recursive: true });
    await promises_1.default.mkdir(tasks, { recursive: true });
    // Seed each journal file only if it doesn't exist yet — never overwrite
    for (const id of exports.VILLAGERS) {
        const file = path_1.default.join(journals, `${id}.json`);
        try {
            await promises_1.default.access(file);
            // file exists — leave it alone
        }
        catch {
            await promises_1.default.writeFile(file, JSON.stringify(emptyJournal(id), null, 2), "utf8");
            console.log(`[data] created journal: ${id}.json`);
        }
    }
    console.log(`[data] data dir ready: ${base}`);
}
//# sourceMappingURL=data.js.map