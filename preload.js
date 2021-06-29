const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('passwordVault', {
    create: async (passwordData) => {
        // Create a password in NeDB
        return await ipcRenderer.invoke('create-password', passwordData)
    },
    listAll: async () => {
        // List all password names and IDs in NeDB
        return await ipcRenderer.invoke('list-all-passwords')
    },
    view: async (id) => {
        // Retrieve a password from NeDB
        return id && await ipcRenderer.invoke('view-password', id)
    },
    update: (id, passwordUpdateData) => {
        // Update a password in NeDB
    },
    delete: async (id) => {
        // Delete a password from NeDB
        return await ipcRenderer.invoke('delete-password', id)
    },
})
