// recipeService.js
import { fetchRecipeFiles } from "./githubService.js";
import { parseRecipe } from "../parsers/recipeParser.js";
import { loadRecipesFromCache, saveRecipesLocally } from "./storageService.js";
import fetch from "node-fetch";

// GitHub folder SHA caching and auto-fetching
export async function getRecipesForGUI(logCallback = console.log) {
    const cache = loadRecipesFromCache();
    let liveFolderSha = null;
    let recipes = [];

    function log(msg) {
        logCallback(msg);
        console.log(msg); // always log to terminal too
    }

    try {
        liveFolderSha = await getRecipesFolderSha();
    } catch (err) {
        log("⚠ Unable to fetch recipes folder SHA. Using cached recipes if available.");
        if (cache?.recipes) return cache.recipes;
    }

    if (cache?.meta?.repoSha && liveFolderSha && cache.meta.repoSha === liveFolderSha) {
        log("✔ Recipes folder unchanged. Using cached recipes.");
        return cache.recipes;
    }

    try {
        const files = await fetchRecipeFiles();

        recipes = files.map(f => {
            try {
                return parseRecipe(f.content);
            } catch (err) {
                log(`⚠ Skipping invalid recipe: ${f.filename}`);
                return null;
            }
        }).filter(Boolean);

        log(`✔ ${recipes.length} recipes parsed`);

        saveRecipesLocally(recipes, liveFolderSha);
        log("✔ Recipes cached locally");
    } catch (err) {
        log(`❌ Failed to fetch recipes from GitHub. Using cache if available: ${err.message}`);
        if (cache?.recipes) {
            log("✔ Using cached recipes.");
            recipes = cache.recipes;
        }
    }

    return recipes;
}


// Helper function to fetch folder SHA from GitHub
async function getRecipesFolderSha() {
    // Import GitHub config from githubService
    // Assuming githubService.js already has OWNER, REPO, RECIPES_PATH exported
    // Or hardcode here if needed:
    const OWNER = "Elyriand21";
    const REPO = "digital-cookbook-recipes";
    const RECIPES_PATH = "recipes";

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${RECIPES_PATH}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
    const data = await res.json();
    return data.sha;
}
