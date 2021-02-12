const { app, BrowserWindow } = require('electron');
var ffmpeg = require('ffmpeg');

function createWindow () {
  const win = new BrowserWindow({
    backgroundColor: '#181a1b',
    webPreferences: {
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
