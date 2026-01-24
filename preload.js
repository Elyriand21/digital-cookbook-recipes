const { contextBridge, ipcRenderer } = require("electron");

console.log("preload.js loaded!");

contextBridge.exposeInMainWorld("api", {
    // Fetch recipes from main process
    getRecipes: async () => await ipcRenderer.invoke("get-recipes"),

    // Load cached recipes
    loadCachedRecipes: async () =>
        await ipcRenderer.invoke("load-cached-recipes"),

    // Clear local cache
    clearCache: async () =>
        await ipcRenderer.invoke("clear-cache"),

    // Optional: allow logging from renderer to main
    log: (msg) => ipcRenderer.send("renderer-log", msg)
});
