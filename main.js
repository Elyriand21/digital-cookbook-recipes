import { app, BrowserWindow, Menu, ipcMain } from "electron";
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
function saveRecipesLocally(recipes, folderSha) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(
        CACHE_FILE,
        JSON.stringify(
            {
                recipes,
                meta: {
                    folderSha,
                    cachedAt: new Date().toISOString()
                }
            },
            null,
            2
        ),
        "utf-8"
    );
}

function loadRecipesFromCache() {
    if (!fs.existsSync(CACHE_FILE)) return null;

    try {
        return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    } catch {
        return null;
    }
}

async function getRecipesFolderSha() {
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${RECIPES_PATH}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
    const files = await res.json();

    const combined = files
        .filter(f => f.type === "file")
        .map(f => `${f.name}:${f.sha}`)
        .sort()
        .join("|");

    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }

    return String(hash);
}

// ------------------
// IPC handlers
// ------------------
ipcMain.handle("get-recipes", async () => {
    try {
        const cache = loadRecipesFromCache() || { recipes: [], meta: {} };
        const liveFolderSha = await getRecipesFolderSha();

        if (cache.meta?.folderSha === liveFolderSha && cache.recipes.length) {
            return {
                recipes: cache.recipes,
                added: [],
                removed: [],
                folderChanged: false,
                liveFolderSha
            };
        }

        const liveRecipes = await fetchRecipesFromGitHub();

        const oldIds = new Set(cache.recipes.map(r => r.id));
        const newIds = new Set(liveRecipes.map(r => r.id));

        const added = liveRecipes.filter(r => !oldIds.has(r.id));
        const removed = cache.recipes.filter(r => !newIds.has(r.id));

        saveRecipesLocally(liveRecipes, liveFolderSha);

        return {
            recipes: liveRecipes,
            added,
            removed,
            folderChanged: true,
            liveFolderSha
        };

    } catch (err) {
        console.error("❌ Error fetching recipes:", err.message);
        const cache = loadRecipesFromCache();
        return {
            recipes: cache?.recipes || [],
            added: [],
            removed: [],
            folderChanged: false,
            liveFolderSha: null
        };
    }
});

ipcMain.handle("clear-cache", async () => {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            fs.unlinkSync(CACHE_FILE);
            return { success: true, message: "Cache cleared." };
        } else {
            return { success: true, message: "No cache found." };
        }
    } catch (err) {
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
        icon: path.join(__dirname, "assets", "cookbookIcon.ico"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(__dirname, "gui", "index.html"));
}

// Menu.setApplicationMenu(null)

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});