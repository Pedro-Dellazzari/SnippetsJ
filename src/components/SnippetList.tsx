import React from 'react'
import { useStore } from '../store/useStore'
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getLanguageColor, getTagColor, getLightColor } from '../utils/colors'
import Tooltip from './Tooltip'

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
    <div className="w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {searchQuery ? `Resultados (${displaySnippets.length})` : 'Snippets'}
          </h2>
          {!searchQuery && (
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {snippets.length}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {displaySnippets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum snippet ainda'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {displaySnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => setSelectedSnippet(snippet)}
                className={clsx(
                  'p-5 cursor-pointer transition-all duration-200 rounded-xl border border-transparent',
                  'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700',
                  selectedSnippet?.id === snippet.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 shadow-sm' 
                    : 'hover:scale-[1.01]'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title and Favorite */}
                    <div className="flex items-start gap-3 mb-3">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight flex-1">
                        {snippet.title}
                      </h3>
                      <Tooltip content={snippet.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(snippet.id)
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          {snippet.favorite ? (
                            <HeartIconSolid className="h-4 w-4 text-red-500" />
                          ) : (
                            <HeartIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-red-500" />
                          )}
                        </button>
                      </Tooltip>
                    </div>

                    {/* Description */}
                    {snippet.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                        {snippet.description}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {snippet.tags.slice(0, 3).map((tag, index) => {
                        const tagColor = getTagColor(tag)
                        return (
                          <span
                            key={index}
                            className="px-3 py-1 text-xs font-medium rounded-full border"
                            style={{
                              backgroundColor: getLightColor(tagColor, 0.1),
                              borderColor: getLightColor(tagColor, 0.3),
                              color: tagColor
                            }}
                          >
                            {tag}
                          </span>
                        )
                      })}
                      {snippet.tags.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-600">
                          +{snippet.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm"
                          style={{ backgroundColor: getLanguageColor(snippet.language) }}
                        />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                          {snippet.language}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <Tooltip content={`Atualizado ${formatDate(snippet.updatedAt)}`}>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{formatDate(snippet.updatedAt)}</span>
                          </div>
                        </Tooltip>
                        {snippet.usage_count > 0 && (
                          <Tooltip content="Número de vezes que foi copiado">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                              {snippet.usage_count}
                            </span>
                          </Tooltip>
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