import React from 'react'
import { 
  CodeBracketIcon, 
  PlusIcon
} from '@heroicons/react/24/outline'

interface EmptyStateProps {
  onCreateNew: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNew }) => {

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <CodeBracketIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Bem-vindo ao Snippets!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Organize, pesquise e reutilize seus códigos favoritos. 
          Crie seu primeiro snippet para começar.
        </p>
      </div>

      <div className="flex justify-center w-full max-w-sm">
        <button
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          Criar Primeiro Snippet
        </button>
      </div>

      <div className="mt-8 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Salvamento automático</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Pesquisa inteligente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>Organização por tags</span>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        Seus dados são salvos localmente e mantidos entre sessões
      </div>
    </div>
  )
}

export default EmptyState