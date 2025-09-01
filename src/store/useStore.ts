import { create } from 'zustand'
import { Snippet, Category, Project, Tag, SearchResult, AppState } from '../types'
import Fuse from 'fuse.js'
import { storage } from '../utils/storage'

interface StoreActions {
  setSnippets: (snippets: Snippet[]) => void
  addSnippet: (snippet: Snippet) => void
  updateSnippet: (id: string, updates: Partial<Snippet>) => void
  deleteSnippet: (id: string) => void
  duplicateSnippet: (id: string) => Snippet | null
  setSelectedSnippet: (snippet: Snippet | null) => void
  setSearchQuery: (query: string) => void
  setSidebarTab: (tab: 'categories' | 'projects' | 'tags') => void
  incrementUsageCount: (id: string) => void
  toggleFavorite: (id: string) => void
  searchSnippets: (query: string) => void
  loadPersistedData: () => void
  importExampleData: () => void
  exportData: () => string
  importData: (jsonData: string) => boolean
  getSnippetCounts: () => {
    totalSnippets: number
    categoryCounts: Record<string, number>
    projectCounts: Record<string, number>
    tagCounts: Record<string, number>
    untagged: number
    uncategorized: number
    recentlyModified: number
    favorites: number
    mostUsed: number
  }
}

const initialState: AppState = {
  snippets: [],
  categories: [],
  projects: [],
  tags: [],
  selectedSnippet: null,
  searchQuery: '',
  searchResults: [],
  sidebarTab: 'categories',
  isLoading: false,
  error: null
}

// Example data that can be optionally imported
const exampleData = {
  categories: [
    { id: '1', name: 'SQL', color: '#3B82F6', snippetCount: 0 },
    { id: '2', name: 'Python', color: '#10B981', snippetCount: 0 },
    { id: '3', name: 'JavaScript', color: '#F59E0B', snippetCount: 0 }
  ] as Category[],
  
  projects: [
    { id: '1', name: 'Projetos Pessoais', description: 'Snippets para projetos pessoais', snippetCount: 0 }
  ] as Project[],
  
  tags: [
    { id: '1', name: 'utils', color: '#EF4444', snippetCount: 0 },
    { id: '2', name: 'exemplo', color: '#8B5CF6', snippetCount: 0 }
  ] as Tag[],
  
  snippets: [
    {
      id: 'example-1',
      title: 'Exemplo: Função de Formatação de Data',
      description: 'Função JavaScript para formatar datas em português',
      content: `function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(data))
}

// Uso
console.log(formatarData(new Date())) // 01/01/2024 10:30`,
      language: 'javascript',
      tags: ['utils', 'exemplo'],
      category: 'JavaScript',
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage_count: 0
    },
    {
      id: 'example-2',
      title: 'Exemplo: Query SQL Básica',
      description: 'Exemplo de query SQL para consulta com JOIN',
      content: `SELECT u.nome, p.titulo, p.created_at
FROM usuarios u
INNER JOIN posts p ON u.id = p.usuario_id
WHERE u.ativo = true
  AND p.created_at >= CURDATE() - INTERVAL 30 DAY
ORDER BY p.created_at DESC
LIMIT 10;`,
      language: 'sql',
      tags: ['utils', 'exemplo'],
      category: 'SQL',
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage_count: 0
    }
  ] as Snippet[]
}

export const useStore = create<AppState & StoreActions>((set, get) => ({
  ...initialState,
  
  setSnippets: (snippets) => {
    set({ snippets })
    storage.saveSnippets(snippets)
  },
  
  addSnippet: (snippet) => {
    const newSnippets = [...get().snippets, snippet]
    set({ snippets: newSnippets })
    storage.saveSnippets(newSnippets)
  },
  
  updateSnippet: (id, updates) => {
    const newSnippets = get().snippets.map(snippet =>
      snippet.id === id ? { ...snippet, ...updates, updatedAt: new Date().toISOString() } : snippet
    )
    set({ snippets: newSnippets })
    storage.saveSnippets(newSnippets)
  },
  
  deleteSnippet: (id) => {
    const state = get()
    const newSnippets = state.snippets.filter(snippet => snippet.id !== id)
    set({ 
      snippets: newSnippets,
      selectedSnippet: state.selectedSnippet?.id === id ? null : state.selectedSnippet
    })
    storage.saveSnippets(newSnippets)
  },

  duplicateSnippet: (id) => {
    const state = get()
    const originalSnippet = state.snippets.find(snippet => snippet.id === id)
    
    if (!originalSnippet) return null
    
    const duplicatedSnippet: Snippet = {
      ...originalSnippet,
      id: crypto.randomUUID(),
      title: `Cópia de ${originalSnippet.title}`,
      favorite: false,
      usage_count: 0,
      lastUsed: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const newSnippets = [...state.snippets, duplicatedSnippet]
    set({ snippets: newSnippets })
    storage.saveSnippets(newSnippets)
    
    return duplicatedSnippet
  },
  
  setSelectedSnippet: (snippet) => set({ selectedSnippet: snippet }),
  
  setSearchQuery: (query) => {
    set({ searchQuery: query })
    if (query.trim()) {
      get().searchSnippets(query)
    } else {
      set({ searchResults: [] })
    }
  },
  
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  
  incrementUsageCount: (id) => {
    const newSnippets = get().snippets.map(snippet =>
      snippet.id === id 
        ? { 
            ...snippet, 
            usage_count: snippet.usage_count + 1,
            lastUsed: new Date().toISOString()
          } 
        : snippet
    )
    set({ snippets: newSnippets })
    storage.saveSnippets(newSnippets)
  },
  
  toggleFavorite: (id) => {
    const newSnippets = get().snippets.map(snippet =>
      snippet.id === id ? { ...snippet, favorite: !snippet.favorite } : snippet
    )
    set({ snippets: newSnippets })
    storage.saveSnippets(newSnippets)
  },
  
  searchSnippets: (query) => {
    const { snippets } = get()
    const fuse = new Fuse(snippets, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'content', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.4
    })
    
    const results = fuse.search(query).map(result => ({
      snippet: result.item,
      score: result.score || 0,
      matches: result.matches || []
    }))
    
    set({ searchResults: results })
  },
  
  loadPersistedData: () => {
    const data = storage.loadAllData()
    set({
      snippets: data.snippets,
      categories: data.categories,
      projects: data.projects,
      tags: data.tags,
      selectedSnippet: data.snippets.length > 0 ? data.snippets[0] : null
    })
  },

  importExampleData: () => {
    const currentData = storage.loadAllData()
    const newData = {
      snippets: [...currentData.snippets, ...exampleData.snippets],
      categories: [...currentData.categories, ...exampleData.categories],
      projects: [...currentData.projects, ...exampleData.projects],
      tags: [...currentData.tags, ...exampleData.tags]
    }
    
    storage.saveAllData(newData)
    set({
      snippets: newData.snippets,
      categories: newData.categories,
      projects: newData.projects,
      tags: newData.tags
    })
  },

  exportData: () => {
    const { snippets, categories, projects, tags } = get()
    return JSON.stringify({ snippets, categories, projects, tags }, null, 2)
  },

  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData)
      if (!data.snippets || !Array.isArray(data.snippets)) return false
      
      const validData = {
        snippets: data.snippets || [],
        categories: data.categories || [],
        projects: data.projects || [],
        tags: data.tags || []
      }
      
      storage.saveAllData(validData)
      set({
        snippets: validData.snippets,
        categories: validData.categories,
        projects: validData.projects,
        tags: validData.tags
      })
      
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  },

  getSnippetCounts: () => {
    const { snippets } = get()
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Contadores de categorias
    const categoryCounts: Record<string, number> = {}
    snippets.forEach(snippet => {
      if (snippet.category) {
        categoryCounts[snippet.category] = (categoryCounts[snippet.category] || 0) + 1
      }
    })
    
    // Contadores de projetos
    const projectCounts: Record<string, number> = {}
    snippets.forEach(snippet => {
      if (snippet.project) {
        projectCounts[snippet.project] = (projectCounts[snippet.project] || 0) + 1
      }
    })
    
    // Contadores de tags
    const tagCounts: Record<string, number> = {}
    snippets.forEach(snippet => {
      snippet.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    
    // Snippets sem tags
    const untagged = snippets.filter(snippet => !snippet.tags || snippet.tags.length === 0).length
    
    // Snippets não categorizados
    const uncategorized = snippets.filter(snippet => !snippet.category || snippet.category.trim() === '').length
    
    // Modificados recentemente (últimos 7 dias)
    const recentlyModified = snippets.filter(snippet => 
      new Date(snippet.updatedAt) >= sevenDaysAgo
    ).length
    
    // Favoritos
    const favorites = snippets.filter(snippet => snippet.favorite).length
    
    // Mais usados (com mais de 0 uso)
    const mostUsed = snippets.filter(snippet => snippet.usage_count > 0).length
    
    return {
      totalSnippets: snippets.length,
      categoryCounts,
      projectCounts,
      tagCounts,
      untagged,
      uncategorized,
      recentlyModified,
      favorites,
      mostUsed
    }
  }
}))