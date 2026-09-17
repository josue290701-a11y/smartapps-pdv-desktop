const { app, BrowserWindow, Menu, shell, session } = require('electron');
const path = require('path');

// ==== CONFIGURA AQUÍ TU URL ====
const APP_URL = 'https://josue290701-a11y.github.io/Smartapps-PDV-App/';
const APP_NAME = 'SmartApps PDV';
// ================================

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true, // oculta la barra de menú (Archivo/Edición/...) para que no se vea como navegador
    backgroundColor: '#111111',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  // Quita el menú por completo (aún más limpio que solo ocultarlo)
  Menu.setApplicationMenu(null);

  mainWindow.loadURL(APP_URL);

  // Si algo intenta abrir una ventana nueva (ej. un link "target=_blank"),
  // ábrelo en el navegador del sistema en vez de abrir otra ventana de la app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
