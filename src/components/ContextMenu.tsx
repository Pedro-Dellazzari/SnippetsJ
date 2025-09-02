import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import {
  FolderIcon,
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export interface ContextMenuPosition {
  x: number
  y: number
}

export interface ContextMenuFolder {
  id: string
  name: string
  level?: number
}

export interface ContextMenuProps {
  isOpen: boolean
  position: ContextMenuPosition
  folders: ContextMenuFolder[]
  currentFolder?: string
  onClose: () => void
  onMoveToFolder: (folderId: string) => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  folders,
  currentFolder,
  onClose,
  onMoveToFolder
}) => {
  const [showSubmenu, setShowSubmenu] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)

  const menuItems = [
    { id: 'move', label: 'Mover para pasta...', icon: FolderIcon, hasSubmenu: true }
  ]

  useEffect(() => {
    if (!isOpen) {
      setShowSubmenu(false)
      setFocusedIndex(-1)
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        submenuRef.current && !submenuRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setFocusedIndex(prev => prev < menuItems.length - 1 ? prev + 1 : 0)
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setFocusedIndex(prev => prev > 0 ? prev - 1 : menuItems.length - 1)
      }

      if (event.key === 'ArrowRight' && focusedIndex === 0) {
        event.preventDefault()
        setShowSubmenu(true)
      }

      if (event.key === 'ArrowLeft' && showSubmenu) {
        event.preventDefault()
        setShowSubmenu(false)
      }

      if (event.key === 'Enter' && focusedIndex >= 0) {
        event.preventDefault()
        handleItemClick(menuItems[focusedIndex].id)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, showSubmenu])

  const handleItemClick = (itemId: string) => {
    if (itemId === 'move') {
      setShowSubmenu(!showSubmenu)
    }
  }

  const handleFolderSelect = (folderId: string) => {
    onMoveToFolder(folderId)
    onClose()
  }

  const getMenuPosition = () => {
    if (!isOpen) return {}

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const menuWidth = 220
    const menuHeight = 60

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

  const getSubmenuPosition = () => {
    if (!menuRef.current) return {}

    const menuRect = menuRef.current.getBoundingClientRect()
    const submenuWidth = 200
    const submenuHeight = folders.length * 40 + 16

    let x = menuRect.right + 8
    let y = menuRect.top

    // Adjust horizontal position if submenu would go off screen
    if (x + submenuWidth > window.innerWidth) {
      x = menuRect.left - submenuWidth - 8
    }

    // Adjust vertical position if submenu would go off screen
    if (y + submenuHeight > window.innerHeight) {
      y = window.innerHeight - submenuHeight - 10
    }

    return {
      left: `${x}px`,
      top: `${y}px`
    }
  }

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Main Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 min-w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2"
        style={getMenuPosition()}
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                focusedIndex === index && 'bg-gray-50 dark:bg-gray-700',
                'text-gray-700 dark:text-gray-300'
              )}
              onClick={() => item.id === 'move' ? setShowSubmenu(!showSubmenu) : handleItemClick(item.id)}
              onMouseEnter={() => {
                setFocusedIndex(index)
                if (item.id === 'move') {
                  setShowSubmenu(true)
                } else {
                  setShowSubmenu(false)
                }
              }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.hasSubmenu && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Submenu for Move to Folder */}
      {showSubmenu && (
        <div
          ref={submenuRef}
          className="fixed z-50 min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2"
          style={getSubmenuPosition()}
        >
          {folders.map((folder) => (
            <button
              key={folder.id}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              )}
              onClick={() => handleFolderSelect(folder.id)}
              style={{ paddingLeft: `${16 + (folder.level || 0) * 16}px` }}
            >
              <FolderIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="flex-1">{folder.name}</span>
              {currentFolder === folder.id && (
                <CheckIcon className="h-4 w-4 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </>,
    document.body
  )
}

export default ContextMenu