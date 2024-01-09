// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Expose certain Node.js APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Expose the 'require' function to load modules
    require: (module) => {
        return require(module);
    },

    // Expose the 'ipcRenderer' object for inter-process communication
    ipcRenderer: ipcRenderer,
});