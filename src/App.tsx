import React, { useEffect } from 'react'
import { useStore } from './store/useStore'
import { FocusModeProvider, useFocusMode } from './contexts/FocusModeContext'
import Sidebar from './components/Sidebar'
import SnippetList from './components/SnippetList'
import SnippetDetail from './components/SnippetDetail'
import SearchBar from './components/SearchBar'

function AppContent() {
  const loadPersistedData = useStore(state => state.loadPersistedData)
  const { isFocusMode } = useFocusMode()

  useEffect(() => {
    loadPersistedData()
  }, [loadPersistedData])


  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {!isFocusMode && <SearchBar />}
      
      <div className="flex flex-1 overflow-hidden">
        {!isFocusMode && <Sidebar />}
        {!isFocusMode && <SnippetList />}
        <SnippetDetail />
      </div>
    </div>
  )
}

function App() {
  return (
    <FocusModeProvider>
      <AppContent />
    </FocusModeProvider>
  )
}

export default App