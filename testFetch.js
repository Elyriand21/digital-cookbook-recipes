import { fetchRecipeFiles } from "./services/githubService.js";
import { parseRecipe } from "./parsers/recipeParser.js";
import {
    loadRecipesFromCache,
    saveRecipesLocally
} from "./services/storageService.js";
import fetch from "node-fetch";
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

// Get the SHA of the recipes folder from GitHub
async function getRecipesFolderSha() {
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${RECIPES_PATH}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
    const data = await res.json();
    return data.sha; // folder SHA
}

export async function getRecipes() {
    const cache = loadRecipesFromCache();
    let liveFolderSha;

    // Get latest recipes folder SHA
    try {
        liveFolderSha = await getRecipesFolderSha();
    } catch (err) {
        console.warn("⚠ Unable to fetch recipes folder SHA. Using cached recipes if available.");
        if (cache && cache.recipes) return cache.recipes;
        liveFolderSha = null;
    }

    // Compare cached folder SHA
    if (cache && cache.meta && cache.meta.folderSha && liveFolderSha) {
        if (cache.meta.folderSha === liveFolderSha) {
            console.log("✔ Recipes folder unchanged. Using cached recipes.");
            return cache.recipes;
        } else {
            console.log("🌐 Recipes folder changed!");

            // Prompt user to fetch updated recipes
            const answer = await askUser("Do you want to fetch the latest recipes? (y/n) ");
            if (answer.toLowerCase() !== "y") {
                console.log("✔ Using old cached recipes.");
                return cache.recipes;
            }
        }
    } else if (cache) {
        console.log("⚠ Cache exists but has no folder SHA. Will fetch recipes...");
    } else {
        console.log("🌐 No cache found, fetching recipes from GitHub...");
    }

    // Fetch recipe files from GitHub
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

    // Detect removed recipes
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
                return cache.recipes;
            }
        }
    }

    // Save new recipes + folder SHA to cache
    saveRecipesLocally(recipes, liveFolderSha);
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
