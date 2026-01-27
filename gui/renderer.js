console.log("🧑‍🍳 Renderer process started");

document.addEventListener("DOMContentLoaded", async () => {
    // --- Elements ---
    const recipeListPanel = document.getElementById("recipeListPanel");
    const recipeDetailsPanel = document.getElementById("recipeDetailsPanel");
    const titleEl = recipeDetailsPanel.querySelector(".title");
    const prepEl = recipeDetailsPanel.querySelector(".prepTime");
    const cookEl = recipeDetailsPanel.querySelector(".cookTime");
    const servingsEl = recipeDetailsPanel.querySelector(".servings");
    const ingredientsEl = recipeDetailsPanel.querySelector(".ingredients");
    const allergiesEl = recipeDetailsPanel.querySelector(".allergies");
    const instructionsEl = recipeDetailsPanel.querySelector(".instructions");
    const backBtn = document.getElementById("backBtn");
    const searchBox = document.getElementById("searchBox");
    const refreshBtn = document.getElementById("refreshBtn");
    const clearCacheBtn = document.getElementById("clearCacheBtn");

    // Modal elements
    const modalOverlay = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const modalOk = document.getElementById("modalOk");
    const modalCancel = document.getElementById("modalCancel");

    // --- Modal helper functions ---
    function showAlert(message, title = "Message") {
        return new Promise(resolve => {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modalCancel.style.display = "none";
            modalOverlay.style.display = "flex";
            modalOverlay.setAttribute("aria-hidden", "false");
            modalOk.focus();

            function cleanup() {
                modalOverlay.style.display = "none";
                modalOverlay.setAttribute("aria-hidden", "true");
                modalOk.removeEventListener("click", okHandler);
            }

            function okHandler() {
                cleanup();
                resolve();
            }

            modalOk.addEventListener("click", okHandler);
        });
    }

    function showConfirm(message, title = "Confirm") {
        return new Promise(resolve => {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modalCancel.style.display = "";
            modalOverlay.style.display = "flex";
            modalOverlay.setAttribute("aria-hidden", "false");
            modalOk.focus();

            function cleanup() {
                modalOverlay.style.display = "none";
                modalOverlay.setAttribute("aria-hidden", "true");
                modalOk.removeEventListener("click", okHandler);
                modalCancel.removeEventListener("click", cancelHandler);
            }

            function okHandler() {
                cleanup();
                resolve(true);
            }

            function cancelHandler() {
                cleanup();
                resolve(false);
            }

            modalOk.addEventListener("click", okHandler);
            modalCancel.addEventListener("click", cancelHandler);
        });
    }

    // Ensure input is focusable and receives pointer events
    searchBox.tabIndex = 0;
    searchBox.style.pointerEvents = "auto";

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
        allergiesEl.textContent = recipe.allergies?.join("\n") || "";
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

    // --- Refresh button ---
    async function refreshRecipes() {
        log("🔄 Checking for recipe updates...");
        const cachedRecipes = await window.api.loadCachedRecipes();
        const result = await window.api.getRecipes();
        const liveRecipes = result.recipes;
        const { added, removed } = result;

        let proceed = true;

        // If the cache does not exist
        if (!cachedRecipes.recipes.length && liveRecipes.length) {
            console.log("No cached recipes found, loading all live recipes");
            proceed = true; // force reload after cache clear
        } else if (added.length && removed.length) {
            proceed = await showConfirm(`⚠ ${added.length} new recipe(s) added and ${removed.length} recipe(s) removed.\nDo you want to update your recipe list?`);
        } else if (added.length) {
            proceed = await showConfirm(`✅ ${added.length} new recipe(s) added.\nDo you want to update your recipe list?`);
        } else if (removed.length) {
            proceed = await showConfirm(`⚠ ${removed.length} recipe(s) were removed.\nDo you want to update your recipe list?`);
        } else if (cachedRecipes.recipes.length == liveRecipes.length) {
            console.log("No changes detected between cached and live recipes");
            populateRecipeList(cachedRecipes.recipes);
            await showAlert("📋 Your recipes are up to date!");
            proceed = false;
        } else {
            await showAlert("📋 Your recipes are up to date!");
            proceed = false;
        }

        if (proceed) {
            allRecipes = liveRecipes;
            populateRecipeList(allRecipes);
            log(`✔ Recipe list updated. ${allRecipes.length} recipe(s) available`);
            await showAlert(`✔ Reloaded ${allRecipes.length} recipes from GitHub`);
            log(`✔ Reloaded ${allRecipes.length} recipes`);
        } else {
            log("ℹ Recipe update canceled or no changes detected");
        }
    }

    refreshBtn.addEventListener("click", refreshRecipes);

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
            (recipe.ingredients?.some(i => i.toLowerCase().includes(query))) ||
            (recipe.allergies?.some(a => a.toLowerCase().includes(query)))
        );
        populateRecipeList(filtered);
    });

    // --- Clear cache button ---
    clearCacheBtn.addEventListener("click", async () => {
        const confirmed = await showConfirm("⚠ Are you sure you want to delete local cache? Recipes will be re-fetched.");
        if (!confirmed) return;

        log("🗑 Clearing local cache...");
        const result = await window.api.clearCache();
        log(result.message);

        refreshRecipes();
    });

    // --- Initialize cookbook ---
    log("⏳ Initializing cookbook...");
    refreshRecipes();
});