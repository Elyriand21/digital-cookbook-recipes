# Digital Cookbook Recipes

This project is a simple Node.js utility for fetching, parsing, and processing recipe files stored in a GitHub repository. It downloads Markdown recipe files from a specified repository, extracts structured data (like title, ingredients, instructions, tags, prep/cook time, and servings), and outputs a summary of all valid recipes.

## Features

* Fetches all Markdown (`.md`) recipe files from a GitHub repository.
* Parses recipe metadata and content using `gray-matter`.
* Extracts structured recipe data including:

  * ID and title
  * Tags
  * Prep time, cook time, and servings
  * Ingredients and instructions
* Provides a console summary of all valid recipes.

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/Elyriand21/digital-cookbook-recipes.git
cd digital-cookbook-recipes
```

2. Install dependencies:

```bash
npm install
```

3. Run the test fetch script:

```bash
node testFetch.js
```

You should see a summary of all recipes downloaded and parsed from the GitHub repository.

## TO-DO

* [ ] Create Desktop GUI application to view recipes
* [ ] Generate executable to simplify requirements
* [X] Add caching to limit API calls
* [X] Add search function to find recipes by title, tags, or ingredients
* [X] Implement updating the user if recipes have been added/removed/updated from the repository 
* [ ] Implement local recipe editing and saving, not allowing overwriting of original files
* [ ] Add functionality to upload new recipes to a submission repository for review
* [ ] Implement user authentication for recipe submission
* [ ] Add recipe rating and commenting system
