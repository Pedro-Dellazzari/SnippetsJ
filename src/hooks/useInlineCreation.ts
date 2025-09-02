import { create } from 'zustand'

interface InlineCreationState {
  // Estados de criação inline
  creatingFolder: string | null // 'root' ou ID da pasta pai
  creatingProject: string | null // 'root' ou ID do projeto pai
  
  // Ações
  startCreatingFolder: (parentId?: string) => void
  startCreatingProject: (parentId?: string) => void
  cancelCreation: () => void
  finishCreation: () => void
}

export const useInlineCreation = create<InlineCreationState>((set, get) => ({
  creatingFolder: null,
  creatingProject: null,
  
  startCreatingFolder: (parentId) => {
    set({ 
      creatingFolder: parentId || 'root',
      creatingProject: null // Cancel any project creation
    })
  },
  
  startCreatingProject: (parentId) => {
    set({ 
      creatingProject: parentId || 'root',
      creatingFolder: null // Cancel any folder creation
    })
  },
  
  cancelCreation: () => {
    set({ creatingFolder: null, creatingProject: null })
  },
  
  finishCreation: () => {
    set({ creatingFolder: null, creatingProject: null })
  }
}))