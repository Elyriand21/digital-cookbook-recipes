import { fetchRecipeFiles } from "./services/githubService.js";
import { parseRecipe } from "./parsers/recipeParser.js";

async function main() {
    console.log("Fetching recipes from GitHub...");

    const files = await fetchRecipeFiles();
    console.log(`✔ ${files.length} recipe files downloaded`);

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

    console.log(`✔ ${recipes.length} recipes parsed\n`);

    // Log recipe titles
    for (const r of recipes) {
        console.log(`- ${r.title} (${r.id})`);
    }

    console.log("\nSummary:");
    console.log(`✔ Valid recipes: ${recipes.length}`);
}

main().catch(err => {
    console.error("❌ Error:", err.message);
});
