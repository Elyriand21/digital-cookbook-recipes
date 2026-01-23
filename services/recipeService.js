// recipeService.js
import { fetchRecipeFiles } from "./githubService.js";
import { parseRecipe } from "../parsers/recipeParser.js";
import { loadRecipesFromCache, saveRecipesLocally } from "./storageService.js";

// GitHub folder SHA caching and auto-fetching
export async function getRecipesForGUI() {
    const cache = loadRecipesFromCache();
    let liveFolderSha = null;
    let recipes = [];

    try {
        // Get latest folder SHA from GitHub
        liveFolderSha = await getRecipesFolderSha();
    } catch (err) {
        console.warn("⚠ Unable to fetch recipes folder SHA. Using cached recipes if available.");
        if (cache?.recipes) return cache.recipes;
    }

    // Use cache if SHA matches
    if (cache?.meta?.repoSha && liveFolderSha && cache.meta.repoSha === liveFolderSha) {
        console.log("✔ Recipes folder unchanged. Using cached recipes.");
        return cache.recipes;
    }

    // Otherwise, fetch from GitHub
    try {
        const files = await fetchRecipeFiles();

        // Parse recipes
        recipes = files.map(f => {
            try {
                return parseRecipe(f.content);
            } catch (err) {
                console.warn(`⚠ Skipping invalid recipe: ${f.filename}`);
                return null;
            }
        }).filter(Boolean); // remove nulls

        console.log(`✔ ${recipes.length} recipes parsed`);

        // Save to cache with latest SHA
        saveRecipesLocally(recipes, liveFolderSha);
        console.log("✔ Recipes cached locally");

    } catch (err) {
        console.error("❌ Failed to fetch recipes from GitHub. Using cache if available.", err.message);
        if (cache?.recipes) {
            console.log("✔ Using cached recipes.");
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
