// Sistema de cores para linguagens de programação
export const languageColors: Record<string, string> = {
  javascript: '#F7DF1E',
  typescript: '#3178C6',
  python: '#3776AB',
  java: '#ED8B00',
  csharp: '#239120',
  'c#': '#239120',
  cpp: '#00599C',
  'c++': '#00599C',
  c: '#A8B9CC',
  go: '#00ADD8',
  rust: '#000000',
  php: '#777BB4',
  ruby: '#CC342D',
  swift: '#FA7343',
  kotlin: '#7F52FF',
  scala: '#DC322F',
  sql: '#336791',
  bash: '#4EAA25',
  shell: '#4EAA25',
  html: '#E34F26',
  css: '#1572B6',
  scss: '#CF649A',
  less: '#1D365D',
  json: '#000000',
  xml: '#0060AC',
  yaml: '#CB171E',
  yml: '#CB171E',
  markdown: '#083FA1',
  dockerfile: '#384D54',
  docker: '#0DB7ED',
  react: '#61DAFB',
  vue: '#4FC08D',
  angular: '#DD0031',
  node: '#339933',
  'node.js': '#339933',
  nginx: '#009639',
  apache: '#D22128',
  mysql: '#00758F',
  postgresql: '#336791',
  mongodb: '#47A248',
  redis: '#DC382D',
  git: '#F05032',
  vim: '#019733',
  powershell: '#5391FE',
  lua: '#2C2D72',
  perl: '#39457E',
  r: '#276DC3',
  matlab: '#0076A8',
  default: '#6B7280'
}

// Cores para tags baseadas em categoria
export const tagColors = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#64748B', '#6B7280', '#374151'
]

// Função para obter cor da linguagem
export function getLanguageColor(language: string): string {
  const normalizedLanguage = language.toLowerCase().replace(/[\s-]/g, '')
  return languageColors[normalizedLanguage] || languageColors.default
}

// Função para obter cor da tag baseada no hash do nome
export function getTagColor(tagName: string): string {
  let hash = 0
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % tagColors.length
  return tagColors[index]
}

// Função para obter versão mais clara da cor (para backgrounds)
export function getLightColor(color: string, opacity: number = 0.1): string {
  // Remove o # se presente
  const hex = color.replace('#', '')
  
  // Converte hex para RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Função para determinar se usar texto claro ou escuro baseado na cor de fundo
export function getContrastColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calcular luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Classes Tailwind customizadas para hover effects
export const hoverEffects = {
  card: 'hover:bg-gray-50 hover:shadow-sm transition-all duration-200',
  button: 'hover:scale-105 transition-transform duration-200',
  icon: 'hover:bg-opacity-20 transition-colors duration-200'
}