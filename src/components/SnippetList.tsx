import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getLanguageColor, getTagColor, getLightColor } from '../utils/colors'
import Tooltip from './Tooltip'
import ContextMenu, { ContextMenuFolder } from './ContextMenu'
import { useContextMenu } from '../hooks/useContextMenu'
import NewSnippetModal from './NewSnippetModal'
import EmptyState from './EmptyState'

const SnippetList: React.FC = () => {
  const { 
    snippets, 
    selectedSnippet, 
    setSelectedSnippet, 
    searchQuery, 
    searchResults,
    toggleFavorite,
    updateSnippet,
    duplicateSnippet,
    deleteSnippet,
    categories
  } = useStore()

  const { isOpen, position, targetSnippet, openContextMenu, closeContextMenu } = useContextMenu()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<any>(null)

  const displaySnippets = searchQuery ? searchResults.map(r => r.snippet) : snippets

  // Mock folders data for the context menu - in a real app, this would come from the store
  const folders: ContextMenuFolder[] = [
    { id: 'uncategorized', name: 'Sem categoria', level: 0 },
    ...categories.map(cat => ({ id: cat.name, name: cat.name, level: 0 }))
  ]

  const handleMoveToFolder = (folderId: string) => {
    if (targetSnippet) {
      const folderName = folderId === 'uncategorized' ? '' : folderId
      updateSnippet(targetSnippet.id, { category: folderName })
    }
  }

  const handleEditSnippet = () => {
    if (targetSnippet) {
      setEditingSnippet(targetSnippet)
      setShowEditModal(true)
    }
  }

  const handleDuplicateSnippet = () => {
    if (targetSnippet) {
      const duplicated = duplicateSnippet(targetSnippet.id)
      if (duplicated) {
        setEditingSnippet(duplicated)
        setShowEditModal(true)
      }
    }
  }

  const handleDeleteSnippet = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (targetSnippet) {
      deleteSnippet(targetSnippet.id)
      closeContextMenu()
      setShowDeleteModal(false)
    }
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
          searchQuery ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Nenhum resultado encontrado
            </div>
          ) : snippets.length === 0 ? (
            <EmptyState onCreateNew={() => setShowNewModal(true)} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Nenhum snippet na categoria selecionada
            </div>
          )
        ) : (
          <div className="space-y-1 p-2">
            {displaySnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => setSelectedSnippet(snippet)}
                onContextMenu={(e) => openContextMenu(e, snippet)}
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

      {/* Context Menu */}
      <ContextMenu
        isOpen={isOpen}
        position={position}
        snippet={targetSnippet}
        folders={folders}
        currentFolder={targetSnippet?.category || 'uncategorized'}
        onClose={closeContextMenu}
        onMoveToFolder={handleMoveToFolder}
        onEdit={handleEditSnippet}
        onDuplicate={handleDuplicateSnippet}
        onDelete={handleDeleteSnippet}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Excluir snippet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir "{targetSnippet?.title}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <NewSnippetModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingSnippet(null)
        }}
        editSnippet={editingSnippet}
      />

      {/* New Snippet Modal */}
      <NewSnippetModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
      />
    </div>
  )
}

export default SnippetList