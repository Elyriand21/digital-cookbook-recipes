// preload.js
const { contextBridge, ipcRenderer } = require("electron");

console.log("preload.js loaded!");

contextBridge.exposeInMainWorld("api", {
    getRecipes: async () => {
        return await ipcRenderer.invoke("get-recipes");
    },
    clearCache: async () => {
        return await ipcRenderer.invoke("clear-cache");
    },
    onLog: (callback) => {
        ipcRenderer.on("log", (_, msg) => callback(msg));
    }
});
