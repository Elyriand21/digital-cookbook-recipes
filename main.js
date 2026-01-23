import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { parseRecipe } from "./parsers/recipeParser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache paths
const CACHE_DIR = path.join(os.homedir(), ".digitalcookbook");
const CACHE_FILE = path.join(CACHE_DIR, "recipes.json");

// GitHub config
const OWNER = "Elyriand21";
const REPO = "digital-cookbook-recipes";
const RECIPES_PATH = "recipes";

// ------------------
// Fetch recipes from GitHub
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
            // Parse markdown into recipe object
            const recipe = parseRecipe(content);
            recipes.push(recipe);
            log(`✅ Parsed ${recipe.title}`);
        } catch (err) {
            log(`⚠ Failed to fetch/parse ${file.name}: ${err.message}`);
        }
    }

    return recipes;
}

// ------------------
// Load/Save cache
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
// IPC handlers
// ------------------
ipcMain.handle("get-recipes", async (_, sendLog) => {
    const log = (msg) => sendLog?.(msg) || console.log(msg);

    try {
        const cache = loadRecipesFromCache();
        if (cache?.length) log(`✔ Loaded ${cache.length} recipes from cache`);

        const liveRecipes = await fetchRecipesFromGitHub(log);
        saveRecipesLocally(liveRecipes);
        log(`✔ Cached ${liveRecipes.length} recipes locally`);

        return liveRecipes;
    } catch (err) {
        log(`❌ Error fetching recipes: ${err.message}`);
        return loadRecipesFromCache() || [];
    }
});

ipcMain.handle("clear-cache", async () => {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            fs.unlinkSync(CACHE_FILE);
            console.log("✔ Local cache cleared");
            return { success: true, message: "Cache cleared." };
        } else {
            return { success: true, message: "No cache found." };
        }
    } catch (err) {
        console.error("❌ Failed to clear cache:", err);
        return { success: false, message: err.message };
    }
});

// ------------------
// Create window
// ------------------
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(__dirname, "gui", "index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
