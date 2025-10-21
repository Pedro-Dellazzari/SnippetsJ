# 📚 Snippets App

Um aplicativo desktop elegante para organizar, buscar e reutilizar trechos de código de forma rápida e prática.

## ✨ Funcionalidades

- 🎨 **Layout responsivo de 3 colunas**: Barra lateral, lista de snippets e visualizador de código
- 🔍 **Busca inteligente**: Busca fuzzy por título, conteúdo, tags e linguagem
- 📁 **Organização flexível**: Pastas hierárquicas, projetos e tags personalizadas
- 💖 **Sistema de favoritos**: Marque snippets importantes para acesso rápido
- 🎨 **Syntax highlighting**: Monaco Editor com destaque de sintaxe para múltiplas linguagens
- 📋 **Cópia rápida**: Duplo clique para copiar ou botão de cópia com feedback visual
- 🖱️ **Menu contextual**: Clique direito para mover snippets entre pastas e projetos
- 💾 **Persistência local**: Dados salvos no localStorage do navegador
- 🌙 **Tema escuro**: Suporte completo para modo claro e escuro
- ✏️ **CRUD completo**: Criar, editar, duplicar e excluir snippets
- 🎓 **Onboarding interativo**: Tutorial guiado para novos usuários
- ⌨️ **Atalhos de teclado**: Ctrl+N para novo snippet e mais

## 🛠 Tecnologias

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 36
- **Styling**: Tailwind CSS + Headless UI
- **Editor**: Monaco Editor (VS Code editor)
- **Busca**: Fuse.js (fuzzy search)
- **Estado**: Zustand
- **Build**: Vite + electron-builder
- **Onboarding**: React Joyride

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

# Gerar executável Windows
npm run dist:win

# Gerar versão portável (sem instalação)
npm run dist:portable
```

## 📂 Estrutura do Projeto

```
snippets-app/
├── electron/           # Código do Electron
│   ├── main.ts        # Processo principal
│   └── preload.ts     # Script de pré-carregamento
├── src/               # Código React
│   ├── components/    # Componentes UI
│   ├── contexts/      # Context API (Onboarding)
│   ├── hooks/         # Custom hooks
│   ├── store/         # Estado global (Zustand)
│   └── types/         # Definições TypeScript
├── build/             # Ícones e recursos
├── dist/              # Build do Electron
├── dist-react/        # Build do React
└── release/           # Executáveis gerados
```

## 🎨 Interface

O aplicativo possui três painéis principais:

1. **Barra Lateral Esquerda**: Navegação por categorias, projetos e tags
2. **Lista Central**: Snippets com visualização compacta e busca
3. **Painel Direito**: Visualizador de código com Monaco Editor

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 👨‍💻 Autor

Desenvolvido por Pedro

---

**Feito com ❤️ para desenvolvedores que amam código organizado**