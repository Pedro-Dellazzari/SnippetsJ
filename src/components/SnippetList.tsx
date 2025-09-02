import React, { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getLanguageColor, getTagColor } from '../utils/colors'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import Tooltip from './Tooltip'
import ContextMenu, { ContextMenuFolder, ContextMenuProject } from './ContextMenu'
import { useContextMenu } from '../hooks/useContextMenu'
import { useFocusMode } from '../contexts/FocusModeContext'
import NewSnippetModal from './NewSnippetModal'
import EmptyState from './EmptyState'

type SortOption = 'newest' | 'oldest' | 'favorites' | 'language' | 'mostUsed'

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
    selectedFolderId,
    selectedProjectId,
    selectedItem,
    folders,
    projectItems,
    getDescendantFolders,
    getDescendantProjects
  } = useStore()

  const { isOpen, position, targetSnippet, openContextMenu, closeContextMenu } = useContextMenu()
  const { toggleFocusMode } = useFocusMode()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<any>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  // Função para filtrar e ordenar snippets
  const sortedSnippets = useMemo(() => {
    let baseSnippets = searchQuery ? searchResults.map(r => r.snippet) : snippets
    
    // Apply filters based on selectedItem first (special sections take priority)
    if (selectedItem === 'all-snippets') {
      // Show all snippets - no filtering needed
      // baseSnippets already contains all snippets
    } else if (selectedItem === 'favorites') {
      // Filter favorites
      baseSnippets = baseSnippets.filter(snippet => snippet.favorite)
    } else if (selectedItem === 'unassigned') {
      // Filter unassigned snippets (no folder and no project)
      baseSnippets = baseSnippets.filter(snippet => 
        !snippet.folderId && !snippet.projectId
      )
    } else if (selectedItem?.startsWith('language-')) {
      // Filter by language
      const language = selectedItem.replace('language-', '').toLowerCase()
      baseSnippets = baseSnippets.filter(snippet => 
        snippet.language?.toLowerCase() === language
      )
    } else if (selectedFolderId) {
      // Filter by specific folder (only direct snippets)
      baseSnippets = baseSnippets.filter(snippet => snippet.folderId === selectedFolderId)
    } else if (selectedProjectId) {
      // Filter by specific project (only direct snippets)
      baseSnippets = baseSnippets.filter(snippet => snippet.projectId === selectedProjectId)
    }
    
    return [...baseSnippets].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case 'favorites':
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'language':
          return a.language.localeCompare(b.language)
        case 'mostUsed':
          return b.usage_count - a.usage_count
        default:
          return 0
      }
    })
  }, [snippets, searchResults, searchQuery, sortBy, selectedFolderId, selectedProjectId, selectedItem])

  const displaySnippets = sortedSnippets

  // Get current context name
  const getCurrentContextName = () => {
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId)
      return folder ? `📁 ${folder.name}` : 'Pasta'
    }
    if (selectedProjectId) {
      const project = projectItems.find(p => p.id === selectedProjectId)
      return project ? `🚀 ${project.name}` : 'Projeto'
    }
    if (selectedItem === 'favorites') {
      return '❤️ Favoritos'
    }
    if (selectedItem === 'all-snippets') {
      return '📄 Todos os Snippets'
    }
    if (selectedItem === 'unassigned') {
      return '🕳️ Sem marcação'
    }
    if (selectedItem?.startsWith('language-')) {
      const language = selectedItem.replace('language-', '')
      const capitalizedLanguage = language.charAt(0).toUpperCase() + language.slice(1)
      return `💻 ${capitalizedLanguage}`
    }
    if (searchQuery) {
      return `Resultados (${displaySnippets.length})`
    }
    return 'Snippets'
  }

  // Separate folders and projects for the context menu
  const contextMenuFolders: ContextMenuFolder[] = folders.map(folder => ({ 
    id: folder.id, 
    name: folder.name, 
    level: 0 
  }))

  const contextMenuProjects: ContextMenuProject[] = projectItems.map(project => ({ 
    id: project.id, 
    name: project.name, 
    level: 0 
  }))

  const handleMoveToFolder = (folderId: string) => {
    if (!targetSnippet) return

    if (folderId === '') {
      // Remove from any folder (keep project if it exists)
      updateSnippet(targetSnippet.id, { 
        folderId: undefined 
      })
    } else {
      // Move to folder (and clear project due to exclusivity)
      updateSnippet(targetSnippet.id, { 
        folderId: folderId, 
        projectId: undefined 
      })
    }
  }

  const handleMoveToProject = (projectId: string) => {
    if (!targetSnippet) return

    if (projectId === '') {
      // Remove from any project (keep folder if it exists)
      updateSnippet(targetSnippet.id, { 
        projectId: undefined 
      })
    } else {
      // Move to project (and clear folder due to exclusivity)
      updateSnippet(targetSnippet.id, { 
        folderId: undefined, 
        projectId: projectId 
      })
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {getCurrentContextName()}
          </h2>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            {displaySnippets.length}
          </div>
        </div>
        
        {/* Sort dropdown */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
              </svg>
              <span>
                {sortBy === 'newest' && 'Mais recentes'}
                {sortBy === 'oldest' && 'Mais antigos'}
                {sortBy === 'favorites' && 'Favoritos'}
                {sortBy === 'language' && 'Por linguagem'}
                {sortBy === 'mostUsed' && 'Mais usados'}
              </span>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                {[
                  { value: 'newest', label: 'Mais recentes' },
                  { value: 'oldest', label: 'Mais antigos' },
                  { value: 'favorites', label: 'Favoritos' },
                  { value: 'language', label: 'Por linguagem' },
                  { value: 'mostUsed', label: 'Mais usados' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as SortOption)
                      setShowSortDropdown(false)
                    }}
                    className={clsx(
                      'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                      sortBy === option.value 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Focus Mode toggle */}
          <Tooltip content="Modo Foco (ocultar sidebar)">
            <button 
              onClick={toggleFocusMode}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </button>
          </Tooltip>
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
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {displaySnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => setSelectedSnippet(snippet)}
                onContextMenu={(e) => openContextMenu(e, snippet)}
                className={clsx(
                  'px-4 py-2.5 cursor-pointer transition-all duration-200 group relative',
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  selectedSnippet?.id === snippet.id 
                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-500' 
                    : ''
                )}
              >
                {/* Título */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate pr-2">
                    {snippet.title}
                  </h3>
                  
                  {/* Actions - só aparecem no hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Tooltip content="Editar snippet">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingSnippet(snippet)
                          setShowEditModal(true)
                        }}
                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-150 text-gray-400 hover:text-blue-600"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    </Tooltip>
                    
                    <Tooltip content={snippet.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(snippet.id)
                        }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors duration-150 text-gray-400 hover:text-red-500"
                      >
                        {snippet.favorite ? (
                          <HeartIconSolid className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </Tooltip>
                    
                    <Tooltip content="Mover para pasta">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openContextMenu(e, snippet)
                        }}
                        className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors duration-150 text-gray-400 hover:text-green-600"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                      </button>
                    </Tooltip>
                    
                    <Tooltip content="Excluir snippet">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openContextMenu(e, snippet)
                        }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors duration-150 text-gray-400 hover:text-red-600"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Descrição */}
                {snippet.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    {snippet.description}
                  </p>
                )}

                {/* Tags - máximo 2 visíveis com cores sutis */}
                {snippet.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {snippet.tags.slice(0, 2).map((tag, tagIndex) => {
                      const tagColor = getTagColor(tag)
                      return (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: `${tagColor}15`,
                            color: tagColor,
                            border: `1px solid ${tagColor}30`
                          }}
                        >
                          {tag}
                        </span>
                      )
                    })}
                    {snippet.tags.length > 2 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        +{snippet.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Metadados */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {/* Linguagem */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getLanguageColor(snippet.language) }}
                      />
                      <span className="capitalize font-medium text-gray-600 dark:text-gray-400">{snippet.language}</span>
                    </div>
                    
                    {/* Projeto/Pasta */}
                    {snippet.projectId && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.58-5.84a14.98 14.98 0 012.58 5.84M15.59 14.37L9.63 8.41m5.96 5.96L9.63 8.41" />
                          </svg>
                          <span className="text-gray-500 dark:text-gray-500 truncate max-w-20">Projeto</span>
                        </div>
                      </>
                    )}
                    
                    {/* Categoria */}
                    {snippet.category && snippet.category !== snippet.language && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-gray-500 dark:text-gray-500 truncate max-w-16">{snippet.category}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Data e contadores */}
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    {snippet.usage_count > 0 && (
                      <>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                          <span className="font-medium">{snippet.usage_count}</span>
                        </div>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                      </>
                    )}
                    
                    {snippet.favorite && (
                      <>
                        <HeartIconSolid className="h-3 w-3 text-red-500" />
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                      </>
                    )}
                    
                    <span>{formatDate(snippet.updatedAt)}</span>
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
        folders={contextMenuFolders}
        projects={contextMenuProjects}
        currentFolder={targetSnippet?.folderId}
        currentProject={targetSnippet?.projectId}
        onClose={closeContextMenu}
        onMoveToFolder={handleMoveToFolder}
        onMoveToProject={handleMoveToProject}
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