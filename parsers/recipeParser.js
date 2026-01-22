import matter from "gray-matter";

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
            .map(line => line.replace(/^- /, "").trim())
            .filter(Boolean)
        : [];

    const instructions = instructionsMatch
        ? instructionsMatch[1]
            .split("\n")
            .map(line => line.replace(/^\d+\. /, "").trim())
            .filter(Boolean)
        : [];

    return {
        id: data.id,
        title: data.title,
        tags: Array.isArray(data.tags) ? data.tags : [],
        prepTime: Number(data.prep_time) || null,
        cookTime: Number(data.cook_time) || null,
        servings: Number(data.servings) || null,
        ingredients,
        instructions,
        rawMarkdown: markdownText
    };
}