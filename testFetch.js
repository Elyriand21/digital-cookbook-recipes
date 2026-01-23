import { fetchRecipeFiles, getLatestRepoSha } from "./services/githubService.js";
import { parseRecipe } from "./parsers/recipeParser.js";
import readline from "readline";
import {
    loadRecipesFromCache,
    saveRecipesLocally,
    cacheExists
} from "./services/storageService.js";

// Helper function to ask user a question in the terminal
function askUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(question, ans => {
        rl.close();
        resolve(ans.trim());
    }));
}

export async function getRecipes() {

    const cache = loadRecipesFromCache();

    // Check if cache exists and has SHA
    if (cache && cache.meta && cache.meta.repoSha) {
        try {
            // Fetch latest commit SHA from GitHub
            const liveSha = await getLatestRepoSha();

            // Compare SHAs
            if (cache.meta.repoSha === liveSha) {
                console.log("✔ Cache is up-to-date, using cached recipes");
                return cache.recipes;
            } else {
                console.log("🌐 New recipes detected!");

                // Prompt user whether to refresh cache
                const answer = await askUser("Do you want to fetch the latest recipes? (y/n) ");
                if (answer.toLowerCase() !== "y") {
                    console.log("✔ Using old cached recipes.");
                    return cache.recipes;
                }

                console.log("🌐 Fetching latest recipes...");
            }
        } catch (err) {
            console.warn("⚠ Unable to fetch latest repo SHA. Using cached recipes.");
            return cache.recipes; // fallback if offline or API fails
        }
    } else if (cache) {
        // Cache exists but has no SHA (old format)
        console.log("⚠ Cache has no SHA metadata. Will fetch latest recipes...");
    } else {
        // No cache at all
        console.log("🌐 No cache found, fetching recipes from GitHub...");
    }

    // Fetch recipe files from GitHub
    console.log("🌐 Fetching recipes from GitHub...");
    const files = await fetchRecipeFiles();

    // Parse recipes and skip invalid ones
    const recipes = [];

    for (const f of files) {
        try {
            const recipe = parseRecipe(f.content);
            recipes.push(recipe);
        } catch (err) {
            console.warn(`⚠ Skipping invalid recipe: ${f.filename}`);
            console.warn(err.message);
        }
    }

    console.log(`✔ ${recipes.length} recipes parsed`);

    // Fetch latest SHA for cache (if we didn’t already have it)
    let shaToCache;
    try {
        shaToCache = await getLatestRepoSha();
    } catch (err) {
        console.warn("⚠ Unable to fetch SHA for cache. Will save recipes without SHA.");
        shaToCache = null;
    }

    // Save recipes + SHA to cache
    saveRecipesLocally(recipes, shaToCache);
    console.log("✔ Recipes cached locally");

    return recipes;
}

async function main() {
    const recipes = await getRecipes();

    console.log("\n📚 Recipe Titles:\n");
    recipes.forEach(r => console.log(`- ${r.title} (${r.id})`));

    console.log(`\n✔ Total valid recipes: ${recipes.length}`);
}

// Only run main() if this file is executed directly
const isDirectRun = process.argv[1] &&
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));

if (isDirectRun) {
    main().catch(err => {
        console.error("❌ Error:", err.message);
    });
}