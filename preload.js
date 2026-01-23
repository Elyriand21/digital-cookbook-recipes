// preload.js
const { contextBridge, ipcRenderer } = require("electron");

console.log("preload.js loaded!");

contextBridge.exposeInMainWorld("api", {
    getRecipes: async () => {
        return await ipcRenderer.invoke("get-recipes");
    },
    onLog: (callback) => {
        ipcRenderer.on("log", (_, msg) => callback(msg));
    }
});
