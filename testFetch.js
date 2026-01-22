import { fetchRecipeFiles } from "./services/githubService.js";
import { parseRecipe } from "./parsers/recipeParser.js";
import { loadRecipesFromCache, saveRecipesLocally, cacheExists } from "./storage/storageService.js";


async function getRecipes() {
    if (cacheExists()) {
        console.log("✔ Loading recipes from cache");
        return loadRecipesFromCache();
    }

    console.log("Fetching recipes from GitHub...");
    const files = await fetchRecipeFiles();

    const recipes = [];
    for (const f of files) {
        try {
            const recipe = parseRecipe(f.content);
            recipes.push(recipe);
        } catch (err) {
            console.warn(`⚠ Skipping invalid recipe: ${f.filename}`);
        }
    }

    console.log(`✔ ${recipes.length} recipes parsed`);
    saveRecipesLocally(recipes);
    console.log("✔ Recipes cached locally");

    return recipes;
}

async function main() {
    const recipes = await getRecipes();

    console.log("\nRecipe Titles:");
    recipes.forEach(r => console.log(`- ${r.title} (${r.id})`));

    console.log(`\n✔ Total valid recipes: ${recipes.length}`);
}

main().catch(err => console.error("❌ Error:", err.message));
