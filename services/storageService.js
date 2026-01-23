import fs from "fs";       // for file system operations
import path from "path";   // for cross-platform paths
import os from "os";       // to get the home directory

const CACHE_DIR = path.join(os.homedir(), ".digitalcookbook");
const CACHE_FILE = path.join(CACHE_DIR, "recipes.json");

export function saveRecipesLocally(recipes) {
    // Make sure the folder exists
    fs.mkdirSync(CACHE_DIR, { recursive: true });

    // Write recipes as pretty JSON
    fs.writeFileSync(CACHE_FILE, JSON.stringify(recipes, null, 2), "utf-8");

    console.log(`✔ Saved ${recipes.length} recipes to cache`);
}

export function loadRecipesFromCache() {
    if (!fs.existsSync(CACHE_FILE)) return null; // If the file doesn't exit, return null

    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(data);
}

export function cacheExists() {
    return fs.existsSync(CACHE_FILE);
}
