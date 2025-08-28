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
    incrementUsageCount 
  } = useStore()
  
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedSnippet.title}
            </h1>
            <p className="text-gray-600">
              {selectedSnippet.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
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
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
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
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSnippet.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
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
        <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
          <Editor
            height="100%"
            language={getLanguageForEditor(selectedSnippet.language)}
            value={selectedSnippet.content}
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
    </div>
  )
}

export default SnippetDetail