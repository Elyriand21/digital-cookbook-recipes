import matter from "gray-matter";

// Normalize smart quotes, null chars, BOM, etc.
function normalizeText(str) {
    if (!str) return str;
    return str
        .replace(/\u0000/g, "")       // remove null chars
        .replace(/\uFEFF/g, "")       // remove BOM if present
        .replace(/[‘’]/g, "'")        // convert smart single quotes
        .replace(/[“”]/g, '"')        // convert smart double quotes
        .trim();
}

export function parseRecipe(markdownText) {
    const parsed = matter(markdownText);
    const data = parsed.data;
    const body = parsed.content;

    if (!data.id || !data.title) {
        throw new Error("Recipe missing required fields: id or title");
    }

    const ingredientsMatch = body.match(/## Ingredients([\s\S]*?)## Instructions/);
    const instructionsMatch = body.match(/## Instructions([\s\S]*)$/);

    const ingredients = ingredientsMatch
        ? ingredientsMatch[1]
            .split("\n")
            .map(line => normalizeText(line.replace(/^- /, "")))
            .filter(Boolean)
        : [];

    const instructions = instructionsMatch
        ? instructionsMatch[1]
            .split("\n")
            .map(line => normalizeText(line.replace(/^\d+\. /, "")))
            .filter(Boolean)
        : [];

    // Normalize allergies:
    // - If frontmatter provides an array, map/normalize entries
    // - If frontmatter provides a string, allow comma-separated values and normalize
    let allergies = [];
    if (Array.isArray(data.allergies)) {
        allergies = data.allergies.map(normalizeText).filter(Boolean);
    } else if (typeof data.allergies === "string") {
        allergies = data.allergies
            .split(",")
            .map(item => normalizeText(item))
            .filter(Boolean);
    }

    if (allergies.length === 0) {
        allergies = ["None"];
    }

    // Debug: log id and allergies when a recipe is parsed to help troubleshoot stale cache / parsing issues
    // Remove or guard this log for production if you prefer quieter output.
    console.log(`parseRecipe: id='${normalizeText(data.id)}' allergies=${JSON.stringify(allergies)}`);

    return {
        id: normalizeText(data.id),
        title: normalizeText(data.title),
        tags: Array.isArray(data.tags) ? data.tags.map(normalizeText) : [],
        prepTime: Number(data.prep_time) || null,
        cookTime: Number(data.cook_time) || null,
        servings: Number(data.servings) || null,
        allergies,
        ingredients,
        instructions,
        rawMarkdown: markdownText
    };
}
