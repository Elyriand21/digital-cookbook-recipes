import fs from "fs";       // for file system operations
import path from "path";   // for cross-platform paths
import os from "os";       // to get the home directory

const CACHE_DIR = path.join(os.homedir(), ".digitalcookbook");
const CACHE_FILE = path.join(CACHE_DIR, "recipes.json");

export function saveRecipesLocally(recipes, repoSha = null) {
    // Make sure the folder exists
    fs.mkdirSync(CACHE_DIR, { recursive: true });

    const cacheObj = {
        meta: {
            repoSha,
            cachedAt: new Date().toISOString()
        },
        recipes
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheObj, null, 2), "utf-8");

    console.log(`✔ Saved ${recipes.length} recipes to cache`);
}

export function loadRecipesFromCache() {
    if (!fs.existsSync(CACHE_FILE)) return null; // If the file doesn't exist, return null

    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    try {
        const cacheObj = JSON.parse(data);
        // Ensure backward compatibility
        if (!cacheObj.meta) cacheObj.meta = { repoSha: null, cachedAt: null };
        if (!cacheObj.recipes) cacheObj.recipes = [];
        return cacheObj;
    } catch (err) {
        console.warn("⚠ Failed to parse cache, ignoring it:", err.message);
        return null;
    }
}

export function cacheExists() {
    return fs.existsSync(CACHE_FILE);
}
