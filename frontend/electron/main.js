const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let rustProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL('http://localhost:3000');

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  rustProcess = spawn('./backend/target/release/backend');
  console.log('Rust backend started');
  createWindow();
});

app.on('window-all-closed', () => {
  if (rustProcess) rustProcess.kill();
  app.quit();
});
