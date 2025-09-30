import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export type SupportedLocale = 'en_US' | 'pt_BR';

export interface I18nConfig {
  defaultLocale: SupportedLocale;
  fallbackLocale: SupportedLocale;
}

export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

class I18nService {
  private messages: Map<SupportedLocale, TranslationMessages> = new Map();
  private currentLocale: SupportedLocale;
  private fallbackLocale: SupportedLocale;

  constructor() {
    this.currentLocale = (process.env['DEFAULT_LOCALE'] as SupportedLocale) || 'pt_BR';
    this.fallbackLocale = (process.env['FALLBACK_LOCALE'] as SupportedLocale) || 'en_US';
    this.loadMessages();
  }

  private loadMessages() {
    const locales: SupportedLocale[] = ['en_US', 'pt_BR'];
    
    for (const locale of locales) {
      try {
        const filePath = join(__dirname, 'locales', `${locale}.json`);
        const messages = JSON.parse(readFileSync(filePath, 'utf-8'));
        this.messages.set(locale, messages);
      } catch (error) {
        console.warn(`Failed to load messages for locale ${locale}:`, error);
      }
    }
  }

  public setLocale(locale: SupportedLocale): void {
    this.currentLocale = locale;
  }

  public getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  public t(key: string, params?: Record<string, string | number>): string {
    const message = this.getMessage(key, this.currentLocale) || 
                   this.getMessage(key, this.fallbackLocale) || 
                   key;

    return this.interpolate(message, params);
  }

  private getMessage(key: string, locale: SupportedLocale): string | null {
    const messages = this.messages.get(locale);
    if (!messages) return null;

    const keys = key.split('.');
    let current: any = messages;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  private interpolate(message: string, params?: Record<string, string | number>): string {
    if (!params) return message;

    return message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Helper methods for common error patterns
  public error(key: string, params?: Record<string, string | number>): string {
    return this.t(`errors.${key}`, params);
  }

  public success(key: string, params?: Record<string, string | number>): string {
    return this.t(`success.${key}`, params);
  }

  public validation(key: string, params?: Record<string, string | number>): string {
    return this.t(`validation.${key}`, params);
  }
}

// Singleton instance
export const i18n = new I18nService();

// Convenience functions
export const t = (key: string, params?: Record<string, string | number>) => i18n.t(key, params);
export const error = (key: string, params?: Record<string, string | number>) => i18n.error(key, params);
export const success = (key: string, params?: Record<string, string | number>) => i18n.success(key, params);
export const validation = (key: string, params?: Record<string, string | number>) => i18n.validation(key, params);
