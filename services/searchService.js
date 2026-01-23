import { getRecipes } from "../testFetch.js";
import { searchRecipes } from "./searchRecipes.js";

let recipesInMemory = null;

export async function search(query, fields) {
    if (!recipesInMemory) {
        recipesInMemory = await getRecipes();
    }

    return searchRecipes(recipesInMemory, query, fields);
}

export async function refreshRecipes() {
    recipesInMemory = await getRecipes();
    return recipesInMemory;
}