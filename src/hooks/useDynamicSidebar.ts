import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { SidebarSection } from '../types/sidebar'

export function useDynamicSidebar(): SidebarSection[] {
  const snippets = useStore(state => state.snippets)
  const getSnippetCounts = useStore(state => state.getSnippetCounts)

  return useMemo(() => {
    const counts = getSnippetCounts()
    
    // Obter linguagens únicas dos snippets (baseado no campo category que representa a linguagem)
    const uniqueLanguages = Array.from(new Set(
      snippets
        .map(s => s.category)
        .filter(category => category && category.trim() !== '')
    )).sort((a, b) => {
      // Ordenar por quantidade de snippets (decrescente), depois alfabeticamente
      const countA = counts.categoryCounts[a] || 0
      const countB = counts.categoryCounts[b] || 0
      if (countA !== countB) return countB - countA
      return a.localeCompare(b)
    })

    // Obter projetos únicos dos snippets
    const uniqueProjects = Array.from(new Set(
      snippets
        .map(s => s.project)
        .filter(project => project && project.trim() !== '')
    )).sort()

    // Obter folders únicos (vamos usar um campo separado para folders no futuro)
    // Por enquanto, começamos com array vazio até implementarmos folders
    const uniqueFolders: string[] = []

    return [
      {
        id: 'folders',
        title: 'FOLDERS',
        collapsible: true,
        items: [
          // Botão para criar nova pasta
          {
            id: 'add-folder',
            label: '+ Nova pasta',
            icon: 'plus',
            type: 'folder' as const,
            isSpecial: true
          },
          // Lista de folders existentes
          ...uniqueFolders.map(folder => ({
            id: `folder-${folder.toLowerCase()}`,
            label: folder,
            icon: 'folder',
            count: 0, // TODO: implementar contagem de folders
            type: 'folder' as const
          }))
        ]
      },
      {
        id: 'languages',
        title: 'LINGUAGENS',
        collapsible: true,
        items: uniqueLanguages.map(language => ({
          id: `language-${language.toLowerCase()}`,
          label: language,
          icon: getLanguageIcon(language),
          count: counts.categoryCounts[language] || 0,
          type: 'folder' as const,
          color: getLanguageColor(language)
        }))
      },
      {
        id: 'projects',
        title: 'PROJETOS',
        collapsible: true,
        items: [
          // Botão para criar novo projeto
          {
            id: 'add-project',
            label: '+ Novo Projeto',
            icon: 'plus',
            type: 'folder' as const,
            isSpecial: true
          },
          // Lista de projetos existentes
          ...uniqueProjects.map(project => ({
            id: `project-${project!.toLowerCase()}`,
            label: project!,
            icon: 'rocket-launch',
            count: counts.projectCounts[project!] || 0,
            type: 'folder' as const
          }))
        ]
      }
    ]
  }, [snippets, getSnippetCounts])
}

// Função auxiliar para obter ícone específico por linguagem
function getLanguageIcon(language: string): string {
  const languageIcons: Record<string, string> = {
    'javascript': 'code-bracket',
    'typescript': 'code-bracket',
    'python': 'code-bracket',
    'java': 'code-bracket',
    'sql': 'circle-stack',
    'bash': 'terminal',
    'shell': 'terminal',
    'html': 'code-bracket',
    'css': 'paint-brush',
    'php': 'code-bracket',
    'go': 'code-bracket',
    'rust': 'code-bracket',
    'cpp': 'code-bracket',
    'c': 'code-bracket'
  }
  
  return languageIcons[language.toLowerCase()] || 'code-bracket'
}

// Função auxiliar para gerar cores específicas por linguagem
function getLanguageColor(language: string): string {
  const languageColors: Record<string, string> = {
    'javascript': '#F7DF1E',
    'typescript': '#3178C6',
    'python': '#3776AB',
    'java': '#ED8B00',
    'sql': '#336791',
    'bash': '#4EAA25',
    'shell': '#4EAA25',
    'html': '#E34F26',
    'css': '#1572B6',
    'php': '#777BB4',
    'go': '#00ADD8',
    'rust': '#DEA584',
    'cpp': '#00599C',
    'c': '#A8B9CC'
  }
  
  return languageColors[language.toLowerCase()] || '#6B7280'
}