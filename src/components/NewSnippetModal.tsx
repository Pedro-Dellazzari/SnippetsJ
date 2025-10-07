import React, { useState, useEffect, useRef, useCallback } from 'react'
import { XMarkIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { useStore } from '../store/useStore'
import { Snippet } from '../types'
import Editor from '@monaco-editor/react'
import LanguageAutocomplete from './LanguageAutocomplete'
import Toast from './Toast'
import { useToast } from '../hooks/useToast'
import { getTagColor, getLightColor } from '../utils/colors'
import clsx from 'clsx'

interface NewSnippetModalProps {
  isOpen: boolean
  onClose: () => void
  editSnippet?: Snippet | null
}

const NewSnippetModal: React.FC<NewSnippetModalProps> = ({ isOpen, onClose, editSnippet }) => {
  const addSnippet = useStore(state => state.addSnippet)
  const updateSnippet = useStore(state => state.updateSnippet)
  const folders = useStore(state => state.folders)
  const projectItems = useStore(state => state.projectItems)
  const { toast, success, error, hideToast } = useToast()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    tags: '',
    content: '',
    folderId: '',
    projectId: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [parsedTags, setParsedTags] = useState<string[]>([])
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Parse tags when tags field changes
  useEffect(() => {
    if (formData.tags) {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      setParsedTags(tags)
    } else {
      setParsedTags([])
    }
  }, [formData.tags])

  // Reset form when modal opens or populate for editing
  useEffect(() => {
    if (isOpen) {
      if (editSnippet) {
        // Populate form with existing snippet data
        setFormData({
          title: editSnippet.title,
          description: editSnippet.description,
          language: editSnippet.language,
          tags: editSnippet.tags.join(', '),
          content: editSnippet.content,
          folderId: editSnippet.folderId || '',
          projectId: editSnippet.projectId || ''
        })
      } else {
        // Reset for new snippet
        setFormData({
          title: '',
          description: '',
          language: '',
          tags: '',
          content: '',
          folderId: '',
          projectId: ''
        })
      }
      setErrors({})
      setIsSubmitting(false)
      // Focus title input after animation
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 300)
    }
  }, [isOpen, editSnippet])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, formData])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Código é obrigatório'
    }
    
    if (!formData.language.trim()) {
      newErrors.language = 'Linguagem é obrigatória'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (isSubmitting) return
    
    if (!validateForm()) {
      error('Por favor, preencha todos os campos obrigatórios')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Clean and process tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      
      if (editSnippet) {
        // Update existing snippet
        updateSnippet(editSnippet.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          language: formData.language.trim().toLowerCase(),
          tags: tagsArray,
          category: formData.language.trim(),
          folderId: formData.folderId || undefined,
          projectId: formData.projectId || undefined
        })
        success('Snippet atualizado com sucesso!')
      } else {
        // Create new snippet
        const newSnippet: Snippet = {
          id: `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: formData.title.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          language: formData.language.trim().toLowerCase(),
          tags: tagsArray,
          category: formData.language.trim(),
          folderId: formData.folderId || undefined,
          projectId: formData.projectId || undefined,
          favorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usage_count: 0
        }
        
        addSnippet(newSnippet)
        
        // Show success message
        success('Snippet criado com sucesso!')
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose()
      }, 500)
      
    } catch (err) {
      error('Erro ao criar snippet. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isSubmitting, validateForm, addSnippet, updateSnippet, editSnippet, success, error, onClose])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose()
  }, [isSubmitting, onClose])

  // Build hierarchical options for folder/project selection
  const getFolderOptions = () => {
    const options: { id: string; name: string; level: number }[] = [
      { id: '', name: 'Nenhuma pasta', level: 0 }
    ]

    const buildHierarchy = (parentId: string | undefined, level: number) => {
      const children = folders.filter(folder => folder.parentId === parentId)
      children.forEach(folder => {
        options.push({
          id: folder.id,
          name: folder.name,
          level
        })
        buildHierarchy(folder.id, level + 1)
      })
    }

    buildHierarchy(undefined, 0)
    return options
  }

  const getProjectOptions = () => {
    const options: { id: string; name: string; level: number }[] = [
      { id: '', name: 'Nenhum projeto', level: 0 }
    ]

    const buildHierarchy = (parentId: string | undefined, level: number) => {
      const children = projectItems.filter(project => project.parentId === parentId)
      children.forEach(project => {
        options.push({
          id: project.id,
          name: project.name,
          level
        })
        buildHierarchy(project.id, level + 1)
      })
    }

    buildHierarchy(undefined, 0)
    return options
  }

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const getMonacoLanguage = useCallback((language: string) => {
    const languageMap: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'c#': 'csharp',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rust': 'rust',
      'php': 'php',
      'ruby': 'ruby',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'scala': 'scala',
      'sql': 'sql',
      'bash': 'shell',
      'shell': 'shell',
      'powershell': 'powershell',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'markdown': 'markdown',
      'dockerfile': 'dockerfile'
    }
    return languageMap[language.toLowerCase()] || 'plaintext'
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div 
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {editSnippet ? '✏️ Editar Snippet' : '✨ Novo Snippet'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {editSnippet ? 'Modifique seu snippet conforme necessário' : 'Crie e organize seu código com facilidade'}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-3 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(95vh-120px)]">
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  📝 Título *
                </label>
                <input
                  ref={titleInputRef}
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={clsx(
                    'w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 text-lg font-medium',
                    errors.title ? 'border-red-500 ring-red-200' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  placeholder="Ex: Remove Duplicates SQL, API Rate Limiter..."
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                    <span>⚠️</span>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Language and Tags Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    🎯 Linguagem *
                  </label>
                  <LanguageAutocomplete
                    value={formData.language}
                    onChange={(value) => handleInputChange('language', value)}
                    error={errors.language}
                    placeholder="JavaScript, Python, SQL..."
                  />
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    🏷️ Tags
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                    placeholder="database, cleanup, performance..."
                    disabled={isSubmitting}
                  />
                  {/* Tag Preview */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {parsedTags.map((tag, index) => {
                        const tagColor = getTagColor(tag)
                        return (
                          <span
                            key={index}
                            className="px-3 py-1 text-xs font-medium rounded-full border shadow-sm"
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
              </div>

              {/* Folder and Project Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="folderId" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    📁 Pasta
                  </label>
                  <select
                    id="folderId"
                    value={formData.folderId}
                    onChange={(e) => handleInputChange('folderId', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                    disabled={isSubmitting}
                  >
                    {getFolderOptions().map(option => (
                      <option key={option.id} value={option.id}>
                        {'  '.repeat(option.level)}
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="projectId" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    🚀 Projeto
                  </label>
                  <select
                    id="projectId"
                    value={formData.projectId}
                    onChange={(e) => handleInputChange('projectId', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                    disabled={isSubmitting}
                  >
                    {getProjectOptions().map(option => (
                      <option key={option.id} value={option.id}>
                        {'  '.repeat(option.level)}
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  📄 Descrição (opcional)
                </label>
                <textarea
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-none"
                  placeholder="Breve descrição do que este snippet faz e quando usar..."
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Code Editor */}
              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  💻 Código *
                </label>
                <div 
                  className={clsx(
                    'border-2 rounded-xl overflow-hidden transition-all duration-200 shadow-sm',
                    errors.content 
                      ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  style={{ height: '300px' }}
                >
                  <Editor
                    height="100%"
                    language={getMonacoLanguage(formData.language)}
                    value={formData.content}
                    onChange={(value) => handleInputChange('content', value || '')}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      folding: true,
                      glyphMargin: false,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      fontSize: 14,
                      fontFamily: '"Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
                      padding: { top: 16, bottom: 16 },
                      smoothScrolling: true,
                      cursorBlinking: 'smooth',
                      renderLineHighlight: 'none',
                      tabSize: 2,
                      insertSpaces: true,
                      automaticLayout: true,
                      contextmenu: true,
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: isSubmitting,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                      quickSuggestions: {
                        other: true,
                        comments: true,
                        strings: true
                      }
                    }}
                    loading={
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p>Carregando editor...</p>
                        </div>
                      </div>
                    }
                  />
                </div>
                {errors.content && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                    <span>⚠️</span>
                    {errors.content}
                  </p>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">💡 Dica: Use </span>
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Ctrl + Enter</kbd>
                <span className="hidden sm:inline"> para salvar</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={clsx(
                    'flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-lg disabled:cursor-not-allowed',
                    isSubmitting
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editSnippet ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      {editSnippet ? 'Salvar Alterações' : 'Criar Snippet'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  )
}

export default NewSnippetModal