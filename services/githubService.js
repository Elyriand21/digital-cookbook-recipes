import fetch from "node-fetch";

const OWNER = "Elyriand21";
const REPO = "digital-cookbook-recipes";
const RECIPES_PATH = "recipes";

export async function fetchRecipeFiles() {
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${RECIPES_PATH}`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
        throw new Error(`GitHub API failed: ${res.status}`);
    }

    const files = await res.json();
    const markdownFiles = files.filter(f => f.name.endsWith(".md"));

    const recipes = [];

    for (const file of markdownFiles) {
        const fileRes = await fetch(file.download_url);
        if (!fileRes.ok) {
            console.warn(`Failed to fetch ${file.name}`);
            continue;
        }

        const content = await fileRes.text();

        recipes.push({
            filename: file.name,
            content,
            error: !fileRes.ok ? 'Failed to fetch' : null
        });
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