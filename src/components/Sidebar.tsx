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
    <div className="w-72 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 p-2">
        {tabs.map((tab) => {
          const Icon = sidebarTab === tab.id ? tab.iconSolid : tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-3 py-3 px-4 text-sm font-medium transition-all duration-200 rounded-xl',
                sidebarTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 shadow-sm scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-semibold">{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {sidebarTab === 'categories' && (
          <>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 group hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <div
                  className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {category.name}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
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
                className="p-4 rounded-xl hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 group hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <div className="font-bold text-gray-900 dark:text-gray-100 truncate mb-2 text-lg">
                  {project.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-3 leading-relaxed">
                  {project.description}
                </div>
                <div className="text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full inline-flex">
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
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 group hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <div
                  className="px-3 py-2 rounded-full text-sm font-semibold shadow-sm"
                  style={{ 
                    backgroundColor: tag.color,
                    color: 'white'
                  }}
                >
                  #{tag.name}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full ml-auto">
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