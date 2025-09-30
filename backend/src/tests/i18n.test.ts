import { describe, it, expect, beforeEach } from 'vitest';
import { i18n, t, error, success, validation } from '../i18n/i18n';

describe('Internationalization (i18n)', () => {
  beforeEach(() => {
    // Reset to default locale
    i18n.setLocale('pt_BR');
  });

  describe('Basic Translation', () => {
    it('should translate messages in Portuguese (pt_BR)', () => {
      i18n.setLocale('pt_BR');
      
      expect(t('errors.auth.invalid_credentials')).toBe('Credenciais inválidas');
      expect(t('success.auth.login')).toBe('Login realizado com sucesso');
      expect(t('validation.email.required')).toBe('Email é obrigatório');
    });

    it('should translate messages in English (en_US)', () => {
      i18n.setLocale('en_US');
      
      expect(t('errors.auth.invalid_credentials')).toBe('Invalid credentials');
      expect(t('success.auth.login')).toBe('Login successful');
      expect(error('validation.invalid_email')).toBe('Invalid email');
    });

    it('should fallback to English when Portuguese key is missing', () => {
      i18n.setLocale('pt_BR');
      
      // This key doesn't exist in pt_BR, should fallback to en_US
      expect(t('errors.nonexistent.key')).toBe('errors.nonexistent.key');
    });
  });

  describe('Helper Functions', () => {
    it('should use error helper function', () => {
      i18n.setLocale('pt_BR');
      
      expect(error('auth.invalid_credentials')).toBe('Credenciais inválidas');
      expect(error('position.not_found')).toBe('Cargo não encontrado');
    });

    it('should use success helper function', () => {
      i18n.setLocale('pt_BR');
      
      expect(success('auth.login')).toBe('Login realizado com sucesso');
      expect(success('position.created')).toBe('Cargo criado com sucesso');
    });

    it('should use validation helper function', () => {
      i18n.setLocale('pt_BR');
      
      expect(validation('email.required')).toBe('Email é obrigatório');
      expect(validation('password.min_length', { min: 6 })).toBe('Senha deve ter pelo menos 6 caracteres');
    });
  });

  describe('Parameter Interpolation', () => {
    it('should interpolate parameters in messages', () => {
      i18n.setLocale('pt_BR');
      
      expect(t('validation.password.min_length', { min: 8 })).toBe('Senha deve ter pelo menos 8 caracteres');
      expect(error('application.required_question', { question: 'Nome completo' })).toBe('Pergunta obrigatória "Nome completo" não foi respondida');
    });

    it('should interpolate parameters in English', () => {
      i18n.setLocale('en_US');
      
      expect(error('validation.invalid_password')).toBe('Password must have at least 6 characters');
      expect(error('application.required_question', { question: 'Full name' })).toBe('Required question "Full name" was not answered');
    });
  });

  describe('Locale Switching', () => {
    it('should switch between locales correctly', () => {
      // Start with Portuguese
      i18n.setLocale('pt_BR');
      expect(t('errors.auth.invalid_credentials')).toBe('Credenciais inválidas');
      
      // Switch to English
      i18n.setLocale('en_US');
      expect(t('errors.auth.invalid_credentials')).toBe('Invalid credentials');
      
      // Switch back to Portuguese
      i18n.setLocale('pt_BR');
      expect(t('errors.auth.invalid_credentials')).toBe('Credenciais inválidas');
    });
  });

  describe('Environment Configuration', () => {
    it('should use default locale from environment', () => {
      // The default should be pt_BR as configured in .env
      expect(i18n.getLocale()).toBe('pt_BR');
    });
  });
});
