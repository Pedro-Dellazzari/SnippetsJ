import React from 'react'
import { useSidebarState } from '../hooks/useSidebarState'
import { useDynamicSidebar } from '../hooks/useDynamicSidebar'
import { useStore } from '../store/useStore'
import SidebarSection from './SidebarSection'

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

  return (
    <div className="w-80 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200/60 dark:border-gray-700/60 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">📝</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              Snippets
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Code Library
            </p>
          </div>
        </div>
      </div>

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
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{getSnippetCounts().totalSnippets} snippets total</span>
          <span>{((JSON.stringify(sidebarData).length / 1024 / 1024) * 10).toFixed(1)} MB</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar