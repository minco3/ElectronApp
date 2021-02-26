const { app, BrowserWindow, remote, dialog } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    backgroundColor: '#181a1b',
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

