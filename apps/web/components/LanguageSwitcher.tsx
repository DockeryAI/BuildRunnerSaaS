'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { locales, type Locale, getLocaleConfig, isValidLocale, localeCookieConfig } from '../i18n/config';

interface LanguageSwitcherProps {
  currentLocale?: string;
  onLocaleChange?: (locale: Locale) => void;
  className?: string;
  variant?: 'dropdown' | 'inline' | 'compact';
  showFlag?: boolean;
  showNativeName?: boolean;
}

export default function LanguageSwitcher({
  currentLocale = 'en',
  onLocaleChange,
  className = '',
  variant = 'dropdown',
  showFlag = true,
  showNativeName = true,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    isValidLocale(currentLocale) ? currentLocale : 'en'
  );

  // Get current locale configuration
  const currentConfig = getLocaleConfig(selectedLocale);
  const enabledLocales = locales.filter(locale => locale.enabled);

  // Handle locale change
  const handleLocaleChange = (locale: Locale) => {
    setSelectedLocale(locale);
    setIsOpen(false);

    // Persist locale in cookie
    document.cookie = `${localeCookieConfig.name}=${locale}; max-age=${localeCookieConfig.maxAge}; path=${localeCookieConfig.path}; samesite=${localeCookieConfig.sameSite}${localeCookieConfig.secure ? '; secure' : ''}`;

    // Trigger callback
    onLocaleChange?.(locale);

    // Reload page to apply new locale
    window.location.reload();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-language-switcher]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  // Compact variant (just flag + code)
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} data-language-switcher>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          aria-label={`Current language: ${currentConfig?.nativeName}. Click to change language.`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {showFlag && currentConfig && (
            <span className="text-base" role="img" aria-hidden="true">
              {currentConfig.flag}
            </span>
          )}
          <span className="font-medium uppercase">{selectedLocale}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1" role="listbox" aria-label="Language options">
              {enabledLocales.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => handleLocaleChange(locale.code)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between ${
                    locale.code === selectedLocale ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={locale.code === selectedLocale}
                >
                  <div className="flex items-center space-x-2">
                    {showFlag && (
                      <span className="text-base" role="img" aria-hidden="true">
                        {locale.flag}
                      </span>
                    )}
                    <div>
                      <div className="font-medium">{locale.name}</div>
                      {showNativeName && locale.nativeName !== locale.name && (
                        <div className="text-xs text-gray-500">{locale.nativeName}</div>
                      )}
                    </div>
                  </div>
                  {locale.code === selectedLocale && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Inline variant (horizontal list)
  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`} data-language-switcher>
        <Globe className="h-4 w-4 text-gray-500" />
        <div className="flex items-center space-x-1">
          {enabledLocales.map((locale, index) => (
            <React.Fragment key={locale.code}>
              <button
                onClick={() => handleLocaleChange(locale.code)}
                className={`px-2 py-1 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  locale.code === selectedLocale
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label={`Switch to ${locale.nativeName}`}
                aria-current={locale.code === selectedLocale ? 'true' : 'false'}
              >
                {showFlag && (
                  <span className="mr-1" role="img" aria-hidden="true">
                    {locale.flag}
                  </span>
                )}
                {locale.code.toUpperCase()}
              </button>
              {index < enabledLocales.length - 1 && (
                <span className="text-gray-300">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} data-language-switcher>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Current language: ${currentConfig?.nativeName}. Click to change language.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4 text-gray-500" />
        {currentConfig && (
          <>
            {showFlag && (
              <span className="text-base" role="img" aria-hidden="true">
                {currentConfig.flag}
              </span>
            )}
            <span className="font-medium">
              {showNativeName ? currentConfig.nativeName : currentConfig.name}
            </span>
          </>
        )}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1" role="listbox" aria-label="Language options">
            {enabledLocales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLocaleChange(locale.code)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between ${
                  locale.code === selectedLocale ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                role="option"
                aria-selected={locale.code === selectedLocale}
              >
                <div className="flex items-center space-x-3">
                  {showFlag && (
                    <span className="text-lg" role="img" aria-hidden="true">
                      {locale.flag}
                    </span>
                  )}
                  <div>
                    <div className="font-medium">{locale.name}</div>
                    {showNativeName && locale.nativeName !== locale.name && (
                      <div className="text-xs text-gray-500">{locale.nativeName}</div>
                    )}
                  </div>
                </div>
                {locale.code === selectedLocale && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for using language switcher in components
export function useLanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  useEffect(() => {
    // Get locale from cookie or URL
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${localeCookieConfig.name}=`)
    );
    
    if (localeCookie) {
      const locale = localeCookie.split('=')[1];
      if (isValidLocale(locale)) {
        setCurrentLocale(locale);
      }
    }
  }, []);

  const changeLocale = (locale: Locale) => {
    setCurrentLocale(locale);
    
    // Update cookie
    document.cookie = `${localeCookieConfig.name}=${locale}; max-age=${localeCookieConfig.maxAge}; path=${localeCookieConfig.path}; samesite=${localeCookieConfig.sameSite}${localeCookieConfig.secure ? '; secure' : ''}`;
    
    // Reload to apply new locale
    window.location.reload();
  };

  return {
    currentLocale,
    changeLocale,
    availableLocales: locales.filter(locale => locale.enabled),
  };
}
