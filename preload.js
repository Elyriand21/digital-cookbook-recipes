const { contextBridge, ipcRenderer } = require("electron");

console.log("preload.js loaded!");

contextBridge.exposeInMainWorld("api", {
    getRecipes: async () => {
        return await ipcRenderer.invoke("get-recipes");
    },
    clearCache: async () => {
        return await ipcRenderer.invoke("clear-cache");
    }
});
