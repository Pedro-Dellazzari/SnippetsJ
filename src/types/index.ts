export interface Snippet {
  id: string
  title: string
  description: string
  content: string
  language: string
  tags: string[]
  category: string
  project?: string
  favorite: boolean
  createdAt: string
  updatedAt: string
  usage_count: number
  lastUsed?: string
}

export interface Category {
  id: string
  name: string
  color: string
  snippetCount: number
}

export interface Project {
  id: string
  name: string
  description: string
  snippetCount: number
}

export interface Tag {
  id: string
  name: string
  color: string
  snippetCount: number
}

export interface SearchResult {
  snippet: Snippet
  score: number
  matches: {
    field: string
    indices: number[][]
  }[]
}

export interface AppState {
  snippets: Snippet[]
  categories: Category[]
  projects: Project[]
  tags: Tag[]
  selectedSnippet: Snippet | null
  searchQuery: string
  searchResults: SearchResult[]
  sidebarTab: 'categories' | 'projects' | 'tags'
  isLoading: boolean
  error: string | null
}

declare global {
  interface Window {
    electronAPI: {
      copyToClipboard: (text: string) => Promise<boolean>
      onMenuNewSnippet: (callback: () => void) => void
      onMenuSearch: (callback: () => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}