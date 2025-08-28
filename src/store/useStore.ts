import { create } from 'zustand'
import { Snippet, Category, Project, Tag, SearchResult, AppState } from '../types'
import Fuse from 'fuse.js'

interface StoreActions {
  setSnippets: (snippets: Snippet[]) => void
  addSnippet: (snippet: Snippet) => void
  updateSnippet: (id: string, updates: Partial<Snippet>) => void
  deleteSnippet: (id: string) => void
  setSelectedSnippet: (snippet: Snippet | null) => void
  setSearchQuery: (query: string) => void
  setSidebarTab: (tab: 'categories' | 'projects' | 'tags') => void
  incrementUsageCount: (id: string) => void
  toggleFavorite: (id: string) => void
  searchSnippets: (query: string) => void
  initializeData: () => void
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

const mockData = {
  categories: [
    { id: '1', name: 'SQL', color: '#3B82F6', snippetCount: 3 },
    { id: '2', name: 'Python', color: '#10B981', snippetCount: 2 },
    { id: '3', name: 'Bash', color: '#F59E0B', snippetCount: 1 }
  ] as Category[],
  
  projects: [
    { id: '1', name: 'Data Pipeline', description: 'ETL processes', snippetCount: 2 },
    { id: '2', name: 'Analytics', description: 'Data analysis scripts', snippetCount: 4 }
  ] as Project[],
  
  tags: [
    { id: '1', name: 'database', color: '#EF4444', snippetCount: 3 },
    { id: '2', name: 'retry', color: '#8B5CF6', snippetCount: 1 },
    { id: '3', name: 'docker', color: '#06B6D4', snippetCount: 1 }
  ] as Tag[],
  
  snippets: [
    {
      id: '1',
      title: 'Remove Duplicates SQL',
      description: 'SQL query to remove duplicate rows from a table',
      content: `WITH deduped AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY column1, column2 
      ORDER BY created_at DESC
    ) as row_num
  FROM your_table
)
SELECT * FROM deduped 
WHERE row_num = 1;`,
      language: 'sql',
      tags: ['database', 'cleanup'],
      category: 'SQL',
      project: 'Data Pipeline',
      favorite: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      usage_count: 15,
      lastUsed: '2024-01-20T14:22:00Z'
    },
    {
      id: '2',
      title: 'Python Retry Decorator',
      description: 'Decorator for automatic retry logic with exponential backoff',
      content: `import time
import random
from functools import wraps

def retry(max_attempts=3, delay=1, exponential_base=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise e
                    wait_time = delay * (exponential_base ** attempt)
                    wait_time += random.uniform(0, 1)
                    time.sleep(wait_time)
            return None
        return wrapper
    return decorator

@retry(max_attempts=5, delay=2)
def api_call():
    # Your API call here
    pass`,
      language: 'python',
      tags: ['retry', 'decorator', 'error-handling'],
      category: 'Python',
      project: 'Data Pipeline',
      favorite: false,
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
      usage_count: 8,
      lastUsed: '2024-01-18T11:45:00Z'
    },
    {
      id: '3',
      title: 'Docker Container Stats',
      description: 'Command to monitor Docker container resource usage',
      content: 'docker stats --format "table {{.Container}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.NetIO}}\\t{{.BlockIO}}"',
      language: 'bash',
      tags: ['docker', 'monitoring'],
      category: 'Bash',
      favorite: false,
      createdAt: '2024-01-10T16:45:00Z',
      updatedAt: '2024-01-10T16:45:00Z',
      usage_count: 3,
      lastUsed: '2024-01-19T08:30:00Z'
    }
  ] as Snippet[]
}

export const useStore = create<AppState & StoreActions>((set, get) => ({
  ...initialState,
  
  setSnippets: (snippets) => set({ snippets }),
  
  addSnippet: (snippet) => set((state) => ({
    snippets: [...state.snippets, snippet]
  })),
  
  updateSnippet: (id, updates) => set((state) => ({
    snippets: state.snippets.map(snippet =>
      snippet.id === id ? { ...snippet, ...updates, updatedAt: new Date().toISOString() } : snippet
    )
  })),
  
  deleteSnippet: (id) => set((state) => ({
    snippets: state.snippets.filter(snippet => snippet.id !== id),
    selectedSnippet: state.selectedSnippet?.id === id ? null : state.selectedSnippet
  })),
  
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
  
  incrementUsageCount: (id) => set((state) => ({
    snippets: state.snippets.map(snippet =>
      snippet.id === id 
        ? { 
            ...snippet, 
            usage_count: snippet.usage_count + 1,
            lastUsed: new Date().toISOString()
          } 
        : snippet
    )
  })),
  
  toggleFavorite: (id) => set((state) => ({
    snippets: state.snippets.map(snippet =>
      snippet.id === id ? { ...snippet, favorite: !snippet.favorite } : snippet
    )
  })),
  
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
  
  initializeData: () => {
    set({
      categories: mockData.categories,
      projects: mockData.projects,
      tags: mockData.tags,
      snippets: mockData.snippets,
      selectedSnippet: mockData.snippets[0]
    })
  }
}))