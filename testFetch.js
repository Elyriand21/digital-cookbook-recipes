import { fetchRecipeFiles } from "./services/githubService.js";
import { parseRecipe } from "./parsers/recipeParser.js";
import {
    loadRecipesFromCache,
    saveRecipesLocally,
    cacheExists
} from "./services/storageService.js";

/**
 * Load recipes using cache-first strategy
 * - If cache exists → load from disk
 * - Else → fetch from GitHub → parse → cache → return
 */
export async function getRecipes() {
    
    if (cacheExists()) {
        console.log("✔ Loading recipes from cache");
        return loadRecipesFromCache();
    }

    
    console.log("🌐 Fetching recipes from GitHub...");
    const files = await fetchRecipeFiles();

    
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

    
    saveRecipesLocally(recipes);
    console.log("✔ Recipes cached locally");

    return recipes;
}

async function main() {
    const recipes = await getRecipes();

    console.log("\n📚 Recipe Titles:\n");
    recipes.forEach(r => {
        console.log(`- ${r.title} (${r.id})`);
    });

    console.log(`\n✔ Total valid recipes: ${recipes.length}`);
}

// Only run main() if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        console.error("❌ Error:", err.message);
    });
}
