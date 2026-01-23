document.addEventListener("DOMContentLoaded", async () => {
    // --- Elements ---
    const recipeListPanel = document.getElementById("recipeListPanel");
    const recipeDetailsPanel = document.getElementById("recipeDetailsPanel");
    const titleEl = recipeDetailsPanel.querySelector(".title");
    const ingredientsEl = recipeDetailsPanel.querySelector(".ingredients");
    const instructionsEl = recipeDetailsPanel.querySelector(".instructions");
    const backBtn = document.getElementById("backBtn");
    const searchBox = document.getElementById("searchBox");
    const refreshBtn = document.getElementById("refreshBtn");

    let allRecipes = [];

    // --- Logging helper: only terminal ---
    function log(msg) {
        console.log(msg);
    }

    // --- Show recipe details ---
    function showRecipeDetails(recipe) {
        log(`📝 Showing recipe: ${recipe.title}`);

        recipeListPanel.style.display = "none";
        recipeDetailsPanel.style.display = "block";

        titleEl.textContent = recipe.title;
        ingredientsEl.textContent = recipe.ingredients.join("\n");
        instructionsEl.textContent = recipe.instructions.join("\n");
    }

    // --- Populate recipe list ---
    function populateRecipeList(recipes) {
        log(`📋 Populating recipe list with ${recipes.length} recipe(s)`);
        recipeListPanel.innerHTML = "";

        recipes.forEach(recipe => {
            const li = document.createElement("li");
            li.textContent = recipe.title || recipe.filename; // <-- use title from parser
            li.addEventListener("click", () => showRecipeDetails(recipe));
            recipeListPanel.appendChild(li);
            log(`✅ Loaded recipe into list: ${recipe.title}`);
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
        try {
            allRecipes = await window.api.getRecipes();
            populateRecipeList(allRecipes);
            log(`✔ Refresh complete. ${allRecipes.length} recipe(s) available`);
        } catch (err) {
            log(`❌ Error refreshing recipes: ${err.message}`);
        }
    });

    // --- Initialize cookbook ---
    log("⏳ Initializing cookbook...");
    try {
        allRecipes = await window.api.getRecipes();
        log(`✔ ${allRecipes.length} recipes loaded`);
        populateRecipeList(allRecipes);
    } catch (err) {
        log(`❌ Error loading recipes: ${err.message}`);
    }
});
