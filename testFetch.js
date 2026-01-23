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
    const cache = loadRecipesFromCache() || { recipes: [], meta: {} };
    let liveFolderSha;

    // Get latest recipes folder SHA
    try {
        liveFolderSha = await getRecipesFolderSha();
    } catch (err) {
        console.warn("⚠ Unable to fetch recipes folder SHA. Using cached recipes if available.");
        return { recipes: cache.recipes, added: [], removed: [], folderChanged: false };
    }

    // Fetch recipe files from GitHub
    const files = await fetchRecipeFiles();

    // Parse recipes
    const recipes = [];
    for (const f of files) {
        try {
            recipes.push(parseRecipe(f.content));
        } catch (err) {
            console.warn(`⚠ Skipping invalid recipe: ${f.filename}`);
        }
    }

    // Compare old vs new
    const oldIds = new Set(cache.recipes.map(r => r.id));
    const newIds = new Set(recipes.map(r => r.id));

    const added = recipes.filter(r => !oldIds.has(r.id));
    const removed = cache.recipes.filter(r => !newIds.has(r.id));

    const folderChanged = cache.meta?.folderSha !== liveFolderSha;

    // Return everything for GUI to handle
    return { recipes, added, removed, folderChanged, liveFolderSha };
}

// Function to save recipes after user confirms
export function saveUpdatedRecipes(recipes, folderSha) {
    saveRecipesLocally(recipes, folderSha);
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
