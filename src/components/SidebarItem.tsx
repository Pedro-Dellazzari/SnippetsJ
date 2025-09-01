import React from 'react'
import { SidebarItem as SidebarItemType } from '../types/sidebar'
import SidebarIcon from './SidebarIcon'
import clsx from 'clsx'

interface SidebarItemProps {
  item: SidebarItemType
  level: number
  selectedItem: string | null
  expandedFolders: Set<string>
  onSelect: (itemId: string) => void
  onToggle: (itemId: string) => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  level,
  selectedItem,
  expandedFolders,
  onSelect,
  onToggle
}) => {
  const hasChildren = item.children && item.children.length > 0
  const paddingLeft = 16 + (level * 20)

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.id)
    } else {
      onSelect(item.id)
    }
  }

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle(item.id)
  }

  const isSelected = selectedItem === item.id
  const isExpanded = expandedFolders.has(item.id)

  const getItemStyles = () => {
    if (isSelected) {
      return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-l-blue-500 shadow-sm'
    }
    
    if (item.isSpecial) {
      return 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-600 dark:hover:text-gray-300'
    }

    return 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-gray-100'
  }

  const getCountBadge = () => {
    if (!item.count && item.count !== 0) return null

    return (
      <span className={clsx(
        'text-xs font-medium px-2 py-0.5 rounded-full ml-auto transition-colors duration-200',
        isSelected 
          ? 'bg-blue-100 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300'
          : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-400'
      )}>
        {item.count}
      </span>
    )
  }

  const getTagColor = () => {
    if (item.type !== 'tag' || !item.color) return {}
    
    return {
      '--tag-color': item.color,
      backgroundColor: `${item.color}15`,
      borderLeft: `3px solid ${item.color}`
    } as React.CSSProperties
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={clsx(
          'flex items-center gap-3 py-2 pr-3 cursor-pointer transition-all duration-200 group relative rounded-md mx-1',
          getItemStyles(),
          hasChildren && 'pr-10'
        )}
        style={{ 
          paddingLeft: `${paddingLeft}px`,
          ...item.type === 'tag' ? getTagColor() : undefined
        }}
      >
        {/* Expand/Collapse Button for folders */}
        {hasChildren && (
          <button
            onClick={handleToggleClick}
            className={clsx(
              'absolute right-2 p-1.5 rounded-md hover:bg-gray-200/70 dark:hover:bg-gray-600/40 transition-all duration-200',
              'flex items-center justify-center opacity-0 group-hover:opacity-100',
              isExpanded && 'opacity-100'
            )}
          >
            <SidebarIcon 
              name="chevron" 
              isExpanded={isExpanded}
              className="h-3 w-3 text-gray-400 dark:text-gray-500 transition-transform duration-200"
            />
          </button>
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          {item.type === 'tag' && item.color ? (
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: item.color }}
              />
              <SidebarIcon 
                name={item.icon} 
                className="h-4 w-4"
                isExpanded={hasChildren ? isExpanded : undefined}
              />
            </div>
          ) : (
            <SidebarIcon 
              name={item.icon} 
              className={clsx(
                'h-4 w-4',
                item.isSpecial 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-500 dark:text-gray-400'
              )}
              isExpanded={hasChildren ? isExpanded : undefined}
            />
          )}
        </div>

        {/* Label */}
        <span className={clsx(
          'flex-1 text-sm font-medium truncate',
          isSelected && 'font-semibold'
        )}>
          {item.label}
        </span>

        {/* Count Badge */}
        {getCountBadge()}
      </div>

      {/* Children */}
      {hasChildren && (
        <div 
          className={clsx(
            'transition-all duration-300 ease-in-out overflow-hidden border-l border-gray-200/40 dark:border-gray-600/40',
            isExpanded ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'
          )}
          style={{ marginLeft: `${paddingLeft + 8}px` }}
        >
          {item.children!.map(child => (
            <SidebarItem
              key={child.id}
              item={child}
              level={level + 1}
              selectedItem={selectedItem}
              expandedFolders={expandedFolders}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SidebarItem