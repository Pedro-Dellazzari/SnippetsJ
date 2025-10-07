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
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

const ONBOARDING_SEEN_KEY = 'snippets-app-onboarding-seen'

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

interface OnboardingProviderProps {
  children: React.ReactNode
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  // Check if user has seen onboarding on mount
  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_SEEN_KEY)
    setHasSeenOnboarding(!!seen)
    
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
  }

  const stopOnboarding = () => {
    setIsOnboardingActive(false)
    setCurrentStep(0)
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, tutorialSteps.length - 1))
  }

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const setStep = (stepIndex: number) => {
    setCurrentStep(Math.max(0, Math.min(stepIndex, tutorialSteps.length - 1)))
  }

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true')
    setHasSeenOnboarding(true)
    stopOnboarding()
  }

  const value: OnboardingContextType = {
    isOnboardingActive,
    currentStep,
    steps: tutorialSteps,
    startOnboarding,
    stopOnboarding,
    nextStep,
    previousStep,
    setStep,
    skipOnboarding,
    hasSeenOnboarding
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