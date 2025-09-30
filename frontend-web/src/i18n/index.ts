import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar as traduções
import ptBR from './locales/pt_BR.json';
import enUS from './locales/en_US.json';

// Configuração do i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Idioma padrão do .env ou fallback para pt_BR
    lng: (import.meta as any).env?.VITE_DEFAULT_LOCALE || 'pt_BR',
    fallbackLng: (import.meta as any).env?.VITE_FALLBACK_LOCALE || 'en_US',
    
    // Recursos de tradução
    resources: {
      pt_BR: {
        translation: ptBR
      },
      en_US: {
        translation: enUS
      }
    },
    
    // Configurações de detecção de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    // Configurações de interpolação
    interpolation: {
      escapeValue: false // React já faz escape por padrão
    },
    
    // Configurações de debug (desabilitado)
    debug: false
  });

export default i18n;
