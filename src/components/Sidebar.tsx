import React from 'react'
import { useStore } from '../store/useStore'
import { FolderIcon, RectangleStackIcon, TagIcon } from '@heroicons/react/24/outline'
import { FolderIcon as FolderIconSolid, RectangleStackIcon as RectangleStackIconSolid, TagIcon as TagIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'

const Sidebar: React.FC = () => {
  const { sidebarTab, setSidebarTab, categories, projects, tags } = useStore()

  const tabs = [
    {
      id: 'categories' as const,
      name: 'Categories',
      icon: FolderIcon,
      iconSolid: FolderIconSolid,
      data: categories
    },
    {
      id: 'projects' as const,
      name: 'Projects',
      icon: RectangleStackIcon,
      iconSolid: RectangleStackIconSolid,
      data: projects
    },
    {
      id: 'tags' as const,
      name: 'Tags',
      icon: TagIcon,
      iconSolid: TagIconSolid,
      data: tags
    }
  ]

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = sidebarTab === tab.id ? tab.iconSolid : tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3 px-3 text-sm font-medium transition-colors',
                sidebarTab === tab.id
                  ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sidebarTab === 'categories' && (
          <>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors group"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {category.name}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {category.snippetCount}
                </div>
              </div>
            ))}
          </>
        )}

        {sidebarTab === 'projects' && (
          <>
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-3 rounded-lg hover:bg-white cursor-pointer transition-colors group"
              >
                <div className="font-medium text-gray-900 truncate mb-1">
                  {project.name}
                </div>
                <div className="text-xs text-gray-500 truncate mb-2">
                  {project.description}
                </div>
                <div className="text-xs text-gray-400">
                  {project.snippetCount} snippets
                </div>
              </div>
            ))}
          </>
        )}

        {sidebarTab === 'tags' && (
          <>
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors group"
              >
                <div
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </div>
                <div className="text-xs text-gray-500 ml-auto">
                  {tag.snippetCount}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Sidebar