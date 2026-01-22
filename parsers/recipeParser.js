import matter from "gray-matter";

export function parseRecipe(markdownText) {
    const parsed = matter(markdownText);
    const data = parsed.data;
    const body = parsed.content;

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
        tags: data.tags || [],
        prepTime: data.prep_time || null,
        cookTime: data.cook_time || null,
        servings: data.servings || null,
        ingredients,
        instructions,
        rawMarkdown: markdownText
    };
}
