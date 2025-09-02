import React, { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import {
  FolderPlusIcon,
  RocketLaunchIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export interface FolderProjectContextMenuPosition {
  x: number
  y: number
}

export interface FolderProjectContextMenuProps {
  isOpen: boolean
  position: FolderProjectContextMenuPosition
  itemType: 'folder' | 'project'
  itemId: string
  itemName: string
  onClose: () => void
  onCreateSubfolder: (parentId: string) => void
  onCreateSubproject: (parentId: string) => void
  onRename: (itemId: string) => void
  onDelete: (itemId: string) => void
}

const FolderProjectContextMenu: React.FC<FolderProjectContextMenuProps> = ({
  isOpen,
  position,
  itemType,
  itemId,
  itemName,
  onClose,
  onCreateSubfolder,
  onCreateSubproject,
  onRename,
  onDelete
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  const menuItems = [
    { 
      id: 'add-subfolder', 
      label: '➕ Nova subpasta...', 
      icon: FolderPlusIcon,
      action: () => onCreateSubfolder(itemId)
    },
    { 
      id: 'add-subproject', 
      label: '➕ Novo subprojeto...', 
      icon: RocketLaunchIcon,
      action: () => onCreateSubproject(itemId)
    },
    { 
      id: 'rename', 
      label: '✏️ Renomear', 
      icon: PencilIcon,
      action: () => onRename(itemId)
    },
    { 
      id: 'delete', 
      label: '🗑️ Excluir', 
      icon: TrashIcon,
      action: () => onDelete(itemId),
      isDangerous: true
    }
  ]

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const getMenuPosition = () => {
    if (!isOpen) return {}

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const menuWidth = 220
    const menuHeight = menuItems.length * 44 + 16

    let x = position.x
    let y = position.y

    // Adjust horizontal position if menu would go off screen
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10
    }

    // Adjust vertical position if menu would go off screen
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10
    }

    return {
      left: `${x}px`,
      top: `${y}px`
    }
  }

  const handleItemClick = (item: typeof menuItems[0]) => {
    item.action()
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2"
      style={getMenuPosition()}
    >
      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
        {itemType === 'folder' ? 'Pasta' : 'Projeto'}: {itemName}
      </div>
      
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
              item.isDangerous
                ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            )}
            onClick={() => handleItemClick(item)}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
          </button>
        )
      })}
    </div>,
    document.body
  )
}

export default FolderProjectContextMenu