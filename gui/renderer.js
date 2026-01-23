import { getRecipesForGUI } from "../services/recipeService.js";

const recipeListPanel = document.getElementById("recipeListPanel");
const recipeDetailsPanel = document.getElementById("recipeDetailsPanel");

const titleEl = recipeDetailsPanel.querySelector(".title");
const ingredientsEl = recipeDetailsPanel.querySelector(".ingredients");
const instructionsEl = recipeDetailsPanel.querySelector(".instructions");
const backBtn = document.getElementById("backBtn");

let allRecipes = [];

// Load recipes from backend
async function init() {
    recipeListPanel.innerHTML = "Loading recipes...";
    allRecipes = await getRecipesForGUI();
    populateRecipeList(allRecipes);
}

// Populate clickable list
function populateRecipeList(recipes) {
    recipeListPanel.innerHTML = "";
    recipes.forEach(recipe => {
        const li = document.createElement("li");
        li.textContent = recipe.title;
        li.addEventListener("click", () => showRecipeDetails(recipe));
        recipeListPanel.appendChild(li);
    });
}

// Show details panel
function showRecipeDetails(recipe) {
    recipeListPanel.style.display = "none";
    recipeDetailsPanel.style.display = "block";

    titleEl.textContent = recipe.title;
    ingredientsEl.textContent = recipe.ingredients.join("\n");
    instructionsEl.textContent = recipe.instructions;
}

// Back button
backBtn.addEventListener("click", () => {
    recipeDetailsPanel.style.display = "none";
    recipeListPanel.style.display = "block";
});

// Initialize
init();
