import React, { useState, useRef, useEffect } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { filterLanguages, getLanguageDisplayName } from '../utils/languages'
import { getLanguageColor, getLightColor } from '../utils/colors'
import clsx from 'clsx'

interface LanguageAutocompleteProps {
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  className?: string
}

const LanguageAutocomplete: React.FC<LanguageAutocompleteProps> = ({
  value,
  onChange,
  error,
  placeholder = "Ex: JavaScript, Python...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredLanguages, setFilteredLanguages] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      const filtered = filterLanguages(value)
      setFilteredLanguages(filtered)
      setIsOpen(filtered.length > 0 && document.activeElement === inputRef.current)
    } else {
      setFilteredLanguages([])
      setIsOpen(false)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredLanguages.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          selectLanguage(filteredLanguages[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const selectLanguage = (language: string) => {
    onChange(language)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    if (value && filteredLanguages.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className={clsx(
            'w-full px-4 py-3 pr-10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900',
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
            className
          )}
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Current language indicator */}
      {value && (
        <div className="mt-2">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
            style={{
              backgroundColor: getLightColor(getLanguageColor(value), 0.1),
              color: getLanguageColor(value),
              borderColor: getLightColor(getLanguageColor(value), 0.3),
              border: '1px solid'
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getLanguageColor(value) }}
            />
            {getLanguageDisplayName(value)}
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && filteredLanguages.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto"
        >
          {filteredLanguages.map((language, index) => (
            <button
              key={language}
              onClick={() => selectLanguage(language)}
              className={clsx(
                'w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                highlightedIndex === index && 'bg-blue-50 dark:bg-blue-900/20',
                index === 0 && 'rounded-t-xl',
                index === filteredLanguages.length - 1 && 'rounded-b-xl'
              )}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getLanguageColor(language) }}
              />
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {getLanguageDisplayName(language)}
              </span>
              {language !== getLanguageDisplayName(language).toLowerCase() && (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {language}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
          {error}
        </p>
      )}
    </div>
  )
}

export default LanguageAutocomplete