document.addEventListener("DOMContentLoaded", async () => {
    // --- Elements ---
    const recipeListPanel = document.getElementById("recipeListPanel");
    const recipeDetailsPanel = document.getElementById("recipeDetailsPanel");
    const titleEl = recipeDetailsPanel.querySelector(".title");
    const prepEl = recipeDetailsPanel.querySelector(".prepTime");
    const cookEl = recipeDetailsPanel.querySelector(".cookTime");
    const servingsEl = recipeDetailsPanel.querySelector(".servings");
    const ingredientsEl = recipeDetailsPanel.querySelector(".ingredients");
    const instructionsEl = recipeDetailsPanel.querySelector(".instructions");
    const backBtn = document.getElementById("backBtn");
    const searchBox = document.getElementById("searchBox");
    const refreshBtn = document.getElementById("refreshBtn");
    const clearCacheBtn = document.getElementById("clearCacheBtn");

    let allRecipes = [];

    // --- Terminal logging only ---
    const log = console.log;

    // --- Show recipe details ---
    function showRecipeDetails(recipe) {
        recipeListPanel.style.display = "none";
        recipeDetailsPanel.style.display = "block";

        titleEl.textContent = recipe.title || recipe.filename;
        prepEl.textContent = recipe.prepTime ? `Prep: ${recipe.prepTime} min` : "";
        cookEl.textContent = recipe.cookTime ? `Cook: ${recipe.cookTime} min` : "";
        servingsEl.textContent = recipe.servings ? `Servings: ${recipe.servings}` : "";

        ingredientsEl.textContent = recipe.ingredients?.join("\n") || "";
        instructionsEl.textContent = recipe.instructions?.join("\n") || "";
    }

    // --- Populate recipe list ---
    function populateRecipeList(recipes) {
        recipeListPanel.innerHTML = "";
        recipes.forEach(recipe => {
            const li = document.createElement("li");
            li.textContent = recipe.title || recipe.filename;
            li.addEventListener("click", () => showRecipeDetails(recipe));
            recipeListPanel.appendChild(li);
            log(`✅ Loaded recipe: ${recipe.title}`);
        });

        if (recipes.length === 0) {
            recipeListPanel.innerHTML = "<li>No recipes available.</li>";
        }
    }

    // --- Detect added or removed recipes ---
    function getRecipeDifferences(oldRecipes, newRecipes) {
        const oldIds = new Set(oldRecipes.map(r => r.id));
        const newIds = new Set(newRecipes.map(r => r.id));
        const added = newRecipes.filter(r => !oldIds.has(r.id));
        const removed = oldRecipes.filter(r => !newIds.has(r.id));
        return { added, removed };
    }

    // --- Back button ---
    backBtn.addEventListener("click", () => {
        recipeDetailsPanel.style.display = "none";
        recipeListPanel.style.display = "block";
    });

    // --- Search box ---
    searchBox.addEventListener("input", () => {
        const query = searchBox.value.trim().toLowerCase();
        const filtered = allRecipes.filter(recipe =>
            (recipe.title?.toLowerCase().includes(query)) ||
            (recipe.tags?.some(tag => tag.toLowerCase().includes(query))) ||
            (recipe.ingredients?.some(i => i.toLowerCase().includes(query)))
        );
        populateRecipeList(filtered);
    });

    // --- Refresh button ---
    async function refreshRecipes() {
        log("🔄 Checking for recipe updates...");
        const cachedRecipes = allRecipes;
        const result = await window.api.getRecipes();
        const liveRecipes = result.recipes;
        const { added, removed } = result;

        let proceed = true;

        if (!cachedRecipes.length && liveRecipes.length) {
            proceed = true; // force reload after cache clear
        } else if (added.length && removed.length) {
            proceed = confirm(`⚠ ${added.length} new recipe(s) added and ${removed.length} recipe(s) removed.\nDo you want to update your recipe list?`);
        } else if (added.length) {
            proceed = confirm(`✅ ${added.length} new recipe(s) added.\nDo you want to update your recipe list?`);
        } else if (removed.length) {
            proceed = confirm(`⚠ ${removed.length} recipe(s) were removed.\nDo you want to update your recipe list?`);
        } else {
            alert("📋 Your recipes are up to date!");
            proceed = false;
        }

        if (proceed) {
            allRecipes = liveRecipes;
            populateRecipeList(allRecipes);
            log(`✔ Recipe list updated. ${allRecipes.length} recipe(s) available`);
        } else {
            log("ℹ Recipe update canceled or no changes detected");
        }
    }

    refreshBtn.addEventListener("click", refreshRecipes);

    // --- Clear cache button ---
    clearCacheBtn.addEventListener("click", async () => {
        const confirmed = confirm("⚠ Are you sure you want to delete local cache? Recipes will be re-fetched.");
        if (!confirmed) return;

        log("🗑 Clearing local cache...");
        const result = await window.api.clearCache();
        log(result.message);

        const res = await window.api.getRecipes();
        allRecipes = res.recipes;
        populateRecipeList(allRecipes);

        alert(`✔ Reloaded ${allRecipes.length} recipes from GitHub`);
        log(`✔ Reloaded ${allRecipes.length} recipes`);
    });

    // --- Initialize cookbook ---
    log("⏳ Initializing cookbook...");
    const cachedRecipes = allRecipes;
    const result = await window.api.getRecipes();
    allRecipes = result.recipes;
    const { added, removed } = result;

    let proceed = true;
    if (added.length && removed.length) {
        proceed = confirm(`⚠ ${added.length} new recipe(s) added and ${removed.length} recipe(s) removed.\nDo you want to update your recipe list?`);
    } else if (added.length) {
        proceed = confirm(`✅ ${added.length} new recipe(s) added.\nDo you want to update your recipe list?`);
    } else if (removed.length) {
        proceed = confirm(`⚠ ${removed.length} recipe(s) were removed.\nDo you want to update your recipe list?`);
    } else {
        proceed = false;
    }

    if (proceed) {
        populateRecipeList(allRecipes);
        log(`✔ Recipe list updated. ${allRecipes.length} recipe(s) available`);
    } else {
        populateRecipeList(cachedRecipes.length ? cachedRecipes : allRecipes);
        log("ℹ Recipe list initialized without updates");
    }
});
