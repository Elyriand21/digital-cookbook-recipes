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

    // --- Helper to show recipe details ---
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

    // --- Helper to populate recipe list ---
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

    // --- Helper to find added/removed recipes ---
    function getRecipeDifferences(oldRecipes, newRecipes) {
        const oldIds = new Set(oldRecipes.map(r => r.id));
        const newIds = new Set(newRecipes.map(r => r.id));

        const added = newRecipes.filter(r => !oldIds.has(r.id));
        const removed = oldRecipes.filter(r => !newIds.has(r.id));

        return { added, removed };
    }

    // --- Format recipe list for display ---
    function formatRecipeList(recipes) {
        return recipes.map(r => `• ${r.title || r.filename}`).join("\n");
    }

    // --- Function to check for updates and optionally refresh ---
    async function checkForUpdates() {
        log("🔄 Checking for recipe updates...");

        const cachedRecipes = allRecipes;
        const liveRecipes = await window.api.getRecipes();
        const { added, removed } = getRecipeDifferences(cachedRecipes, liveRecipes);

        let proceed = true;
        let message = "";

        if (added.length && removed.length) {
            message = `⚠ ${added.length} new recipe(s) added:\n${formatRecipeList(added)}\n\n` +
                `⚠ ${removed.length} recipe(s) removed:\n${formatRecipeList(removed)}\n\n` +
                "Do you want to update your recipe list?";
        } else if (added.length) {
            message = `✅ ${added.length} new recipe(s) added:\n${formatRecipeList(added)}\n\nDo you want to update your recipe list?`;
        } else if (removed.length) {
            message = `⚠ ${removed.length} recipe(s) were removed:\n${formatRecipeList(removed)}\n\nDo you want to update your recipe list?`;
        } else {
            alert("📋 Your recipes are up to date!");
            proceed = false;
        }

        if (proceed) {
            proceed = confirm(message);
            if (proceed) {
                allRecipes = liveRecipes;
                populateRecipeList(allRecipes);
                log(`✔ Recipe list updated. ${allRecipes.length} recipe(s) available`);
            } else {
                log("ℹ Recipe update canceled by user");
            }
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
    refreshBtn.addEventListener("click", checkForUpdates);

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

    // --- Initialize cookbook and check updates immediately ---
    log("⏳ Initializing cookbook...");
    allRecipes = await window.api.getRecipes();
    populateRecipeList(allRecipes);
    log(`✔ Loaded ${allRecipes.length} recipes`);

    // Automatically check for updates on startup
    await checkForUpdates();
});
