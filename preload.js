const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('passwordVault', {
    create: (passwordData) => {
        // Create a password in NeDB
        ipcRenderer
            .invoke('create-password', passwordData)
            .then((result) => console.log(result))
    },
    listAll: async () => {
        // List all password names and IDs in NeDB
        return await ipcRenderer.invoke('list-all-passwords')
    },
    view: async (id) => {
        // Retrieve a password from NeDB
        return id && await ipcRenderer.invoke('view-password', id)
    },
    viewAll: () => {
        // Retrieve all passwords from NeDB
    },
    update: (id, passwordUpdateData) => {
        // Update a password in NeDB
    },
    delete: (id) => {
        // Delete a password from NeDB
    },
})
