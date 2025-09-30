import { setupTestDatabase } from './setup.js';

export async function setup() {
  console.log('🧪 Setting up test environment...');
  
  // Set test environment variables
  process.env['NODE_ENV'] = 'test';
  process.env['DEFAULT_LOCALE'] = 'pt_BR';
  process.env['FALLBACK_LOCALE'] = 'en_US';
  process.env['DATABASE_URL'] = 'mysql://root:root@localhost:3306/work_with_us_test_db';
  process.env['JWT_SECRET'] = 'test-secret-key-for-testing-only';
  
  console.log('📁 Set test environment variables, DEFAULT_LOCALE:', process.env['DEFAULT_LOCALE']);
  
  // Setup test database
  await setupTestDatabase();
  
  console.log('✅ Test environment setup complete');
}

export async function teardown() {
  console.log('🧹 Cleaning up test environment...');
  // Cleanup is handled by individual tests
  console.log('✅ Test environment cleanup complete');
}