const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');

// ==== CONFIGURA AQUÍ TU URL ====
const APP_URL = 'https://josue290701-a11y.github.io/Smartapps-PDV-App/';
const APP_NAME = 'SmartApps PDV';
// ================================

// ==== IMPRESORA TÉRMICA ====
// Déjalo vacío ('') para usar la impresora predeterminada de Windows.
// O escribe aquí el nombre EXACTO tal como aparece en:
// Windows > Configuración > Bluetooth y dispositivos > Impresoras y escáneres
// Ejemplo: const PRINTER_NAME = 'XP-80C';
const PRINTER_NAME = '';
// ============================

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

  // Si algo intenta abrir una ventana nueva, hay que distinguir dos casos:
  // 1) La propia app abre la vista previa del ticket para imprimir (window.open desde tu código)
  //    -> debe abrirse DENTRO de la app, y su window.print() se manda directo a la
  //       impresora térmica sin mostrar ningún diálogo (ver preload-print.js).
  // 2) Un link normal de la página (ej. "target=_blank" a otro sitio)
  //    -> ese sí se manda al navegador del sistema.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url || url === 'about:blank') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 420,
          height: 600,
          autoHideMenuBar: true,
          show: false, // no hace falta que el usuario vea la ventanita: se imprime sola y se cierra
          webPreferences: {
            preload: path.join(__dirname, 'preload-print.js'),
            contextIsolation: false,
            nodeIntegration: false,
          },
        },
      };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Cuando la ventanita de ticket llama a window.print() (interceptado por
// preload-print.js), imprime directo en la impresora térmica configurada,
// sin diálogo, y cierra la ventanita al terminar.
ipcMain.on('imprimir-ticket-silencioso', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  win.webContents.print(
    {
      silent: true,
      printBackground: true,
      deviceName: PRINTER_NAME || undefined,
      margins: { marginType: 'none' },
    },
    (success, errorType) => {
      if (!success) console.error('No se pudo imprimir el ticket:', errorType);
      if (!win.isDestroyed()) win.close();
    }
  );
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
