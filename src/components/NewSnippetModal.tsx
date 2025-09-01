import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useStore } from '../store/useStore'
import { Snippet } from '../types'

interface NewSnippetModalProps {
  isOpen: boolean
  onClose: () => void
}

const NewSnippetModal: React.FC<NewSnippetModalProps> = ({ isOpen, onClose }) => {
  const addSnippet = useStore(state => state.addSnippet)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    tags: '',
    content: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        language: '',
        tags: '',
        content: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
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
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    
    const newSnippet: Snippet = {
      id: `snippet-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      content: formData.content.trim(),
      language: formData.language.trim().toLowerCase(),
      tags: tagsArray,
      category: formData.language.trim(),
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage_count: 0
    }
    
    addSnippet(newSnippet)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Novo Snippet</h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Título *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 ${
                  errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: Remove Duplicates SQL"
              />
              {errors.title && <p className="text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">{errors.title}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="language" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Linguagem *
                </label>
                <input
                  id="language"
                  type="text"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 ${
                    errors.language ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ex: SQL, Python..."
                />
                {errors.language && <p className="text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">{errors.language}</p>}
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                  placeholder="Ex: database, cleanup..."
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-none"
                placeholder="Breve descrição do que este snippet faz..."
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Código *
              </label>
              <textarea
                id="content"
                rows={12}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-none ${
                  errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Cole seu código aqui..."
              />
              {errors.content && <p className="text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">{errors.content}</p>}
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 font-medium"
            >
              Criar Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewSnippetModal