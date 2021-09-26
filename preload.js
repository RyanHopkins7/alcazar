const { contextBridge, ipcRenderer } = require('electron')

// TODO: should communication with the main process be encrypted? probably not
contextBridge.exposeInMainWorld('vault', {
    listAll: async () => {
        // List all secret names and IDs in NeDB
        return await ipcRenderer.invoke('list-all-secrets')
    },
    authenticate: async (pin) => {
        // Create session with PIN
        return await ipcRenderer.invoke('authenticate', pin)
    },
    authenticateSession: async (sessionID) => {
        return await ipcRenderer.invoke('authenticateSession', sessionID)
    },
    create: async (secretData, sessionID) => {
        // Create a secret in NeDB
        return await ipcRenderer.invoke('create-secret', secretData, sessionID)
    },
    read: async (id, sessionID) => {
        // Retrieve a secret from NeDB
        return id && await ipcRenderer.invoke('view-secret', id, sessionID)
    },
    update: async (id, secretUpdateData, sessionID) => {
        // Update a secret in NeDB
        return await ipcRenderer.invoke('edit-secret', id, secretUpdateData, sessionID)
    },
    delete: async (id, sessionID) => {
        // Delete a secret from NeDB
        return await ipcRenderer.invoke('delete-secret', id, sessionID)
    },
})
