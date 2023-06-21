const { app, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');

let mainWindow;

function createWindow() {
  const expressApp = express();
  expressApp.use(express.static(path.join(__dirname, 'src')));

  const server = expressApp.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:8080');
  });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL('http://localhost:8080');

  mainWindow.on('closed', () => {
    server.close();
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
