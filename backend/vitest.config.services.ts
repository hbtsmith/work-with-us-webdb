import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage-services',
      include: [
        'src/services/**/*.ts',
        'src/i18n/**/*.ts',
        'src/database/**/*.ts',
        'src/utils/**/*.ts'
      ],
      exclude: [
        'src/controllers/**/*',
        'src/routes/**/*',
        'src/middlewares/**/*',
        'src/schemas/**/*',
        'src/swagger/**/*',
        'src/types/**/*',
        'scripts/**/*',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
