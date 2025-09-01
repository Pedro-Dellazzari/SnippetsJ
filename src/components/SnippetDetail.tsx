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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <ClipboardDocumentIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione um snippet
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Escolha um snippet da lista para visualizar seu conteúdo e detalhes aqui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <div className="w-full">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className={`text-xl font-semibold text-gray-900 mb-2 w-full bg-transparent border-b-2 focus:outline-none ${
                      editErrors.title ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
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
                  className="text-gray-600 w-full bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none resize-none"
                  placeholder="Descrição do snippet"
                  rows={2}
                />
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedSnippet.title}
                </h1>
                <p className="text-gray-600">
                  {selectedSnippet.description}
                </p>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleFavorite(selectedSnippet.id)}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    selectedSnippet.favorite
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
                  )}
                >
                  {selectedSnippet.favorite ? (
                    <HeartIconSolid className="h-5 w-5" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                </button>
                
                <button
                  onClick={handleEditToggle}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleCopy}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
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
            <div className="flex flex-wrap gap-2">
              {selectedSnippet.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: selectedSnippet.language === 'sql' ? '#336791' :
                                selectedSnippet.language === 'python' ? '#3776ab' :
                                selectedSnippet.language === 'bash' ? '#4eaa25' :
                                '#6b7280'
              }}
            />
            <span className="capitalize">{selectedSnippet.language}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>Atualizado {formatDate(selectedSnippet.updatedAt)}</span>
          </div>
          
          {selectedSnippet.usage_count > 0 && (
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              <span>{selectedSnippet.usage_count} usos</span>
            </div>
          )}
          
          {selectedSnippet.project && (
            <div className="flex items-center gap-1">
              <span>Projeto: {selectedSnippet.project}</span>
            </div>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 p-6">
        {editErrors.content && isEditing && (
          <p className="text-red-500 text-sm mb-2">{editErrors.content}</p>
        )}
        <div className={`h-full border rounded-lg overflow-hidden ${
          editErrors.content && isEditing ? 'border-red-500' : 'border-gray-200'
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Excluir snippet?
            </h3>
            <p className="text-gray-500 mb-6">
              Tem certeza que deseja excluir este snippet? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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