import React, { useState, useEffect } from 'react'
import { useSidebarState } from '../hooks/useSidebarState'
import { useDynamicSidebar } from '../hooks/useDynamicSidebar'
import { useStore } from '../store/useStore'
import SidebarSection from './SidebarSection'
import FolderProjectModal from './FolderProjectModal'
import DeleteConfirmationModal from './DeleteConfirmationModal'

const Sidebar: React.FC = () => {
  const {
    expandedFolders,
    selectedItem,
    toggleSection,
    toggleFolder,
    selectItem,
    isExpanded
  } = useSidebarState()
  
  const sidebarData = useDynamicSidebar()
  const getSnippetCounts = useStore(state => state.getSnippetCounts)
  const folders = useStore(state => state.folders)
  const projectItems = useStore(state => state.projectItems)
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'folder' | 'project' | null
    editItem?: any
    parentId?: string
  }>({
    isOpen: false,
    type: null
  })

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean
    type: 'folder' | 'project' | null
    itemId: string
    itemName: string
    snippetCount: number
  }>({
    isOpen: false,
    type: null,
    itemId: '',
    itemName: '',
    snippetCount: 0
  })

  useEffect(() => {
    const handleOpenFolderModal = (event?: CustomEvent) => {
      const parentId = event?.detail?.parentId
      setModalState({ isOpen: true, type: 'folder', parentId })
    }

    const handleOpenProjectModal = (event?: CustomEvent) => {
      const parentId = event?.detail?.parentId
      setModalState({ isOpen: true, type: 'project', parentId })
    }

    const handleDeleteFolder = (event: CustomEvent) => {
      const { folderId } = event.detail
      const folder = folders.find(f => f.id === folderId)
      const counts = getSnippetCounts()
      const snippetCount = counts.folderCounts[folderId] || 0
      
      if (folder && snippetCount > 0) {
        setDeleteModalState({
          isOpen: true,
          type: 'folder',
          itemId: folderId,
          itemName: folder.name,
          snippetCount
        })
      }
    }

    const handleDeleteProject = (event: CustomEvent) => {
      const { projectId } = event.detail
      const project = projectItems.find(p => p.id === projectId)
      const counts = getSnippetCounts()
      const snippetCount = counts.projectItemCounts[projectId] || 0
      
      if (project && snippetCount > 0) {
        setDeleteModalState({
          isOpen: true,
          type: 'project',
          itemId: projectId,
          itemName: project.name,
          snippetCount
        })
      }
    }

    window.addEventListener('openFolderModal', handleOpenFolderModal as EventListener)
    window.addEventListener('openProjectModal', handleOpenProjectModal as EventListener)
    window.addEventListener('deleteFolderWithSnippets', handleDeleteFolder as EventListener)
    window.addEventListener('deleteProjectWithSnippets', handleDeleteProject as EventListener)

    return () => {
      window.removeEventListener('openFolderModal', handleOpenFolderModal as EventListener)
      window.removeEventListener('openProjectModal', handleOpenProjectModal as EventListener)
      window.removeEventListener('deleteFolderWithSnippets', handleDeleteFolder as EventListener)
      window.removeEventListener('deleteProjectWithSnippets', handleDeleteProject as EventListener)
    }
  }, [folders, projectItems, getSnippetCounts])

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, parentId: undefined })
  }

  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      type: null,
      itemId: '',
      itemName: '',
      snippetCount: 0
    })
  }

  return (
    <div className="w-80 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200/60 dark:border-gray-700/60 flex flex-col">

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto px-2 py-6">
        <div className="space-y-2">
          {sidebarData.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              isExpanded={isExpanded(section.id)}
              selectedItem={selectedItem}
              expandedFolders={expandedFolders}
              onToggleSection={toggleSection}
              onSelectItem={selectItem}
              onToggleFolder={toggleFolder}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
          <span>{getSnippetCounts().totalSnippets} snippets</span>
        </div>
      </div>

      {/* Folder/Project Modal */}
      <FolderProjectModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type || 'folder'}
        editItem={modalState.editItem}
        parentId={modalState.parentId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        type={deleteModalState.type || 'folder'}
        itemId={deleteModalState.itemId}
        itemName={deleteModalState.itemName}
        snippetCount={deleteModalState.snippetCount}
      />
    </div>
  )
}

export default Sidebar