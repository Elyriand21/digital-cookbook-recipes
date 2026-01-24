import fetch from "node-fetch";
import { parseRecipe } from "../parsers/recipeParser.js";

const OWNER = "Elyriand21";
const REPO = "digital-cookbook-recipes";
const RECIPES_PATH = "recipes";

export async function fetchRecipeFiles() {
    console.log("⏳ Fetching recipes from GitHub...");

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${RECIPES_PATH}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
    const files = await res.json();
    const markdownFiles = files.filter(f => f.name.endsWith(".md"));

    const recipes = [];
    for (const file of markdownFiles) {
        try {
            const fileRes = await fetch(file.download_url);
            const content = await fileRes.text();
            const recipe = parseRecipe(content);
            recipes.push(recipe);
            console.log(`✅ Parsed ${recipe.title}`);
        } catch (err) {
            console.log(`⚠ Failed to fetch/parse ${file.name}: ${err.message}`);
        }
    }

    return recipes;
}

export async function getLatestRepoSha() {
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/commits/main`; // use actual default branch

    const res = await fetch(apiUrl);
    if (!res.ok) {
        throw new Error(`GitHub API failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.sha; // returns the SHA of the latest commit
}