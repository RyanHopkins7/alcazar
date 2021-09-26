const { app, ipcMain, BrowserWindow } = require('electron')
const Datastore = require('nedb-promises')
const path = require('path')
const { randomBytes } = require('crypto')

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

// Authentication

const authenticateSession = async (sessionID) => {
    // Check if session is valid and not expired
    const session = await passwordsDB.findOne({ 
        'type': 'sessionData' 
    })

    return session && session.sessionID === sessionID && session.expiration >= Date.now() // Is this secure?
}

// IPC
// TODO: names? data model?

ipcMain.handle('authenticate', async (event, pin) => {
    // TODO: protect against bruteforce attacks (rate limiting)

    // TODO
    if (pin === '0000') {
        // Create session and return token
        const sessionBuffer = randomBytes(32)
        const duration = 15 // Duration of validity of the session (minutes)
        const expiration = Date.now() + 60000 * duration // Is this secure?

        const status = await passwordsDB
            .update({
                'type': 'sessionData'
            },
            {
                'type': 'sessionData',
                'sessionID': sessionBuffer.toString('hex'),
                'duration': duration,
                'expiration': expiration
            },
            {
                'upsert': true
            })

        return {
            'status': status,
            'sessionID': sessionBuffer.toString('hex'),
            'expiration': expiration
        }
    }

    return {
        'status': 0,
        'sessionID': null
    }
})

ipcMain.handle('authenticateSession', async (event, sessionID) => authenticateSession(sessionID))

ipcMain.handle('list-all-secrets', async (event) => {
    // TODO: should this require authentication? Yes, it should!
    return await passwordsDB.find({ 
        'type': 'password' 
    }, { name: 1, _id: 1 })
})

ipcMain.handle('create-secret', async (event, passwordData, sessionID) => {
    // TODO: check that no fields are empty
    if (!await authenticateSession(sessionID)) {
        return null
    }

    return await passwordsDB
        .insert({
            'type': 'password',
            ...passwordData
        })
        .then(inserted => passwordsDB.findOne({ '_id': inserted['_id'] }, { name: 1, _id: 1 }))
})

ipcMain.handle('view-secret', async (event, id, sessionID) => {
    if (!await authenticateSession(sessionID)) {
        return null
    }

    return await passwordsDB.findOne({ 
        '_id': id,
        'type': 'password'
    })
})

ipcMain.handle('edit-secret', async (event, id, newPasswordData, sessionID) => {
    if (!await authenticateSession(sessionID)) {
        return null
    }

    return await passwordsDB.update({ 
        '_id': id,
        'type': 'password'
    }, newPasswordData)
})

ipcMain.handle('delete-secret', async (event, id, sessionID) => {
    if (!await authenticateSession(sessionID)) {
        return null
    }

    // TODO: require authentication
    return await passwordsDB.remove({ 
        '_id': id,
        'type': 'password'
    })
})
