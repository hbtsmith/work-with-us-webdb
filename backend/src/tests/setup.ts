import { execSync } from 'child_process';
import { randomBytes } from 'crypto';
import { i18n } from '../i18n/i18n';
import { prisma } from '../database/client';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

// Global test isolation
let testTransaction: any = null;

export async function setupTestDatabase() {
  // Set test locale to Portuguese for consistent test expectations
  i18n.setLocale('pt_BR');
  
  // Create a unique test database
  const testDbName = `test_${randomBytes(8).toString('hex')}`;
  
  // Create test database
  const mysqlPassword = process.env['MYSQL_ROOT_PASSWORD'] || 'root';
  execSync(`mysql -u root -p${mysqlPassword} -e "CREATE DATABASE IF NOT EXISTS ${testDbName};"`);
  
  // Update DATABASE_URL for tests
  process.env['DATABASE_URL'] = `mysql://root:${mysqlPassword}@localhost:3306/${testDbName}`;
  
  // Generate Prisma client with new URL
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push schema to test database
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Force Prisma client to reconnect with new DATABASE_URL
  await prisma.$disconnect();
  await prisma.$connect();
  
  return testDbName;
}

export async function cleanupTestDatabase(testDbName: string) {
  // Drop test database
  const mysqlPassword = process.env['MYSQL_ROOT_PASSWORD'] || 'root';
  execSync(`mysql -u root -p${mysqlPassword} -e "DROP DATABASE IF EXISTS ${testDbName};"`);
}

export async function seedTestData() {
  // Use the same Prisma client as the application
  const { prisma: appPrisma } = await import('../database/client');
  
  // Get credentials from .env.test
  const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@test.com';
  const adminPassword = process.env['ADMIN_PASSWORD'] || 'test123';
  
  // Create test admin (upsert to avoid conflicts)
  const hashedPassword = await import('bcryptjs').then(bcrypt => 
    bcrypt.hash(adminPassword, 12)
  );
  
  const admin = await appPrisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      isFirstLogin: false,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      isFirstLogin: false,
    },
  });
  
  // Create test position
  const position = await appPrisma.position.create({
    data: {
      title: 'Test Developer',
      level: 'Mid-level',
      salaryRange: 'R$ 5.000 - R$ 8.000',
    },
  });
  
  // Create test job
  const job = await appPrisma.job.create({
    data: {
      title: 'Test Job',
      description: 'Test job description',
      slug: 'test-job',
      requiresResume: false,
      positionId: position.id,
    },
    include: {
      position: true,
    },
  });
  
  // Create questions for the job
  await appPrisma.question.createMany({
    data: [
      {
        jobId: job.id,
        label: 'What is your experience?',
        type: 'SHORT_TEXT',
        isRequired: true,
        order: 1,
      },
      {
        jobId: job.id,
        label: 'Select your skills',
        type: 'MULTIPLE_CHOICE',
        isRequired: true,
        order: 2,
      },
    ],
  });
  
  // Create question options for the multiple choice question
  const multipleChoiceQuestion = await appPrisma.question.findFirst({
    where: { jobId: job.id, type: 'MULTIPLE_CHOICE' }
  });
  
  if (multipleChoiceQuestion) {
    await appPrisma.questionOption.createMany({
      data: [
        {
          questionId: multipleChoiceQuestion.id,
          label: 'JavaScript',
          orderIndex: 0,
        },
        {
          questionId: multipleChoiceQuestion.id,
          label: 'TypeScript',
          orderIndex: 1,
        },
      ],
    });
  }
  
  return { admin, position, job };
}

export async function cleanupTestData() {
  try {
    // Use the same Prisma client as the application
    const { prisma: appPrisma } = await import('../database/client');
    
    // Clean up in correct order to respect foreign key constraints
    await appPrisma.answer.deleteMany();
    await appPrisma.application.deleteMany();
    await appPrisma.question.deleteMany();
    await appPrisma.job.deleteMany();
    await appPrisma.position.deleteMany();
    await appPrisma.admin.deleteMany();
  } catch (error) {
    // If cleanup fails, try to reset the database
    console.warn('Cleanup failed, resetting database...');
    await resetDatabase();
  }
}

export async function resetDatabase() {
  try {
    // Drop and recreate the database
    execSync('mysql -u root -proot -e "DROP DATABASE IF EXISTS work_with_us_test_db; CREATE DATABASE work_with_us_test_db;"');
    execSync('npx prisma db push', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
}

export async function startTestTransaction(): Promise<any> {
  testTransaction = await prisma.$transaction(async (tx: any) => {
    return tx;
  });
  return testTransaction;
}

export async function rollbackTestTransaction() {
  if (testTransaction) {
    await testTransaction.$rollback();
    testTransaction = null;
  }
}

export function getTestPrisma() {
  return testTransaction || prisma;
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to create isolated test admin
export async function createTestAdmin() {
  const { prisma: appPrisma } = await import('../database/client');
  
  // Get credentials from .env.test
  const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@test.com';
  const adminPassword = process.env['ADMIN_PASSWORD'] || 'test123';
  
  const hashedPassword = await import('bcryptjs').then(bcrypt => 
    bcrypt.hash(adminPassword, 12)
  );
  
  const admin = await appPrisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      isFirstLogin: false,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      isFirstLogin: false,
    },
  });
  
  return admin;
}

// Helper function to login and get token via HTTP
export async function loginAndGetToken(app: any) {
  const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@test.com';
  const adminPassword = process.env['ADMIN_PASSWORD'] || 'test123';
  
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      email: adminEmail,
      password: adminPassword,
    },
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`Login failed: ${response.body}`);
  }
  
  const body = JSON.parse(response.body);
  return body.data.token;
}

// Helper function to create test positions for testing
export async function createTestPositions() {
  const { PositionService } = await import('../services/positionService');
  
  const positionService = new PositionService();
  
  // Create 3 different positions
  const positions = await Promise.all([
    positionService.createPosition({
      title: 'Desenvolvedor Frontend',
      level: 'Pleno',
      salaryRange: 'R$ 5.000 - R$ 8.000',
    }),
    positionService.createPosition({
      title: 'Desenvolvedor Backend',
      level: 'Sênior',
      salaryRange: 'R$ 8.000 - R$ 12.000',
    }),
    positionService.createPosition({
      title: 'Desenvolvedor Full Stack',
      level: 'Júnior',
      salaryRange: 'R$ 3.000 - R$ 5.000',
    }),
  ]);
  
  return positions;
}

// Helper function to create test job for testing
export async function createTestJob() {
  const { prisma: appPrisma } = await import('../database/client');
  
  // Create test positions first
  const positions = await createTestPositions();
  const position = positions[0]; // Use the first position (Frontend)
  
  // Create test job using the position
  const uniqueSlug = `vaga-desenvolvedor-frontend-${Date.now()}`;
  const job = await appPrisma.job.create({
    data: {
      title: 'Vaga de Desenvolvedor Frontend',
      description: 'Descrição da vaga de desenvolvedor frontend',
      slug: uniqueSlug,
      positionId: position.id,
      isActive: true,
      requiresResume: false,
    },
  });
  
  return { job, position, positions };
}

// Helper function to create test job data for HTTP requests
export function createTestJobData(positionId: string, options: {
  title?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
} = {}) {
  return {
    title: options.title || 'Desenvolvedor Frontend',
    description: options.description || 'Vaga para desenvolvedor frontend com React',
    slug: options.slug || 'desenvolvedor-frontend',
    positionId,
    isActive: options.isActive !== undefined ? options.isActive : true,
  };
}

// Helper function to create multiple test jobs via HTTP
export async function createTestJobsViaHTTP(app: any, adminToken: string, positionId: string) {
  const job1Data = createTestJobData(positionId, {
    title: 'Desenvolvedor Frontend',
    description: 'Vaga para desenvolvedor frontend com React',
    slug: 'desenvolvedor-frontend',
    isActive: true,
  });
  
  const job2Data = createTestJobData(positionId, {
    title: 'Desenvolvedor Backend',
    description: 'Vaga para desenvolvedor backend com Node.js',
    slug: 'desenvolvedor-backend',
    isActive: false,
  });

  // Create jobs via HTTP
  const job1Response = await app.inject({
    method: 'POST',
    url: '/api/jobs',
    payload: job1Data,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  
  const job2Response = await app.inject({
    method: 'POST',
    url: '/api/jobs',
    payload: job2Data,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  return {
    job1: JSON.parse(job1Response.body).data,
    job2: JSON.parse(job2Response.body).data,
    job1Data,
    job2Data,
  };
}

// Helper function to create test question data
export function createTestQuestionData(options: {
  label?: string;
  type?: 'SHORT_TEXT' | 'LONG_TEXT' | 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  isRequired?: boolean;
  order?: number;
  options?: Array<{ id: string; label: string; value: string }>;
} = {}) {
  return {
    label: options.label || 'Qual sua experiência?',
    type: options.type || 'SHORT_TEXT',
    isRequired: options.isRequired !== undefined ? options.isRequired : true,
    order: options.order || 1,
    options: options.options || undefined,
  };
}

// Helper function to create test job with questions via HTTP
export async function createTestJobWithQuestions(app: any, adminToken: string, positionId: string) {
  // Create job first
  const jobData = createTestJobData(positionId, {
    title: 'Vaga com Questões',
    description: 'Vaga para testar questões',
    slug: 'vaga-com-questoes',
    isActive: true,
  });

  const jobResponse = await app.inject({
    method: 'POST',
    url: '/api/jobs',
    payload: jobData,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const job = JSON.parse(jobResponse.body).data;

  // Create questions for the job
  const question1Data = createTestQuestionData({
    label: 'Qual sua experiência?',
    type: 'SHORT_TEXT',
    isRequired: true,
    order: 1,
  });

  const question2Data = createTestQuestionData({
    label: 'Selecione suas habilidades',
    type: 'MULTIPLE_CHOICE',
    isRequired: true,
    order: 2,
    options: [
      { id: 'opt1', label: 'JavaScript', value: 'javascript' },
      { id: 'opt2', label: 'TypeScript', value: 'typescript' },
      { id: 'opt3', label: 'React', value: 'react' },
    ],
  });

  const question3Data = createTestQuestionData({
    label: 'Conte-nos sobre você',
    type: 'LONG_TEXT',
    isRequired: false,
    order: 3,
  });

  // Create questions via HTTP
  const question1Response = await app.inject({
    method: 'POST',
    url: `/api/jobs/${job.id}/questions`,
    payload: question1Data,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const question2Response = await app.inject({
    method: 'POST',
    url: `/api/jobs/${job.id}/questions`,
    payload: question2Data,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const question3Response = await app.inject({
    method: 'POST',
    url: `/api/jobs/${job.id}/questions`,
    payload: question3Data,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  return {
    job,
    jobData,
    question1: JSON.parse(question1Response.body).data,
    question2: JSON.parse(question2Response.body).data,
    question3: JSON.parse(question3Response.body).data,
    question1Data,
    question2Data,
    question3Data,
  };
}

// Helper functions to create specific question types
export function createShortTextQuestion(options: {
  label?: string;
  isRequired?: boolean;
  order?: number;
} = {}) {
  return createTestQuestionData({
    label: options.label || 'Qual sua experiência?',
    type: 'SHORT_TEXT',
    isRequired: options.isRequired !== undefined ? options.isRequired : true,
    order: options.order || 1,
  });
}

export function createLongTextQuestion(options: {
  label?: string;
  isRequired?: boolean;
  order?: number;
} = {}) {
  return createTestQuestionData({
    label: options.label || 'Conte-nos sobre você',
    type: 'LONG_TEXT',
    isRequired: options.isRequired !== undefined ? options.isRequired : false,
    order: options.order || 1,
  });
}

export function createMultipleChoiceQuestion(options: {
  label?: string;
  isRequired?: boolean;
  order?: number;
  options?: Array<{ id: string; label: string; value: string }>;
} = {}) {
  return createTestQuestionData({
    label: options.label || 'Selecione suas habilidades',
    type: 'MULTIPLE_CHOICE',
    isRequired: options.isRequired !== undefined ? options.isRequired : true,
    order: options.order || 1,
    options: options.options || [
      { id: 'opt1', label: 'JavaScript', value: 'javascript' },
      { id: 'opt2', label: 'TypeScript', value: 'typescript' },
      { id: 'opt3', label: 'React', value: 'react' },
      { id: 'opt4', label: 'Node.js', value: 'nodejs' },
    ],
  });
}

export function createSingleChoiceQuestion(options: {
  label?: string;
  isRequired?: boolean;
  order?: number;
  options?: Array<{ id: string; label: string; value: string }>;
} = {}) {
  return createTestQuestionData({
    label: options.label || 'Qual sua experiência com React?',
    type: 'SINGLE_CHOICE',
    isRequired: options.isRequired !== undefined ? options.isRequired : true,
    order: options.order || 1,
    options: options.options || [
      { id: 'opt1', label: 'Menos de 1 ano', value: 'less-than-1' },
      { id: 'opt2', label: '1-2 anos', value: '1-2' },
      { id: 'opt3', label: '3-5 anos', value: '3-5' },
      { id: 'opt4', label: 'Mais de 5 anos', value: 'more-than-5' },
    ],
  });
}

// Helper function to create a job with all question types
export async function createTestJobWithAllQuestionTypes(app: any, adminToken: string, positionId: string) {
  // Create job first
  const jobData = createTestJobData(positionId, {
    title: 'Vaga com Todos os Tipos de Questões',
    description: 'Vaga para testar todos os tipos de questões',
    slug: 'vaga-todos-tipos-questoes',
    isActive: true,
  });

  const jobResponse = await app.inject({
    method: 'POST',
    url: '/api/jobs',
    payload: jobData,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const job = JSON.parse(jobResponse.body).data;

  // Create questions of each type
  const shortTextData = createShortTextQuestion({
    label: 'Qual sua pretensão salarial?',
    isRequired: true,
    order: 1,
  });

  const longTextData = createLongTextQuestion({
    label: 'Descreva um projeto que você desenvolveu recentemente',
    isRequired: true,
    order: 2,
  });

  const multipleChoiceData = createMultipleChoiceQuestion({
    label: 'Quais tecnologias você tem experiência? (selecione todas)',
    isRequired: true,
    order: 3,
    options: [
      { id: 'opt1', label: 'JavaScript', value: 'javascript' },
      { id: 'opt2', label: 'TypeScript', value: 'typescript' },
      { id: 'opt3', label: 'React', value: 'react' },
      { id: 'opt4', label: 'Node.js', value: 'nodejs' },
      { id: 'opt5', label: 'Python', value: 'python' },
    ],
  });

  const singleChoiceData = createSingleChoiceQuestion({
    label: 'Qual sua experiência com desenvolvimento web?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'opt1', label: 'Iniciante', value: 'beginner' },
      { id: 'opt2', label: 'Intermediário', value: 'intermediate' },
      { id: 'opt3', label: 'Avançado', value: 'advanced' },
      { id: 'opt4', label: 'Especialista', value: 'expert' },
    ],
  });

  // Create questions via HTTP
  const shortTextResponse = await app.inject({
    method: 'POST',
    url: `/api/jobs/${job.id}/questions`,
    payload: shortTextData,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const longTextResponse = await app.inject({
    method: 'POST',
    url: `/api/jobs/${job.id}/questions`,
    payload: longTextData,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const multipleChoiceResponse = await app.inject({
    method: 'POST',
    url: `/api/jobs/${job.id}/questions`,
    payload: multipleChoiceData,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const singleChoiceResponse = await app.inject({
    method: 'POST',
    url: `/api/jobs/${job.id}/questions`,
    payload: singleChoiceData,
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  return {
    job,
    jobData,
    shortText: JSON.parse(shortTextResponse.body).data,
    longText: JSON.parse(longTextResponse.body).data,
    multipleChoice: JSON.parse(multipleChoiceResponse.body).data,
    singleChoice: JSON.parse(singleChoiceResponse.body).data,
    shortTextData,
    longTextData,
    multipleChoiceData,
    singleChoiceData,
  };
}
