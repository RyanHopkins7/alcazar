const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('passwordVault', {
    create: (passwordData) => {
        // Create a password in NeDB
        ipcRenderer.send('create-password', passwordData)
    },
    view: (id) => {
        // Retrieve a password from NeDB
        ipcRenderer.send('view-password', id)
    },
    update: (id, passwordUpdateData) => {
        // Update a password in NeDB
        ipcRenderer.send('update-password', { 'id': id, ...passwordUpdateData })
    },
    delete: (id) => {
        // Delete a password from NeDB
        ipcRenderer.send('delete-password', id)
    },
})
