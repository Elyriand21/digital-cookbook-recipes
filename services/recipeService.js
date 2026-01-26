// recipeService.js
import { fetchRecipeFiles, getRecipesFolderSha } from "./githubService.js";
import { parseRecipe } from "../parsers/recipeParser.js";
import { loadRecipesFromCache, saveRecipesLocally } from "./storageService.js";

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
        if (cache?.recipes) {
            // Ensure cached recipes have allergies field (migrate old cache)
            const migrated = cache.recipes.map(r => {
                if (!Array.isArray(r.allergies) || r.allergies.length === 0) {
                    return { ...r, allergies: ["None"] };
                }
                return r;
            });
            // Save migrated cache back to disk to avoid repeating migration
            try {
                saveRecipesLocally(migrated, cache.meta?.repoSha || liveFolderSha);
            } catch (e) {
                log(`⚠ Failed to update cache during migration: ${e.message}`);
            }
            return migrated;
        }
    }

    if (cache?.meta?.repoSha && liveFolderSha && cache.meta.repoSha === liveFolderSha) {
        log("✔ Recipes folder unchanged. Using cached recipes.");
        // Ensure cached recipes have allergies field (migrate old cache)
        const migrated = cache.recipes.map(r => {
            if (!Array.isArray(r.allergies) || r.allergies.length === 0) {
                return { ...r, allergies: ["None"] };
            }
            return r;
        });
        // If we migrated anything, save it back
        const needsSave = migrated.some((m, i) => migrated[i] !== cache.recipes[i]);
        if (needsSave) {
            try {
                saveRecipesLocally(migrated, cache.meta.repoSha);
            } catch (e) {
                log(`⚠ Failed to update cache during migration: ${e.message}`);
            }
        }
        return migrated;
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

        // Ensure parser-produced recipes all have allergies (parser already defaults, but be defensive)
        recipes = recipes.map(r => {
            if (!Array.isArray(r.allergies) || r.allergies.length === 0) {
                return { ...r, allergies: ["None"] };
            }
            return r;
        });

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