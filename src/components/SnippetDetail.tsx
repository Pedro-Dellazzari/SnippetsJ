import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { 
  ClipboardDocumentIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, CheckIcon } from '@heroicons/react/24/solid'
import Editor from '@monaco-editor/react'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getLanguageColor, getTagColor, getLightColor } from '../utils/colors'
import Tooltip from './Tooltip'

const SnippetDetail: React.FC = () => {
  const { 
    selectedSnippet, 
    toggleFavorite, 
    incrementUsageCount,
    updateSnippet,
    deleteSnippet
  } = useStore()
  
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    language: '',
    tags: '',
    content: ''
  })

  const handleCopy = async () => {
    if (!selectedSnippet) return
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.copyToClipboard(selectedSnippet.content)
      } else {
        await navigator.clipboard.writeText(selectedSnippet.content)
      }
      
      setCopied(true)
      incrementUsageCount(selectedSnippet.id)
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleEditToggle = () => {
    if (!selectedSnippet) return
    
    if (isEditing) {
      setIsEditing(false)
    } else {
      setEditForm({
        title: selectedSnippet.title,
        description: selectedSnippet.description,
        language: selectedSnippet.language,
        tags: selectedSnippet.tags.join(', '),
        content: selectedSnippet.content
      })
      setIsEditing(true)
    }
  }

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!editForm.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }
    
    if (!editForm.content.trim()) {
      newErrors.content = 'Código é obrigatório'
    }
    
    if (!editForm.language.trim()) {
      newErrors.language = 'Linguagem é obrigatória'
    }
    
    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveEdit = () => {
    if (!selectedSnippet) return
    
    if (!validateEditForm()) return
    
    const tagsArray = editForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    
    updateSnippet(selectedSnippet.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      language: editForm.language.trim().toLowerCase(),
      tags: tagsArray,
      content: editForm.content.trim(),
      category: editForm.language.trim()
    })
    
    setIsEditing(false)
    setEditErrors({})
  }

  const handleDelete = () => {
    if (!selectedSnippet) return
    deleteSnippet(selectedSnippet.id)
    setShowDeleteConfirm(false)
  }

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }))
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

  const getLanguageForEditor = (language: string) => {
    const languageMap: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'sql': 'sql',
      'bash': 'shell',
      'json': 'json',
      'yaml': 'yaml',
      'html': 'html',
      'css': 'css'
    }
    return languageMap[language.toLowerCase()] || 'plaintext'
  }

  if (!selectedSnippet) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-gray-400 dark:text-gray-500 mb-6">
            <ClipboardDocumentIcon className="h-20 w-20 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Selecione um snippet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Escolha um snippet da lista para visualizar seu conteúdo e detalhes aqui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <div className="w-full">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className={`text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 w-full bg-transparent border-b-2 focus:outline-none ${
                      editErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                    }`}
                    placeholder="Título do snippet"
                  />
                  {editErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.title}</p>
                  )}
                </div>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="text-gray-700 dark:text-gray-300 w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none resize-none"
                  placeholder="Descrição do snippet"
                  rows={2}
                />
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                  {selectedSnippet.title}
                </h1>
                {selectedSnippet.description && (
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedSnippet.description}
                  </p>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3 ml-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow font-medium"
                >
                  Salvar
                </button>
              </>
            ) : (
              <>
                <Tooltip content={selectedSnippet.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                  <button
                    onClick={() => toggleFavorite(selectedSnippet.id)}
                    className={clsx(
                      'p-3 rounded-xl transition-all duration-200 hover:scale-110',
                      selectedSnippet.favorite
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {selectedSnippet.favorite ? (
                      <HeartIconSolid className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>
                </Tooltip>
                
                <Tooltip content="Editar snippet">
                  <button
                    onClick={handleEditToggle}
                    className="p-3 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </Tooltip>
                
                <Tooltip content="Excluir snippet">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-3 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </Tooltip>
                
                <button
                  onClick={handleCopy}
                  className={clsx(
                    'flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 font-medium shadow-sm',
                    copied
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 scale-105'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:scale-105'
                  )}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tags and Language */}
        <div className="mb-4 space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linguagem
                </label>
                <input
                  type="text"
                  value={editForm.language}
                  onChange={(e) => handleFormChange('language', e.target.value)}
                  className={`px-3 py-1 border text-sm rounded-lg focus:outline-none ${
                    editErrors.language ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Ex: SQL, Python..."
                />
                {editErrors.language && (
                  <p className="text-red-500 text-sm mt-1">{editErrors.language}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => handleFormChange('tags', e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 text-sm rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ex: database, cleanup, performance"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {selectedSnippet.tags.map((tag, index) => {
                const tagColor = getTagColor(tag)
                return (
                  <span
                    key={index}
                    className="px-4 py-2 text-sm font-medium rounded-full border shadow-sm"
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
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center flex-wrap gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm"
              style={{ backgroundColor: getLanguageColor(selectedSnippet.language) }}
            />
            <span className="text-base font-medium text-gray-700 dark:text-gray-300 capitalize">
              {selectedSnippet.language}
            </span>
          </div>
          
          <Tooltip content={`Última atualização: ${formatDate(selectedSnippet.updatedAt)}`}>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="h-4 w-4" />
              <span className="text-sm">{formatDate(selectedSnippet.updatedAt)}</span>
            </div>
          </Tooltip>
          
          {selectedSnippet.usage_count > 0 && (
            <Tooltip content="Número de vezes copiado">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                <EyeIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedSnippet.usage_count}</span>
              </div>
            </Tooltip>
          )}
          
          {selectedSnippet.project && (
            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full">
              <span className="text-sm font-medium">{selectedSnippet.project}</span>
            </div>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 p-8">
        {editErrors.content && isEditing && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800">
            {editErrors.content}
          </p>
        )}
        <div className={`h-full rounded-xl overflow-hidden shadow-sm border-2 ${
          editErrors.content && isEditing 
            ? 'border-red-300 dark:border-red-700' 
            : 'border-gray-200 dark:border-gray-700'
        }`}>
          <Editor
            height="100%"
            language={getLanguageForEditor(isEditing ? editForm.language : selectedSnippet.language)}
            value={isEditing ? editForm.content : selectedSnippet.content}
            onChange={(value) => isEditing && handleFormChange('content', value || '')}
            theme="vs"
            options={{
              readOnly: !isEditing,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: false,
              glyphMargin: false,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              fontSize: 14,
              fontFamily: '"SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
              padding: { top: 16, bottom: 16 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              renderLineHighlight: 'none',
              selectionHighlight: false,
              occurrencesHighlight: false
            }}
            loading={
              <div className="flex items-center justify-center h-full text-gray-500">
                Carregando editor...
              </div>
            }
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Excluir snippet?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Tem certeza que deseja excluir <strong>"{selectedSnippet.title}"</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SnippetDetail