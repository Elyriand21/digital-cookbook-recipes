import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { parseRecipe } from "./parsers/recipeParser.js";
import fs from "fs";
import os from "os";

// Paths for caching
const CACHE_DIR = path.join(os.homedir(), ".digitalcookbook");
const CACHE_FILE = path.join(CACHE_DIR, "recipes.json");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Electron version:", process.versions.electron);
console.log("Node version:", process.versions.node);


// GitHub config
const OWNER = "Elyriand21";
const REPO = "digital-cookbook-recipes";
const RECIPES_PATH = "recipes";

// ------------------
// Helper: fetch recipes from GitHub
// ------------------
async function fetchRecipesFromGitHub(log = console.log) {
    log("⏳ Fetching recipes from GitHub...");

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${RECIPES_PATH}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
    const files = await res.json();
    const markdownFiles = files.filter(f => f.name.endsWith(".md"));

    const recipes = [];
    for (const file of markdownFiles) {
        try {
            const fileRes = await fetch(file.download_url);
            const content = await fileRes.text();

            // Parse markdown into a recipe object
            const parsedRecipe = parseRecipe(content);
            recipes.push(parsedRecipe);

            log(`✅ Fetched & parsed ${parsedRecipe.title}`);
        } catch (err) {
            log(`⚠ Failed to fetch or parse ${file.name}: ${err.message}`);
        }
    }


    return recipes;
}

// ------------------
// Helper: load/save cache
// ------------------
function saveRecipesLocally(recipes) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ recipes, cachedAt: new Date().toISOString() }, null, 2), "utf-8");
}

function loadRecipesFromCache() {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    try {
        return JSON.parse(data).recipes || [];
    } catch {
        return null;
    }
}

// ------------------
// IPC handler
// ------------------
ipcMain.handle("get-recipes", async (_, sendLog) => {
    // sendLog: callback to GUI via renderer
    const log = (msg) => sendLog?.(msg);

    try {
        // Try loading cache first
        const cache = loadRecipesFromCache();
        if (cache?.length) log(`✔ Loaded ${cache.length} recipes from cache`);

        // Fetch live recipes
        const liveRecipes = await fetchRecipesFromGitHub(log);
        saveRecipesLocally(liveRecipes);
        log(`✔ Cached ${liveRecipes.length} recipes locally`);

        return liveRecipes;
    } catch (err) {
        log(`❌ Error fetching recipes: ${err.message}`);
        // fallback to cache
        return loadRecipesFromCache() || [];
    }
});

// ------------------
// Create window
// ------------------
function createWindow() {
    const preloadPath = path.resolve(__dirname, "preload.js");
    console.log("Preload path is:", preloadPath);

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(__dirname, "gui", "index.html")); // <-- use __dirname
}


app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
