import React, { useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useStore } from '../store/useStore'

const SearchBar: React.FC = () => {
  const searchQuery = useStore(state => state.searchQuery)
  const setSearchQuery = useStore(state => state.setSearchQuery)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleMenuSearch = () => {
      searchInputRef.current?.focus()
    }

    if (window.electronAPI) {
      window.electronAPI.onMenuSearch(handleMenuSearch)
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-search')
      }
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      searchInputRef.current?.blur()
    }
  }

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        onClick={() => {
          // TODO: Open new snippet modal
          console.log('New snippet')
        }}
      >
        <PlusIcon className="h-4 w-4" />
        <span className="hidden sm:inline">New Snippet</span>
      </button>
    </div>
  )
}

export default SearchBar