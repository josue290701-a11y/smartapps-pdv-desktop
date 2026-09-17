// Este archivo solo se usa en la ventanita interna que tu PDV abre para mostrar
// la vista previa del ticket antes de imprimir. Reemplaza window.print() (que
// abriría el diálogo normal de impresión) para pedirle al proceso principal que
// imprima directo en la impresora térmica configurada, sin preguntar nada.
const { ipcRenderer } = require('electron');

window.print = function () {
  ipcRenderer.send('imprimir-ticket-silencioso');
};
