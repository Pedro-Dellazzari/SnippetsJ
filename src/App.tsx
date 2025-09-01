import React, { useEffect } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import SnippetList from './components/SnippetList'
import SnippetDetail from './components/SnippetDetail'
import SearchBar from './components/SearchBar'

function App() {
  const initializeData = useStore(state => state.initializeData)

  useEffect(() => {
    initializeData()
  }, [initializeData])

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <SearchBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <SnippetList />
        <SnippetDetail />
      </div>
    </div>
  )
}

export default App