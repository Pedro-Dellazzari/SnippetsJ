# 📚 Snippets App

Um aplicativo desktop elegante para organizar, buscar e reutilizar trechos de código de forma rápida e prática.

## ✨ Funcionalidades

### Já Implementadas ✅
- 🎨 **Layout responsivo de 3 colunas**: Barra lateral, lista de snippets e visualizador de código
- 🔍 **Busca inteligente**: Busca fuzzy por título, descrição, conteúdo e tags
- 📁 **Organização flexível**: Categorias, projetos e tags coloridos
- 💖 **Sistema de favoritos**: Marque snippets importantes
- 🎨 **Syntax highlighting**: Monaco Editor com destaque de sintaxe
- 📋 **Cópia com 1 clique**: Integração com clipboard do sistema
- 📊 **Métricas de uso**: Contadores de uso e última utilização
- 🎯 **Interface limpa**: Design inspirado no estilo Apple

### Em Desenvolvimento 🚧
- 💾 **Persistência de dados**: SQLite para armazenamento local
- ➕ **Formulários CRUD**: Adicionar/editar snippets
- 🌙 **Tema escuro**: Modo escuro opcional
- 🔧 **Gerenciamento de variáveis**: Suporte a arquivos .env

## 🛠 Tecnologias

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 27
- **Styling**: Tailwind CSS + Headless UI
- **Editor**: Monaco Editor
- **Busca**: Fuse.js (fuzzy search)
- **Estado**: Zustand
- **Build**: Vite

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v20+)
- npm

### Instalação
```bash
# Instalar dependências
npm install

# Modo desenvolvimento (React + Electron)
npm run dev

# Apenas React (para desenvolvimento web)
npm run dev:react

# Build do projeto
npm run build

# Gerar executável
npm run dist
```

## 📂 Estrutura do Projeto

```
snippets-app/
├── electron/           # Código do Electron
│   ├── main.ts        # Processo principal
│   └── preload.ts     # Script de pré-carregamento
├── src/               # Código React
│   ├── components/    # Componentes UI
│   ├── store/         # Estado global (Zustand)
│   └── types/         # Definições TypeScript
├── dist/              # Build do Electron
└── dist-react/        # Build do React
```

## 🎨 Interface

O aplicativo possui três painéis principais:

1. **Barra Lateral Esquerda**: Navegação por categorias, projetos e tags
2. **Lista Central**: Snippets com visualização compacta e busca
3. **Painel Direito**: Visualizador de código com Monaco Editor

## 🎯 Próximos Passos

1. **Persistência de Dados**: Implementar SQLite para salvar snippets
2. **Formulários**: Interface para criar/editar snippets
3. **Importação/Exportação**: Backup e sincronização
4. **Extensibilidade**: Plugins e temas personalizados

## 🤝 Contribuição

Este é um projeto em desenvolvimento ativo. Sugestões e melhorias são sempre bem-vindas!

---

**Desenvolvido com ❤️ para profissionais de dados**