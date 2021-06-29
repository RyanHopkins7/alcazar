const { app, ipcMain, BrowserWindow } = require('electron')
const Datastore = require('nedb-promises')
const path = require('path')

const isDev = !app.isPackaged

// TODO: prevent reload on IPC (might be due to NeDB)
// if (isDev) {
//     require('electron-reload')(__dirname, {
//         electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
//     })
// }

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Create NeDB datastore

const passwordsDB = new Datastore({ filename: './passwords.nedb', autoload: true })

// IPC

ipcMain.handle('create-password', async (event, passwordData) => {
    // TODO: check that no fields are empty
    return await passwordsDB
        .insert(passwordData)
        .then(inserted => passwordsDB.findOne({ '_id': inserted['_id'] }, { name: 1, _id: 1 }))
})

ipcMain.handle('list-all-passwords', async (event) => {
    return await passwordsDB.find({}, { name: 1, _id: 1 })
})

ipcMain.handle('view-password', async (event, id) => {
    // TODO: require authentication
    return await passwordsDB.findOne({ '_id': id })
})
