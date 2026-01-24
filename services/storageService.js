import fs from "fs";       // for file system operations
import path from "path";   // for cross-platform paths
import os from "os";       // to get the home directory

const CACHE_DIR = path.join(os.homedir(), ".digitalcookbook");
const CACHE_FILE = path.join(CACHE_DIR, "recipes.json");

export function saveRecipesLocally(recipes, folderSha) {
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

export function loadRecipesFromCache() {
    if (!fs.existsSync(CACHE_FILE)) return null;

    try {
        return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    } catch {
        return null;
    }
}
