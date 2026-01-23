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

        // Title
        titleEl.textContent = recipe.title || recipe.filename;

        // Metadata
        prepEl.textContent = recipe.prepTime ? `Prep: ${recipe.prepTime} min` : "";
        cookEl.textContent = recipe.cookTime ? `Cook: ${recipe.cookTime} min` : "";
        servingsEl.textContent = recipe.servings ? `Servings: ${recipe.servings}` : "";

        // Ingredients & Instructions
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
    refreshBtn.addEventListener("click", async () => {
        log("🔄 Refreshing recipes...");
        allRecipes = await window.api.getRecipes();
        populateRecipeList(allRecipes);
        log(`✔ Refresh complete. ${allRecipes.length} recipes`);
    });

    // --- Clear cache button ---
    clearCacheBtn.addEventListener("click", async () => {
        const confirmed = confirm("⚠ Are you sure you want to delete local cache? Recipes will be re-fetched.");
        if (!confirmed) return;

        log("🗑 Clearing local cache...");
        const result = await window.api.clearCache();
        log(result.message);

        allRecipes = await window.api.getRecipes();
        populateRecipeList(allRecipes);
        log(`✔ Reloaded ${allRecipes.length} recipes`);
    });

    // --- Initialize cookbook ---
    log("⏳ Initializing cookbook...");
    allRecipes = await window.api.getRecipes();
    populateRecipeList(allRecipes);
    log(`✔ Loaded ${allRecipes.length} recipes`);
});
