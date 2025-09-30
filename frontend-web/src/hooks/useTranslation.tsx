import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Hook personalizado para usar traduções
 * Fornece métodos para traduzir textos e gerenciar idiomas
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  /**
   * Traduz uma chave de tradução
   * @param key - Chave da tradução (ex: 'auth.login.title')
   * @param options - Opções de interpolação
   * @returns Texto traduzido
   */
  const translate = (key: string, options?: any) => {
    return t(key, options);
  };

  /**
   * Muda o idioma atual
   * @param language - Código do idioma (ex: 'pt_BR', 'en_US')
   */
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  /**
   * Obtém o idioma atual
   * @returns Código do idioma atual
   */
  const getCurrentLanguage = () => {
    return i18n.language;
  };

  /**
   * Verifica se está carregando as traduções
   * @returns true se estiver carregando
   */
  const isLoading = () => {
    return !i18n.isInitialized;
  };

  return {
    t: translate,
    changeLanguage,
    getCurrentLanguage,
    isLoading,
    // Expor o i18n original para casos avançados
    i18n
  };
};
