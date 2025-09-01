import React, { useEffect, useState } from 'react'
import { CheckCircleIcon, XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 4000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !isAnimating) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'error':
        return <XMarkIcon className="h-5 w-5" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'info':
        return <InformationCircleIcon className="h-5 w-5" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
    }
  }

  return (
    <div className="fixed top-6 right-6 z-[100]">
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm',
          'transition-all duration-300 transform',
          getColors(),
          isAnimating 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        )}
      >
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <p className="font-medium text-sm">{message}</p>
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast