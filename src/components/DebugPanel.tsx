import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { useOnboarding } from '../contexts/OnboardingContext'

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { cleanupOrphanedData, projectItems, folders, snippets } = useStore()
  const { startOnboarding } = useOnboarding()

  const handleCleanup = () => {
    cleanupOrphanedData()
    alert('Limpeza concluída! Verifique o console para mais detalhes.')
  }

  const clearAllData = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os seus dados (snippets, projetos, pastas). Esta ação não pode ser desfeita. Tem certeza?')) {
      if (confirm('Última confirmação: TODOS os dados serão perdidos. Continuar?')) {
        localStorage.clear()
        window.location.reload()
      }
    }
  }

  const showStorageInfo = () => {
    console.clear()
    console.log('📊 INFORMAÇÕES DE DEBUG:')
    console.log('='.repeat(50))

    console.log('\n📁 PROJETOS ATUAIS:')
    projectItems.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (ID: ${project.id})`)
      if (project.parentId) console.log(`   └─ Parent: ${project.parentId}`)
    })

    console.log('\n📂 PASTAS ATUAIS:')
    folders.forEach((folder, index) => {
      console.log(`${index + 1}. ${folder.name} (ID: ${folder.id})`)
      if (folder.parentId) console.log(`   └─ Parent: ${folder.parentId}`)
    })

    console.log('\n📄 SNIPPETS COM REFERÊNCIAS:')
    snippets.forEach((snippet, index) => {
      if (snippet.folderId || snippet.projectId) {
        console.log(`${index + 1}. ${snippet.title}`)
        if (snippet.folderId) console.log(`   └─ FolderId: ${snippet.folderId}`)
        if (snippet.projectId) console.log(`   └─ ProjectId: ${snippet.projectId}`)
      }
    })

    console.log('\n📊 RESUMO:')
    console.log(`- Total de projetos: ${projectItems.length}`)
    console.log(`- Total de pastas: ${folders.length}`)
    console.log(`- Total de snippets: ${snippets.length}`)

    alert('Informações de debug enviadas para o console. Abra as ferramentas de desenvolvedor (F12) para ver.')
  }

  const restartOnboarding = () => {
    localStorage.removeItem('snippets-app-onboarding-seen')
    startOnboarding()
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-50"
        style={{ fontSize: '12px' }}
      >
        🔧 Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">🔧 Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={showStorageInfo}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
          📊 Mostrar Info de Storage
        </button>

        <button
          onClick={restartOnboarding}
          className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
        >
          🎯 Refazer Onboarding
        </button>

        <button
          onClick={handleCleanup}
          className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium"
        >
          🧹 Limpar Dados Órfãos
        </button>

        <button
          onClick={clearAllData}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
        >
          🗑️ Limpar TODOS os Dados
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <p>Use este painel para diagnosticar problemas com projetos "fantasma" ou dados corrompidos.</p>
      </div>
    </div>
  )
}

export default DebugPanel