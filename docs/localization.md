# BuildRunner Localization Guide

This guide covers how to add new languages, manage translations, and work with BuildRunner's internationalization (i18n) system.

## Overview

BuildRunner supports multiple languages through a comprehensive i18n system that includes:
- JSON-based translation files
- Dynamic language switching
- AI-powered translation assistance
- Translation management dashboard
- Governance compliance for translation coverage

## Supported Languages

### Currently Supported
- **English (en)** - Default/fallback language
- **Spanish (es)** - Español
- **French (fr)** - Français
- **German (de)** - Deutsch

### Planned Languages
- Portuguese (pt) - Português
- Italian (it) - Italiano
- Japanese (ja) - 日本語
- Korean (ko) - 한국어
- Chinese (zh) - 中文
- Arabic (ar) - العربية

## Translation File Structure

Translation files are located in `/apps/web/i18n/` and follow a nested JSON structure:

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "projects": "Projects",
    "settings": "Settings"
  },
  "button": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "form": {
    "name": "Name",
    "description": "Description",
    "email": "Email"
  }
}
```

### Translation Namespaces

Translations are organized into logical namespaces:

- **common**: UI elements, buttons, navigation
- **auth**: Authentication and authorization
- **projects**: Project management
- **planning**: Project planning and specs
- **analytics**: Analytics and reporting
- **governance**: Governance and compliance
- **billing**: Billing and subscriptions
- **admin**: Admin panel
- **a11y**: Accessibility labels and messages
- **errors**: Error messages
- **validation**: Form validation messages

## Adding a New Language

### 1. Create Translation File

Create a new JSON file in `/apps/web/i18n/` named with the language code:

```bash
# Example: Adding Portuguese
cp apps/web/i18n/en.json apps/web/i18n/pt.json
```

### 2. Update Configuration

Add the new language to the configuration in `/apps/web/i18n/config.ts`:

```typescript
export const locales: LocaleConfig[] = [
  // ... existing locales
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false,
    enabled: true,
  },
];
```

### 3. Update Database

Add the language to the database:

```sql
INSERT INTO languages (code, name, native_name, enabled) 
VALUES ('pt', 'Portuguese', 'Português', true);
```

### 4. Translate Content

Translate all keys in the new language file. You can use:
- Manual translation
- AI translation helper (see below)
- Professional translation services

### 5. Test the Implementation

1. Start the development server
2. Use the language switcher to select the new language
3. Navigate through the application to verify translations
4. Check for missing translations (they will fall back to English)

## Using the Translation Management Dashboard

### Accessing the Dashboard

Navigate to `/settings/translations` in the BuildRunner admin panel.

### Features

**Translation List**: View all translation keys and their values across languages
**Edit Translations**: Modify translations directly in the interface
**Verification Status**: Mark translations as verified by native speakers
**Coverage Reports**: See translation completion percentage by language
**Missing Keys**: Identify untranslated content

### Workflow

1. **Review**: Check existing translations for accuracy
2. **Translate**: Add missing translations for new keys
3. **Verify**: Mark translations as verified after review
4. **Publish**: Changes are automatically saved and deployed

## AI Translation Helper

BuildRunner includes an AI-powered translation assistant for faster localization.

### Using AI Translation

1. Navigate to the translation dashboard
2. Select the target language
3. Click "AI Translate" for missing keys
4. Review and verify AI-generated translations
5. Make manual adjustments as needed

### API Usage

You can also use the AI translation API directly:

```bash
curl -X POST /api/ai/translate \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "keys": ["nav.dashboard", "button.save"],
    "targetLocale": "es",
    "namespace": "common"
  }'
```

### Best Practices for AI Translation

- **Always review**: AI translations should be verified by native speakers
- **Context matters**: Provide context for ambiguous terms
- **Cultural adaptation**: Adapt content for local cultures, not just language
- **Technical terms**: Verify technical terminology is appropriate

## Translation Best Practices

### Writing Translatable Content

1. **Use clear, simple language**
2. **Avoid idioms and colloquialisms**
3. **Provide context for translators**
4. **Keep strings atomic** (don't concatenate)
5. **Use placeholders for dynamic content**

### Example: Good vs Bad

```json
// ❌ Bad: Concatenated strings
{
  "welcome_part1": "Welcome",
  "welcome_part2": "to BuildRunner"
}

// ✅ Good: Complete string with placeholder
{
  "welcome": "Welcome to {appName}"
}
```

### Handling Pluralization

Use ICU message format for pluralization:

```json
{
  "item_count": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}
```

### Date and Number Formatting

Use locale-aware formatting:

```typescript
// Dates
const date = new Date().toLocaleDateString(locale);

// Numbers
const number = (1234.56).toLocaleString(locale);

// Currency
const price = (99.99).toLocaleString(locale, {
  style: 'currency',
  currency: 'USD'
});
```

## HRPO Localization

BuildRunner's Human-Readable Project Outputs (HRPO) can be localized for different languages.

### Localizing HRPO Content

1. **Template Translation**: Translate HRPO templates for each language
2. **Dynamic Content**: Use locale-aware content generation
3. **Cultural Adaptation**: Adapt examples and references for local contexts

### Example HRPO Localization

```typescript
// English HRPO
const hrpoEn = {
  title: "Project Setup Phase",
  description: "Initialize the project structure and dependencies",
  steps: ["Create repository", "Setup package.json", "Install dependencies"]
};

// Spanish HRPO
const hrpoEs = {
  title: "Fase de Configuración del Proyecto",
  description: "Inicializar la estructura del proyecto y las dependencias",
  steps: ["Crear repositorio", "Configurar package.json", "Instalar dependencias"]
};
```

## Governance and Compliance

### Translation Coverage Requirements

The governance policy defines minimum translation coverage:

```yaml
i18n:
  translation_coverage:
    minimum_percentage: 90
    enforce_on_build: true
```

### CI/CD Integration

The CI pipeline checks translation coverage:

```bash
# Check coverage
npm run i18n:check-coverage

# Generate missing translation report
npm run i18n:missing-keys
```

### Quality Gates

- **Coverage Threshold**: Minimum 90% translation coverage
- **Verification Requirement**: Critical translations must be verified
- **Consistency Checks**: Automated checks for translation consistency

## Testing Localized Content

### Manual Testing

1. **Language Switching**: Test the language switcher functionality
2. **Content Display**: Verify all content displays correctly
3. **Layout Issues**: Check for text overflow or layout breaks
4. **Cultural Appropriateness**: Ensure content is culturally appropriate

### Automated Testing

```typescript
// Example: Testing translation coverage
describe('i18n Coverage', () => {
  test('all supported locales have required keys', () => {
    const requiredKeys = getRequiredTranslationKeys();
    
    supportedLocales.forEach(locale => {
      const translations = loadTranslations(locale);
      requiredKeys.forEach(key => {
        expect(translations).toHaveProperty(key);
      });
    });
  });
});
```

### Accessibility Testing

Ensure localized content maintains accessibility:
- Screen reader compatibility
- Proper language attributes
- RTL language support (for Arabic, Hebrew)

## Troubleshooting

### Common Issues

**Missing Translations**
- Check the translation file exists
- Verify the key path is correct
- Ensure the locale is enabled

**Layout Issues**
- Test with longer text (German, Finnish)
- Check RTL languages (Arabic, Hebrew)
- Verify responsive design works

**Performance Issues**
- Lazy load translation files
- Use translation caching
- Minimize bundle size

### Debug Mode

Enable debug mode to see missing translations:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.warn(`Missing translation: ${key} for locale: ${locale}`);
}
```

## Contributing Translations

### For Translators

1. **Access**: Request access to the translation dashboard
2. **Guidelines**: Follow the translation style guide
3. **Review**: Submit translations for review
4. **Feedback**: Respond to reviewer feedback

### For Developers

1. **New Keys**: Add new translation keys to all supported languages
2. **Context**: Provide context and examples for translators
3. **Testing**: Test with different languages during development
4. **Documentation**: Update this guide when adding new features

## Resources

### Translation Tools
- [Google Translate](https://translate.google.com/) - Quick translations
- [DeepL](https://www.deepl.com/) - High-quality translations
- [Crowdin](https://crowdin.com/) - Translation management platform

### Style Guides
- [Microsoft Style Guides](https://docs.microsoft.com/en-us/style-guide/) - Language-specific style guides
- [Google Developer Documentation Style Guide](https://developers.google.com/style) - Technical writing guidelines

### Testing Tools
- [BrowserStack](https://www.browserstack.com/) - Cross-browser testing
- [Pseudo Localization](https://github.com/tryggvigy/pseudo-localization) - Testing tool for i18n

## Support

For questions about localization:
- **Email**: i18n@buildrunner.com
- **Slack**: #localization channel
- **Documentation**: This guide and inline code comments

For translation requests or issues:
- **Translation Dashboard**: `/settings/translations`
- **GitHub Issues**: Tag with `i18n` label
- **Support Portal**: [https://support.buildrunner.com](https://support.buildrunner.com)
