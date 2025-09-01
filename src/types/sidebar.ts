export interface SidebarItem {
  id: string
  label: string
  icon: string
  count?: number
  type: 'favorite' | 'folder' | 'smart-group' | 'tag'
  children?: SidebarItem[]
  color?: string
  isSpecial?: boolean
}

export interface SidebarSection {
  id: string
  title: string
  items: SidebarItem[]
  collapsible: boolean
}

// Mock data structure for sidebar
export const SIDEBAR_DATA: SidebarSection[] = [
  {
    id: 'favorites',
    title: 'FAVORITES',
    collapsible: false,
    items: [
      {
        id: 'all-snippets',
        label: 'All Snippets',
        icon: 'document-text',
        count: 127,
        type: 'favorite'
      },
      {
        id: 'uncategorized',
        label: 'Uncategorized',
        icon: 'folder',
        count: 8,
        type: 'favorite'
      },
      {
        id: 'trash',
        label: 'Trash',
        icon: 'trash',
        count: 3,
        type: 'favorite',
        isSpecial: true
      }
    ]
  },
  {
    id: 'folders',
    title: 'FOLDERS',
    collapsible: true,
    items: [
      {
        id: 'development',
        label: 'Development',
        icon: 'folder',
        count: 45,
        type: 'folder',
        children: [
          {
            id: 'frontend',
            label: 'Frontend',
            icon: 'folder',
            count: 23,
            type: 'folder',
            children: [
              {
                id: 'react',
                label: 'React',
                icon: 'folder',
                count: 12,
                type: 'folder'
              },
              {
                id: 'vue',
                label: 'Vue.js',
                icon: 'folder',
                count: 8,
                type: 'folder'
              }
            ]
          },
          {
            id: 'backend',
            label: 'Backend',
            icon: 'folder',
            count: 22,
            type: 'folder',
            children: [
              {
                id: 'node',
                label: 'Node.js',
                icon: 'folder',
                count: 15,
                type: 'folder'
              },
              {
                id: 'python',
                label: 'Python',
                icon: 'folder',
                count: 7,
                type: 'folder'
              }
            ]
          }
        ]
      },
      {
        id: 'database',
        label: 'Database',
        icon: 'folder',
        count: 18,
        type: 'folder',
        children: [
          {
            id: 'sql',
            label: 'SQL',
            icon: 'folder',
            count: 12,
            type: 'folder'
          },
          {
            id: 'nosql',
            label: 'NoSQL',
            icon: 'folder',
            count: 6,
            type: 'folder'
          }
        ]
      },
      {
        id: 'devops',
        label: 'DevOps',
        icon: 'folder',
        count: 15,
        type: 'folder'
      }
    ]
  },
  {
    id: 'smart-groups',
    title: 'SMART GROUPS',
    collapsible: true,
    items: [
      {
        id: 'gists',
        label: 'Gists',
        icon: 'code-bracket',
        count: 23,
        type: 'smart-group'
      },
      {
        id: 'no-tags',
        label: 'No Tags',
        icon: 'tag',
        count: 12,
        type: 'smart-group'
      },
      {
        id: 'recently-modified',
        label: 'Recently Modified',
        icon: 'clock',
        count: 8,
        type: 'smart-group'
      },
      {
        id: 'most-used',
        label: 'Most Used',
        icon: 'fire',
        count: 15,
        type: 'smart-group'
      }
    ]
  }
]