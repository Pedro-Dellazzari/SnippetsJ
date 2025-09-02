import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Folder, ProjectItem } from '../types'
import clsx from 'clsx'

interface FolderProjectModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'folder' | 'project'
  editItem?: Folder | ProjectItem
}

const FolderProjectModal: React.FC<FolderProjectModalProps> = ({
  isOpen,
  onClose,
  type,
  editItem
}) => {
  const { addFolder, updateFolder, addProjectItem, updateProjectItem } = useStore()
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          name: editItem.name,
          description: 'description' in editItem ? editItem.description || '' : ''
        })
      } else {
        setFormData({ name: '', description: '' })
      }
      setErrors({})
    }
  }, [isOpen, editItem])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      if (editItem) {
        // Edit mode
        if (type === 'folder') {
          updateFolder(editItem.id, { name: formData.name.trim() })
        } else {
          updateProjectItem(editItem.id, { 
            name: formData.name.trim(),
            description: formData.description.trim() || undefined
          })
        }
      } else {
        // Create mode
        if (type === 'folder') {
          addFolder(formData.name.trim())
        } else {
          addProjectItem(formData.name.trim(), formData.description.trim() || undefined)
        }
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  const isProject = type === 'project'
  const title = editItem 
    ? `Editar ${isProject ? 'Projeto' : 'Pasta'}`
    : `Nova ${isProject ? 'Projeto' : 'Pasta'}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
                  'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100',
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-400'
                )}
                placeholder={`Nome ${isProject ? 'do projeto' : 'da pasta'}`}
                autoFocus
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {isProject && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors dark:bg-gray-700 dark:text-gray-100 resize-none"
                  placeholder="Descrição do projeto"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                {editItem ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FolderProjectModal