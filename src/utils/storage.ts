import { Snippet, Category, Project, Tag } from '../types'

const STORAGE_KEYS = {
  SNIPPETS: 'snippets-app-snippets',
  CATEGORIES: 'snippets-app-categories',
  PROJECTS: 'snippets-app-projects',
  TAGS: 'snippets-app-tags',
  SETTINGS: 'snippets-app-settings'
}

export interface StorageData {
  snippets: Snippet[]
  categories: Category[]
  projects: Project[]
  tags: Tag[]
}

class Storage {
  private isSupported(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      return true
    } catch {
      return false
    }
  }

  private saveToStorage<T>(key: string, data: T): boolean {
    if (!this.isSupported()) return false
    
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Error saving to localStorage: ${key}`, error)
      return false
    }
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    if (!this.isSupported()) return defaultValue
    
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return defaultValue
      
      return JSON.parse(stored)
    } catch (error) {
      console.error(`Error loading from localStorage: ${key}`, error)
      return defaultValue
    }
  }

  // Snippets
  saveSnippets(snippets: Snippet[]): boolean {
    return this.saveToStorage(STORAGE_KEYS.SNIPPETS, snippets)
  }

  loadSnippets(): Snippet[] {
    return this.loadFromStorage<Snippet[]>(STORAGE_KEYS.SNIPPETS, [])
  }

  // Categories
  saveCategories(categories: Category[]): boolean {
    return this.saveToStorage(STORAGE_KEYS.CATEGORIES, categories)
  }

  loadCategories(): Category[] {
    return this.loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, [])
  }

  // Projects
  saveProjects(projects: Project[]): boolean {
    return this.saveToStorage(STORAGE_KEYS.PROJECTS, projects)
  }

  loadProjects(): Project[] {
    return this.loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, [])
  }

  // Tags
  saveTags(tags: Tag[]): boolean {
    return this.saveToStorage(STORAGE_KEYS.TAGS, tags)
  }

  loadTags(): Tag[] {
    return this.loadFromStorage<Tag[]>(STORAGE_KEYS.TAGS, [])
  }

  // Load all data
  loadAllData(): StorageData {
    return {
      snippets: this.loadSnippets(),
      categories: this.loadCategories(),
      projects: this.loadProjects(),
      tags: this.loadTags()
    }
  }

  // Save all data
  saveAllData(data: StorageData): boolean {
    const results = [
      this.saveSnippets(data.snippets),
      this.saveCategories(data.categories),
      this.saveProjects(data.projects),
      this.saveTags(data.tags)
    ]
    
    return results.every(result => result)
  }

  // Clear all data
  clearAllData(): boolean {
    if (!this.isSupported()) return false
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage', error)
      return false
    }
  }

  // Check if data exists
  hasData(): boolean {
    const data = this.loadAllData()
    return data.snippets.length > 0 || data.categories.length > 0 || data.projects.length > 0 || data.tags.length > 0
  }
}

export const storage = new Storage()