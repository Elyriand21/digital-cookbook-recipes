import { fetchRecipeFiles } from "./services/githubService.js";
import { parseRecipe } from "./parsers/recipeParser.js";

async function main() {
    console.log("Fetching recipes from GitHub...");

    const files = await fetchRecipeFiles();
    console.log(`✔ ${files.length} recipe files downloaded`);

    const recipes = files.map(f => parseRecipe(f.content));
    console.log(`✔ ${recipes.length} recipes parsed\n`);

    for (const r of recipes) {
        console.log(`- ${r.title} (${r.id})`);
    }
}

main().catch(err => {
    console.error("❌ Error:", err.message);
});
