import React from 'react'
import { useStore } from '../store/useStore'
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SnippetList: React.FC = () => {
  const { 
    snippets, 
    selectedSnippet, 
    setSelectedSnippet, 
    searchQuery, 
    searchResults,
    toggleFavorite 
  } = useStore()

  const displaySnippets = searchQuery ? searchResults.map(r => r.snippet) : snippets

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      sql: '#336791',
      python: '#3776ab',
      javascript: '#f7df1e',
      typescript: '#3178c6',
      bash: '#4eaa25',
      json: '#000000',
      yaml: '#cb171e'
    }
    return colors[language.toLowerCase()] || '#6b7280'
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR 
      })
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {searchQuery ? `Resultados (${displaySnippets.length})` : 'Snippets'}
          </h2>
          {!searchQuery && (
            <div className="text-sm text-gray-500">
              {snippets.length} total
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {displaySnippets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum snippet ainda'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displaySnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => setSelectedSnippet(snippet)}
                className={clsx(
                  'p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50',
                  selectedSnippet?.id === snippet.id && 'bg-blue-50 border-r-2 border-blue-500'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title and Favorite */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 truncate flex-1">
                        {snippet.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(snippet.id)
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {snippet.favorite ? (
                          <HeartIconSolid className="h-4 w-4 text-red-500" />
                        ) : (
                          <HeartIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {snippet.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {snippet.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {snippet.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{snippet.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getLanguageColor(snippet.language) }}
                        />
                        <span className="text-xs text-gray-500 capitalize">
                          {snippet.language}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{formatDate(snippet.updatedAt)}</span>
                        </div>
                        {snippet.usage_count > 0 && (
                          <span>{snippet.usage_count} usos</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SnippetList