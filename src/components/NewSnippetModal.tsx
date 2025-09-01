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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Snippet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Remove Duplicates SQL"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Linguagem *
              </label>
              <input
                id="language"
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.language ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: SQL, Python, JavaScript..."
              />
              {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: database, cleanup, performance (separadas por vírgula)"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Breve descrição do que este snippet faz..."
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <textarea
                id="content"
                rows={8}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Cole seu código aqui..."
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewSnippetModal