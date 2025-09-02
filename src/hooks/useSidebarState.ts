import { useState, useCallback } from 'react'

interface SidebarState {
  expandedSections: Set<string>
  expandedFolders: Set<string>
  selectedItem: string | null
}

export function useSidebarState() {
  const [state, setState] = useState<SidebarState>({
    expandedSections: new Set(['global-view', 'folders', 'languages', 'projects']),
    expandedFolders: new Set(),
    selectedItem: 'all-snippets'
  })

  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => {
      const newExpandedSections = new Set(prev.expandedSections)
      if (newExpandedSections.has(sectionId)) {
        newExpandedSections.delete(sectionId)
      } else {
        newExpandedSections.add(sectionId)
      }
      return {
        ...prev,
        expandedSections: newExpandedSections
      }
    })
  }, [])

  const toggleFolder = useCallback((folderId: string) => {
    setState(prev => {
      const newExpandedFolders = new Set(prev.expandedFolders)
      if (newExpandedFolders.has(folderId)) {
        newExpandedFolders.delete(folderId)
      } else {
        newExpandedFolders.add(folderId)
      }
      return {
        ...prev,
        expandedFolders: newExpandedFolders
      }
    })
  }, [])

  const selectItem = useCallback((itemId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedItem: itemId
    }))
  }, [])

  const isExpanded = useCallback((id: string) => {
    return state.expandedSections.has(id) || state.expandedFolders.has(id)
  }, [state])

  const isSelected = useCallback((itemId: string) => {
    return state.selectedItem === itemId
  }, [state])

  return {
    ...state,
    toggleSection,
    toggleFolder,
    selectItem,
    isExpanded,
    isSelected
  }
}