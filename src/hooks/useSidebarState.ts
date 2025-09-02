import { useState, useCallback, useEffect } from 'react'
import { useStore } from '../store/useStore'

interface SidebarState {
  expandedSections: Set<string>
  expandedFolders: Set<string>
  selectedItem: string | null
}

export function useSidebarState() {
  const snippets = useStore(state => state.snippets)
  const folders = useStore(state => state.folders)
  const projectItems = useStore(state => state.projectItems)
  const selectedFolderId = useStore(state => state.selectedFolderId)
  const selectedProjectId = useStore(state => state.selectedProjectId)

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

  // Auto-expand folders and projects that contain active snippets
  useEffect(() => {
    const foldersToExpand = new Set<string>()

    // Helper function to get all parent IDs for a folder/project
    const getAllParentIds = (itemId: string, isFolder: boolean): string[] => {
      const items = isFolder ? folders : projectItems
      const item = items.find(i => i.id === itemId)
      
      if (!item?.parentId) return []
      
      return [item.parentId, ...getAllParentIds(item.parentId, isFolder)]
    }

    // When a specific folder is selected, expand its parents
    if (selectedFolderId) {
      const parentIds = getAllParentIds(selectedFolderId, true)
      parentIds.forEach(id => foldersToExpand.add(`folder-${id}`))
      foldersToExpand.add(`folder-${selectedFolderId}`)
    }

    // When a specific project is selected, expand its parents
    if (selectedProjectId) {
      const parentIds = getAllParentIds(selectedProjectId, false)
      parentIds.forEach(id => foldersToExpand.add(`project-${id}`))
      foldersToExpand.add(`project-${selectedProjectId}`)
    }

    // When filtering by favorites, unassigned, or languages, expand folders/projects that contain those snippets
    if (state.selectedItem === 'favorites' || state.selectedItem === 'unassigned' || state.selectedItem?.startsWith('language-')) {
      const relevantSnippets = snippets.filter(snippet => {
        if (state.selectedItem === 'favorites') {
          return snippet.favorite
        } else if (state.selectedItem === 'unassigned') {
          return !snippet.folderId && !snippet.projectId
        } else if (state.selectedItem?.startsWith('language-')) {
          const language = state.selectedItem.replace('language-', '').toLowerCase()
          return snippet.language?.toLowerCase() === language
        }
        return false
      })

      // Expand folders and projects that contain relevant snippets
      relevantSnippets.forEach(snippet => {
        if (snippet.folderId) {
          const parentIds = getAllParentIds(snippet.folderId, true)
          parentIds.forEach(id => foldersToExpand.add(`folder-${id}`))
          foldersToExpand.add(`folder-${snippet.folderId}`)
        }
        if (snippet.projectId) {
          const parentIds = getAllParentIds(snippet.projectId, false)
          parentIds.forEach(id => foldersToExpand.add(`project-${id}`))
          foldersToExpand.add(`project-${snippet.projectId}`)
        }
      })
    }

    // Update expanded folders if there are new ones to expand
    if (foldersToExpand.size > 0) {
      setState(prev => ({
        ...prev,
        expandedFolders: new Set([...prev.expandedFolders, ...foldersToExpand])
      }))
    }
  }, [state.selectedItem, selectedFolderId, selectedProjectId, snippets, folders, projectItems])

  return {
    ...state,
    toggleSection,
    toggleFolder,
    selectItem,
    isExpanded,
    isSelected
  }
}