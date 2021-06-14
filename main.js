const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = !app.isPackaged

if (isDev) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    })
}

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
