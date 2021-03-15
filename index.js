const { app, BrowserWindow, remote, dialog } = require('electron');
const {ipcMain} = require('electron');
const ProgressBar = require('electron-progressbar');

app.on('ready', function() {
  console.log('app ready');
});

ipcMain.on('create-new-progressbar', (event, arg) => {
  global.progressBar = new ProgressBar({
    abortOnError: false,
    indeterminate: false,
    initialValue: 0,
    maxValue: 100,
    closeOnComplete: true,
    title: 'Exporting',
    text: 'Exporting...',
    detail: 'Starting export...',
    style: {
        text: {},
        detail: {},
        bar: { 'width': '100%', 'background-color': '#BBE0F1' },
        value: {}
    },
    browserWindow: {
        parent: null,
        modal: true,
        resizable: false,
        closable: false,
        minimizable: true,
        maximizable: false,
        width: 500,
        height: 170,
        // Important - If not passed, Progress Bar will not be displayed. 
        webPreferences: {
            nodeIntegration: true
        }
    }
  });
  progressBar
    .on('completed', (value) => {
        // console.log(progressBar.isCompleted());
        console.log('progress bar completed');
        progressBar.detail = 'Done';
    })
    .on('ready', () => {
        console.log('progress bar ready');
        console.log(progressBar.getOptions())
    })
    .on('aborted', (value) => {
        console.log('progress bar aborted');
        console.log(`aborted... ${value}`);
    })
    .on('progress', (value) => {
        //console.log('progress, value:', value);
        progressBar.detail = `${Math.floor(value)}% completed`;
    });
})

ipcMain.on('send-new-progress-value', (event, arg) => {
  console.log('received', arg);
  if(arg === 'FINISHED') {
    progressBar.setCompleted();
  } else {
    progressBar.value = arg;
  }
});


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
    createWindow();
  }
});
