/**
 * Search recipes by specified fields
 * @param {Array} recipes - array of recipe objects
 * @param {string} query - search string
 * @param {Array} fields - array of fields to search (e.g., ["title", "tags", "ingredients"])
 * @returns {Array} filtered list of matching recipes
 */
export function searchRecipes(recipes, query, fields) {
    // Normalize query to lowercase once
    const lowerQuery = query.toLowerCase();

    // Filter the recipes array
    return recipes.filter(recipe =>
        // Check if any of the requested fields match
        fields.some(field => {
            const value = recipe[field];

            if (typeof value === "string") {
                // String field: partial, case-insensitive match
                return value.toLowerCase().includes(lowerQuery);
            } else if (Array.isArray(value)) {
                // Array field: match if any element contains query
                return value.some(item => item.toLowerCase().includes(lowerQuery));
            }

            return false; // Ignore other types
        })
    );
}