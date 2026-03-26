interface ElectronAPI {
  openXlsFile: () => Promise<{ buffer: string; name: string } | null>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
