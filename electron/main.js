const {app, BrowserWindow, ipcMain, shell} = require('electron')

const os = require('os'),
  package = require('../package.json'),
  path = require('path')

let mainWindow

// XXX: Crashes on Ubuntu
if (os.platform() == 'win32') {
  // XXX: Steam Overlay support
  app.commandLine.appendSwitch('disable-direct-composition')
  app.commandLine.appendSwitch('disable-renderer-backgrounding')
  app.commandLine.appendSwitch('disable-software-rasterizer')
  app.commandLine.appendSwitch('in-process-gpu')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    fullscreen: true,
    icon: path.join(__dirname, '../public/favicon.png'),
    title: package.name,
    webPreferences: {
      contextIsolation: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // Handle permission requests
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    switch (permission) {
      case 'midi':
      case 'pointerLock':
        return callback(true)
    }

    callback(false)
  })

  // Handle new windows
  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    if (url.startsWith('https:')) {
      shell.openExternal(url)
    }
    return {
      action: 'deny',
    }
  })

  // Prevent shortcuts like Ctrl+W (close) or Ctrl+R (refresh)
  mainWindow.removeMenu()

  // Garbage collect when window closes
  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.loadFile('public/index.html')
}

app.on('ready', () => {
  app.accessibilitySupportEnabled = true
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!mainWindow) {
    createWindow()
  }
})

ipcMain.on('quit', () => app.quit())
