import React, { useCallback } from 'react'
import Joyride, { CallBackProps, ACTIONS, Step } from 'react-joyride'
import { useOnboarding } from '../contexts/OnboardingContext'
import { useDarkMode } from '../hooks/useDarkMode'

const OnboardingTour: React.FC = () => {
  const { isDarkMode } = useDarkMode()
  const {
    isOnboardingActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    isShowingDoubleClickTip
  } = useOnboarding()

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, action, index } = data

    // Se finalizou ou pulou o tutorial, fechar
    if (status === 'finished' || status === 'skipped') {
      skipOnboarding()
      return
    }

    // Se clicou em fechar (X)
    if (action === ACTIONS.CLOSE) {
      skipOnboarding()
      return
    }

    // Se está na última etapa e clicou em próximo/finalizar
    if (index === steps.length - 1 && action === ACTIONS.NEXT) {
      skipOnboarding()
      return
    }

    // Navegação entre etapas
    if (type === 'step:after' || type === 'error:target_not_found') {
      if (action === ACTIONS.NEXT && index < steps.length - 1) {
        nextStep()
      } else if (action === ACTIONS.PREV) {
        previousStep()
      }
    }

    // Handle target not found - skip to next step
    if (type === 'error:target_not_found') {
      console.warn(`Tutorial target not found for step ${index}:`, steps[index]?.target)
      if (index < steps.length - 1) {
        nextStep()
      } else {
        skipOnboarding()
      }
    }
  }, [nextStep, previousStep, skipOnboarding, steps])

  if (!isOnboardingActive) {
    return null
  }

  const joyrideStyles = {
    options: {
      primaryColor: '#3B82F6',
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      textColor: isDarkMode ? '#F9FAFB' : '#111827',
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
    tooltip: {
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      borderRadius: '12px',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      fontSize: '14px',
      maxWidth: '320px',
      padding: '16px',
      boxShadow: isDarkMode 
        ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
        : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB'
    },
    tooltipContainer: {
      textAlign: 'left' as const,
      lineHeight: '1.5'
    },
    tooltipTitle: {
      color: isDarkMode ? '#F9FAFB' : '#111827',
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    tooltipContent: {
      color: isDarkMode ? '#D1D5DB' : '#6B7280',
      fontSize: '14px',
      lineHeight: '1.6'
    },
    tooltipFooter: {
      marginTop: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    buttonNext: {
      backgroundColor: '#3B82F6',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      outline: 'none',
      padding: '8px 16px',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#2563EB',
        transform: 'translateY(-1px)'
      }
    },
    buttonBack: {
      backgroundColor: 'transparent',
      border: `1px solid ${isDarkMode ? '#4B5563' : '#D1D5DB'}`,
      borderRadius: '8px',
      color: isDarkMode ? '#D1D5DB' : '#6B7280',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      marginRight: '8px',
      outline: 'none',
      padding: '8px 16px',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
        color: isDarkMode ? '#F9FAFB' : '#374151'
      }
    },
    buttonSkip: {
      backgroundColor: 'transparent',
      border: 'none',
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      outline: 'none',
      padding: '4px 8px',
      textDecoration: 'underline',
      transition: 'color 0.2s ease',
      ':hover': {
        color: isDarkMode ? '#D1D5DB' : '#374151'
      }
    },
    buttonClose: {
      backgroundColor: 'transparent',
      border: 'none',
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
      cursor: 'pointer',
      fontSize: '18px',
      height: '24px',
      outline: 'none',
      padding: '0',
      position: 'absolute' as const,
      right: '12px',
      top: '12px',
      width: '24px',
      ':hover': {
        color: isDarkMode ? '#D1D5DB' : '#374151'
      }
    },
    spotlight: {
      borderRadius: '8px'
    }
  }

  const customizedSteps: Step[] = steps.map((step, index) => ({
    ...step,
    content: (
      <div>
        <div className="mb-3">
          {step.content}
        </div>
        {!isShowingDoubleClickTip && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === index
                      ? 'bg-blue-500 w-6'
                      : i < index
                      ? 'bg-blue-300 dark:bg-blue-700'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {index + 1} de {steps.length}
            </div>
          </div>
        )}
      </div>
    )
  }))

  return (
    <Joyride
      steps={customizedSteps}
      run={isOnboardingActive}
      stepIndex={currentStep}
      callback={handleJoyrideCallback}
      continuous={!isShowingDoubleClickTip}
      showSkipButton={!isShowingDoubleClickTip}
      showProgress={false}
      hideCloseButton={false}
      scrollToFirstStep={true}
      disableOverlayClose={false}
      disableScrolling={false}
      spotlightClicks={false}
      spotlightPadding={8}
      styles={joyrideStyles}
      locale={{
        back: '← Anterior',
        close: 'Fechar',
        last: isShowingDoubleClickTip ? 'Entendi! 👍' : 'Finalizar ✨',
        next: 'Próximo →',
        skip: 'Pular tutorial',
        open: 'Abrir tutorial'
      }}
      floaterProps={{
        disableAnimation: false,
        hideArrow: false,
        offset: 10
      }}
    />
  )
}

export default OnboardingTour