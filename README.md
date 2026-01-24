# Zero's Cookbook

**Zero's Cookbook** is an open-source desktop application that makes it easy to browse, search, and view recipes fetched directly from GitHub. Recipes are cached locally for fast access, and the app notifies you whenever new recipes are added or existing recipes are removed.

## NOTICE
Once the .zip is extracted, running the installer.exe will bring up a Microsft Defender alert. The reason behind this is because I do not possess a signing certificate *(cause i'm broke)* so there's no way to go past that. [Here](https://www.virustotal.com/gui/file/7dcd1d08ea6004e6956eebf9963cfa31eac7b4c3544802bdc645a76dd1050b34/detection) is the VirusTotal link for the installer. Feel free to upload it yourself to scan if you feel more comfortable.

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

1. Download the `.exe` installer from the Assets section.
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

- Fixes #1 where the app incorrectly reported **“new recipes”** on startup even when no changes were made in the repository  
- Resolved an issue where recipes would **not populate correctly** in the UI under certain conditions  
- Fixed refresh logic so the **Refresh Recipes** button always behaves correctly  
- Fixed cache handling so the **Clear Cache** button reliably forces a full re-fetch from GitHub  
- Improved startup consistency and internal state syncing

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
