import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { fetchRecipeFiles, getRecipesFolderSha } from "./services/githubService.js";
import { saveRecipesLocally, loadRecipesFromCache } from "./services/storageService.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache paths
const CACHE_DIR = path.join(os.homedir(), ".digitalcookbook");
const CACHE_FILE = path.join(CACHE_DIR, "recipes.json");

// ------------------
// IPC handlers
// ------------------
ipcMain.handle("get-recipes", async () => {
    try {
        const cache = loadRecipesFromCache() || { recipes: [], meta: {} };
        const liveFolderSha = await getRecipesFolderSha();

        if (cache.meta?.folderSha === liveFolderSha && cache.recipes.length) {
            console.log("Recipes are up to date. Using cached version.");
            return {
                recipes: cache.recipes,
                added: [],
                removed: [],
                folderChanged: false,
                liveFolderSha
            };
        }
        console.log("Fetching latest recipes from GitHub...");

        const liveRecipes = await fetchRecipeFiles();

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

ipcMain.handle("load-cached-recipes", async () => {
    try {
        const cache = loadRecipesFromCache();
        return { recipes: cache?.recipes || [] };
    } catch (err) {
        return { recipes: [] };
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