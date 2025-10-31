/**
 * Internationalization (i18n) Configuration
 * 
 * This file configures the internationalization settings for BuildRunner,
 * including supported locales, default locale, and locale detection.
 */

export type Locale = 'en' | 'es' | 'fr' | 'de';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  enabled: boolean;
}

/**
 * Supported locales configuration
 */
export const locales: LocaleConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    enabled: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    enabled: true,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    enabled: true,
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    enabled: true,
  },
];

/**
 * Default locale (fallback)
 */
export const defaultLocale: Locale = 'en';

/**
 * Get enabled locales only
 */
export const enabledLocales = locales.filter(locale => locale.enabled);

/**
 * Get locale codes only
 */
export const localeCodes = enabledLocales.map(locale => locale.code);

/**
 * Get locale configuration by code
 */
export function getLocaleConfig(code: string): LocaleConfig | undefined {
  return locales.find(locale => locale.code === code);
}

/**
 * Check if a locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return localeCodes.includes(locale as Locale);
}

/**
 * Get the best matching locale from user preferences
 */
export function getBestMatchingLocale(
  acceptLanguage?: string,
  cookieLocale?: string,
  urlLocale?: string
): Locale {
  // Priority: URL > Cookie > Accept-Language > Default
  
  // 1. Check URL locale
  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }
  
  // 2. Check cookie locale
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }
  
  // 3. Check Accept-Language header
  if (acceptLanguage) {
    const preferredLocales = parseAcceptLanguage(acceptLanguage);
    for (const preferredLocale of preferredLocales) {
      if (isValidLocale(preferredLocale)) {
        return preferredLocale;
      }
    }
  }
  
  // 4. Return default locale
  return defaultLocale;
}

/**
 * Parse Accept-Language header
 */
function parseAcceptLanguage(acceptLanguage: string): string[] {
  return acceptLanguage
    .split(',')
    .map(lang => {
      const [code, quality] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Extract language code only
        quality: quality ? parseFloat(quality) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality)
    .map(lang => lang.code);
}

/**
 * i18n configuration for next-intl or similar libraries
 */
export const i18nConfig = {
  defaultLocale,
  locales: localeCodes,
  localeDetection: true,
  domains: [
    {
      domain: 'buildrunner.com',
      defaultLocale: 'en',
    },
    {
      domain: 'es.buildrunner.com',
      defaultLocale: 'es',
    },
    {
      domain: 'fr.buildrunner.com',
      defaultLocale: 'fr',
    },
    {
      domain: 'de.buildrunner.com',
      defaultLocale: 'de',
    },
  ],
};

/**
 * Namespace configuration for organizing translations
 */
export const namespaces = [
  'common',      // Common UI elements (buttons, forms, navigation)
  'auth',        // Authentication and authorization
  'projects',    // Project management
  'planning',    // Project planning and specs
  'analytics',   // Analytics and reporting
  'governance',  // Governance and compliance
  'billing',     // Billing and subscriptions
  'admin',       // Admin panel
  'a11y',        // Accessibility labels and messages
  'errors',      // Error messages
  'validation',  // Form validation messages
] as const;

export type Namespace = typeof namespaces[number];

/**
 * Translation key structure for type safety
 */
export interface TranslationKeys {
  // Navigation
  'nav.dashboard': string;
  'nav.projects': string;
  'nav.analytics': string;
  'nav.settings': string;
  'nav.admin': string;
  'nav.help': string;
  
  // Buttons
  'button.save': string;
  'button.cancel': string;
  'button.delete': string;
  'button.edit': string;
  'button.create': string;
  'button.update': string;
  
  // Forms
  'form.name': string;
  'form.description': string;
  'form.email': string;
  'form.password': string;
  
  // Status
  'status.loading': string;
  'status.error': string;
  'status.success': string;
  'status.warning': string;
  
  // Accessibility
  'accessibility.skip_to_content': string;
  'accessibility.menu_toggle': string;
  'accessibility.close_dialog': string;
  'accessibility.loading': string;
}

/**
 * Cookie configuration for locale persistence
 */
export const localeCookieConfig = {
  name: 'buildrunner-locale',
  maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * URL patterns for locale routing
 */
export const localeRouting = {
  strategy: 'prefix' as const, // /en/dashboard, /es/dashboard, etc.
  prefixDefault: false, // Don't prefix default locale
};

/**
 * Development helpers
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log('🌍 i18n Configuration loaded:');
  console.log(`  Default locale: ${defaultLocale}`);
  console.log(`  Supported locales: ${localeCodes.join(', ')}`);
  console.log(`  Enabled locales: ${enabledLocales.length}/${locales.length}`);
  console.log(`  Namespaces: ${namespaces.join(', ')}`);
}
