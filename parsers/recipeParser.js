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
    console.log("Inside parseRecipe");
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

    return {
        id: normalizeText(data.id),
        title: normalizeText(data.title),
        tags: Array.isArray(data.tags) ? data.tags.map(normalizeText) : [],
        prepTime: Number(data.prep_time) || null,
        cookTime: Number(data.cook_time) || null,
        servings: Number(data.servings) || null,
        ingredients,
        instructions,
        rawMarkdown: markdownText
    };
}
