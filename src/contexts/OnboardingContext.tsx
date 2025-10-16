import React, { createContext, useContext, useState, useEffect } from 'react'
import { Step } from 'react-joyride'

export interface OnboardingContextType {
  isOnboardingActive: boolean
  currentStep: number
  steps: Step[]
  startOnboarding: () => void
  stopOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  setStep: (stepIndex: number) => void
  skipOnboarding: () => void
  hasSeenOnboarding: boolean
  showDoubleClickTip: () => void
  hasSeenDoubleClickTip: boolean
  isShowingDoubleClickTip: boolean
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

const ONBOARDING_SEEN_KEY = 'snippets-app-onboarding-seen'
const DOUBLE_CLICK_TIP_SEEN_KEY = 'snippets-app-double-click-tip-seen'

const tutorialSteps: Step[] = [
  {
    target: '.sidebar-todos',
    content: 'Aqui você encontra todos os snippets salvos, independente da pasta, projeto ou linguagem. É o seu ponto central para acessar todo o conteúdo.',
    title: '📄 Todos os Snippets',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.sidebar-favorites',
    content: 'Clique aqui para ver apenas seus snippets favoritos. Marque um snippet como favorito clicando no ícone de coração.',
    title: '❤️ Favoritos',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.btn-new-snippet',
    content: 'Clique aqui para adicionar um novo snippet. Você pode definir título, linguagem, tags e muito mais. Use Ctrl+N como atalho.',
    title: '✨ Criar Novo Snippet',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.snippet-card:first-child',
    content: 'Dê dois cliques rápidos em qualquer snippet para copiá-lo automaticamente para a área de transferência com feedback visual.',
    title: '⚡ Copiar Rapidamente',
    placement: 'top',
    disableBeacon: true
  },
  {
    target: '.sidebar-folders',
    content: 'Organize seus snippets em pastas para manter tudo organizado por contexto ou categoria. Você pode criar hierarquias de pastas.',
    title: '📁 Pastas',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.sidebar-projects',
    content: 'Gerencie seus projetos e organize snippets por contexto de trabalho. Ideal para separar códigos de diferentes aplicações.',
    title: '🚀 Projetos',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.search-bar',
    content: 'Use a busca para encontrar snippets por título, conteúdo, tags ou linguagem. A busca é inteligente e em tempo real.',
    title: '🔍 Busca Inteligente',
    placement: 'bottom',
    disableBeacon: true
  }
]

const doubleClickTipSteps: Step[] = [
  {
    target: '.snippet-card:first-child',
    content: 'Parabéns pelo seu primeiro snippet! 🎉 Dica rápida: Dê dois cliques rápidos em qualquer snippet para copiá-lo automaticamente para a área de transferência.',
    title: '⚡ Dica: Copiar com Duplo Clique',
    placement: 'top',
    disableBeacon: true
  },
  {
    target: '.snippet-card:first-child',
    content: 'Clique com o botão direito do mouse em qualquer snippet para acessar opções de organização, como mover para pastas e projetos.',
    title: '📁 Dica: Organizar Snippets',
    placement: 'top',
    disableBeacon: true
  }
]

interface OnboardingProviderProps {
  children: React.ReactNode
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const [hasSeenDoubleClickTip, setHasSeenDoubleClickTip] = useState(false)
  const [isShowingDoubleClickTip, setIsShowingDoubleClickTip] = useState(false)

  // Check if user has seen onboarding on mount
  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_SEEN_KEY)
    const seenDoubleClickTip = localStorage.getItem(DOUBLE_CLICK_TIP_SEEN_KEY)
    setHasSeenOnboarding(!!seen)
    setHasSeenDoubleClickTip(!!seenDoubleClickTip)

    // Start onboarding automatically for new users
    if (!seen) {
      // Delay to ensure UI is rendered
      setTimeout(() => {
        setIsOnboardingActive(true)
      }, 1500)
    }
  }, [])

  const startOnboarding = () => {
    setCurrentStep(0)
    setIsOnboardingActive(true)
    setIsShowingDoubleClickTip(false)
  }

  const stopOnboarding = () => {
    setIsOnboardingActive(false)
    setCurrentStep(0)
    setIsShowingDoubleClickTip(false)
  }

  const nextStep = () => {
    const currentSteps = isShowingDoubleClickTip ? doubleClickTipSteps : tutorialSteps
    setCurrentStep(prev => Math.min(prev + 1, currentSteps.length - 1))
  }

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const setStep = (stepIndex: number) => {
    const currentSteps = isShowingDoubleClickTip ? doubleClickTipSteps : tutorialSteps
    setCurrentStep(Math.max(0, Math.min(stepIndex, currentSteps.length - 1)))
  }

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true')
    setHasSeenOnboarding(true)
    stopOnboarding()
  }

  const showDoubleClickTip = () => {
    // Only show if not seen before
    if (!hasSeenDoubleClickTip) {
      setCurrentStep(0)
      setIsOnboardingActive(true)
      setIsShowingDoubleClickTip(true)

      // Mark as seen after showing
      localStorage.setItem(DOUBLE_CLICK_TIP_SEEN_KEY, 'true')
      setHasSeenDoubleClickTip(true)
    }
  }

  const value: OnboardingContextType = {
    isOnboardingActive,
    currentStep,
    steps: isShowingDoubleClickTip ? doubleClickTipSteps : tutorialSteps,
    startOnboarding,
    stopOnboarding,
    nextStep,
    previousStep,
    setStep,
    skipOnboarding,
    hasSeenOnboarding,
    showDoubleClickTip,
    hasSeenDoubleClickTip,
    isShowingDoubleClickTip
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}