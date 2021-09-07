const { contextBridge, ipcRenderer } = require('electron')

// TODO: should communication with the main process be encrypted? probably not
contextBridge.exposeInMainWorld('passwordVault', {
    listAll: async () => {
        // List all password names and IDs in NeDB
        return await ipcRenderer.invoke('list-all-passwords')
    },
    authenticate: async (pin) => {
        // Create session with PIN
        return await ipcRenderer.invoke('authenticate', pin)
    },
    authenticateSession: async (sessionID) => {
        return await ipcRenderer.invoke('authenticateSession', sessionID)
    },
    create: async (passwordData, sessionID) => {
        // Create a password in NeDB
        return await ipcRenderer.invoke('create-password', passwordData, sessionID)
    },
    view: async (id, sessionID) => {
        // Retrieve a password from NeDB
        return id && await ipcRenderer.invoke('view-password', id, sessionID)
    },
    update: async (id, passwordUpdateData, sessionID) => {
        // Update a password in NeDB
        return await ipcRenderer.invoke('edit-password', id, passwordUpdateData, sessionID)
    },
    delete: async (id, sessionID) => {
        // Delete a password from NeDB
        return await ipcRenderer.invoke('delete-password', id, sessionID)
    },
})
