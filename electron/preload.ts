import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
  
  onMenuNewSnippet: (callback: () => void) => {
    ipcRenderer.on('menu-new-snippet', callback)
  },
  
  onMenuSearch: (callback: () => void) => {
    ipcRenderer.on('menu-search', callback)
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI