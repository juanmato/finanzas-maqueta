const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openXlsFile: () => ipcRenderer.invoke('open-xls-file'),
});
