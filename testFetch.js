import { fetchRecipeFiles, getLatestRepoSha } from "./services/githubService.js";
import { parseRecipe } from "./parsers/recipeParser.js";
import {
    loadRecipesFromCache,
    saveRecipesLocally
} from "./services/storageService.js";

import readline from "readline";

// Helper to ask user a question in terminal
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
    let liveSha;

    // Step 1: Attempt to fetch the latest GitHub SHA
    try {
        liveSha = await getLatestRepoSha();
    } catch (err) {
        console.warn("⚠ Unable to fetch latest repo SHA. Will use cached recipes if available.");
        if (cache && cache.recipes) return cache.recipes;
        liveSha = null;
    }

    // Step 2: Compare SHA if cache exists
    if (cache && cache.meta && cache.meta.repoSha && liveSha) {
        if (cache.meta.repoSha === liveSha) {
            console.log("✔ Cache is up-to-date, using cached recipes");
            return cache.recipes;
        } else {
            console.log("🌐 New or updated recipes detected!");
            const answer = await askUser("Do you want to fetch the latest recipes? (y/n) ");
            if (answer.toLowerCase() !== "y") {
                console.log("✔ Using old cached recipes.");
                return cache.recipes;
            }
        }
    } else if (cache) {
        console.log("⚠ Cache exists but has no SHA metadata. Will fetch latest recipes...");
    } else {
        console.log("🌐 No cache found, fetching recipes from GitHub...");
    }

    // Step 3: Fetch recipe files from GitHub
    const files = await fetchRecipeFiles();

    // Step 4: Parse recipes and skip invalid ones
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

    // Step 5: Detect removed recipes if cache exists
    if (cache && cache.recipes) {
        const oldIds = cache.recipes.map(r => r.id);
        const newIds = recipes.map(r => r.id);
        const removed = oldIds.filter(id => !newIds.includes(id));

        if (removed.length > 0) {
            const answer = await askUser(
                `⚠ The following recipes were removed: ${removed.join(", ")}. Update to the new recipe list? (y/n) `
            );
            if (answer.toLowerCase() !== "y") {
                console.log("✔ Keeping old cached recipes.");
                return cache.recipes; // Keep old recipes
            }
        }
    }

    // Step 6: Save new recipes + SHA to cache
    saveRecipesLocally(recipes, liveSha);
    console.log("✔ Recipes cached locally");

    return recipes;
}

// ------------------- Main CLI -------------------

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
