// Application Constants
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Work With Us',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  THEME_TOGGLE: import.meta.env.VITE_ENABLE_THEME_TOGGLE === 'true',
} as const;

// Internationalization
export const I18N_CONFIG = {
  DEFAULT_LOCALE: import.meta.env.VITE_DEFAULT_LOCALE || 'pt_BR',
  SUPPORTED_LOCALES: (import.meta.env.VITE_SUPPORTED_LOCALES || 'pt_BR,en_US').split(','),
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'light',
  STORAGE_KEY: 'work-with-us-theme',
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'pdf,doc,docx').split(','),
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 60 * 60 * 1000, // 1 hour
  REFRESH_INTERVAL: Number(import.meta.env.VITE_REFRESH_TOKEN_INTERVAL) || 5 * 60 * 1000, // 5 minutes
} as const;

// UI Constants
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Routes
export const ROUTES = {
  // Public Routes (No authentication required)
  LOGIN: '/login',
  APPLICATION: '/application', // Base path for /application/:slug
  
  // Admin Routes (Authentication required)
  HOME: '/',
  DASHBOARD: '/dashboard',
  JOBS: '/jobs',
  APPLICATIONS: '/applications',
  POSITIONS: '/positions',
  CHANGE_PASSWORD: '/change-password',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'work-with-us-token',
  USER: 'work-with-us-user',
  THEME: 'work-with-us-theme',
  LOCALE: 'work-with-us-locale',
} as const;
