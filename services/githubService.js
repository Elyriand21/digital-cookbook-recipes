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

    // Debug: list files and their SHAs returned by the GitHub API
    console.log(`debug: ${markdownFiles.length} markdown file(s) found in '${RECIPES_PATH}':`);
    markdownFiles.forEach(f => console.log(`debug: file=${f.name} sha=${f.sha}`));

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

export async function getRecipesFolderSha() {
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${RECIPES_PATH}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
    const files = await res.json();

    const combined = files
        .filter(f => f.type === "file")
        .map(f => `${f.name}:${f.sha}`)
        .sort()
        .join("|");

    // Debug: show combined string used to compute folder hash
    console.log(`debug: combined file:sha string length=${combined.length}`);
    // Optionally print combined for deeper debugging (comment/uncomment as needed)
    // console.log(`debug: combined=${combined}`);

    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }

    const result = String(hash);
    // Debug: report computed folder hash
    console.log(`debug: computed folderSha=${result}`);
    return result;
}