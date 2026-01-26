# Zero's Cookbook

**Zero's Cookbook** is an open-source desktop application that makes it easy to browse, search, and view recipes fetched directly from GitHub. Recipes are cached locally for fast access, and the app notifies you whenever new recipes are added or existing recipes are removed.

## NOTICE
Once the .zip is extracted, running the installer.exe will bring up a Microsft Defender alert. The reason behind this is because I do not possess a signing certificate *(cause i'm broke)* so there's no way to go past that. [Here](https://www.virustotal.com/gui/file/de13e68986128be44afb01a85c48c9d6d270d1d75691a6125e854dab8b5c28ab?nocache=1) is the VirusTotal link for the installer, [Here](https://www.virustotal.com/gui/file/434f308de04cc9e2c5fd408b922136ebea645b49f7522c456543cd833486f17d?nocache=1) is for **Zero's Cookbook.exe**. Feel free to upload it yourself to scan if you feel more comfortable.

---

## Features

- **Intuitive GUI** – Browse recipes in a clean, user-friendly interface.
- **Detailed recipe view** – See ingredients, instructions, prep time, cook time, and servings.
- **Real-time search** – Filter recipes by title, tags, or ingredients instantly.
- **Automatic updates** – Get notified when recipes are added or removed, with the option to update your local list.
- **Refresh and clear cache** – Keep your recipe list up-to-date or reset your local cache with a single click.
- **Cross-platform ready** – Currently packaged for Windows; support for macOS and Linux coming soon.

---

## Installation

💻 **Windows Installer Included** – Download the installer from the [GitHub release](https://github.com/Elyriand21/digital-cookbook-recipes/releases).

1. Download the installer
2. Run the installer and follow the on-screen instructions.
3. Recipes are cached locally but can be refreshed anytime to fetch the latest from GitHub.

---

## Usage

- Click on a recipe to view detailed information.
- Use the search box to quickly filter recipes by title, tags, or ingredients.
- Click **Refresh** to check for recipe updates.
- Click **Clear Cache** to remove all locally stored recipes and reload from GitHub.

---

## Release Notes

### v1.0.0

- Fetch and cache recipes directly from GitHub.
- Display detailed recipe information including ingredients, instructions, prep/cook time, and servings.
- Real-time search functionality across titles, tags, and ingredients.
- Notifications for new or removed recipes, with an option to update.
- Refresh and clear cache features to manage your local recipe list.
- Clean, intuitive Electron-based GUI.

### v1.0.1 

- Fixes issue where the app incorrectly reported **“new recipes”** on startup even when no changes were made in the repository  
- Resolved an issue where recipes would **not populate correctly** in the UI under certain conditions  
- Fixed refresh logic so the **Refresh Recipes** button always behaves correctly  
- Fixed cache handling so the **Clear Cache** button reliably forces a full re-fetch from GitHub  
- Improved startup consistency and internal state syncing

### v1.0.2

- Added missing IPC handler `load-cached-recipes` to match the preload API.
- Centralized GitHub fetch and folder hash logic into `githubService.js`.
- Refresh logic now compares live GitHub recipes against cached recipes instead of in-memory state.
- App startup now uses the same refresh flow as the manual Refresh button.
- Improved console logging for fetch operations, cache usage, and update decisions.
- Fixed false “Your recipes are up to date” message after clearing cache.
- Fixed refresh not reloading recipes when no cache file exists.
- Fixed inconsistent update detection after restarting the app.
- Resolved silent IPC mismatch that caused refresh edge cases.
- Removed a line of code that was never called in preload.js

### v1.1.0

- Added support for an `allergies` field. The parser normalizes values and defaults missing/empty allergies to `["None"]`.
- UI: show `Allergies` in the recipe details view (displays "None" when there are no allergens).
- Search: recipes are searchable by `allergies`.
- Cache migration: existing cached recipes are migrated to include `["None"]` where necessary to maintain consistency.

---

## Roadmap & Future Enhancements

- Local recipe editing and saving without overwriting originals.
- Recipe submission workflow for community contributions.
- User authentication for submissions.
- Recipe rating and commenting system.
- Full cross-platform support for macOS and Linux.
- Track exactly which recipes changed using per-recipe SHA tracking.
- Show “last updated” timestamp for each recipe.
- Add nutrition information and tags.
- Optimize GitHub API usage for faster loading.

---

## Contributing

We welcome contributions! Open issues or submit pull requests for new features, bug fixes, or enhancements.

---

## License

This project is licensed under the MIT License.
