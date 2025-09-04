import { useState, useCallback } from 'react'
import { ContextMenuPosition } from '../components/ContextMenu'

export interface UseContextMenuReturn {
  isOpen: boolean
  position: ContextMenuPosition
  targetSnippet: any | null
  openContextMenu: (event: React.MouseEvent, snippet: any) => void
  closeContextMenu: () => void
}

export function useContextMenu(): UseContextMenuReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 })
  const [targetSnippet, setTargetSnippet] = useState<any | null>(null)

  const openContextMenu = useCallback((event: React.MouseEvent, snippet: any) => {
    event.preventDefault()
    event.stopPropagation()

    setPosition({
      x: event.clientX,
      y: event.clientY
    })
    setTargetSnippet(snippet)
    setIsOpen(true)
  }, [])

  const closeContextMenu = useCallback(() => {
    setIsOpen(false)
    setTargetSnippet(null)
  }, [])

  return {
    isOpen,
    position,
    targetSnippet,
    openContextMenu,
    closeContextMenu
  }
}