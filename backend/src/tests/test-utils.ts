import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

// Create a unique Prisma client for each test
export function createTestPrisma(): PrismaClient {
  const testDbName = `test_${randomBytes(8).toString('hex')}`;
  
  // Update DATABASE_URL for this test
  process.env['DATABASE_URL'] = `mysql://root:root@localhost:3306/${testDbName}`;
  
  return new PrismaClient({
    datasources: {
      db: {
        url: `mysql://root:root@localhost:3306/${testDbName}`,
      },
    },
  });
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function cleanupTestDatabase(prisma: PrismaClient) {
  // Clean up in correct order to respect foreign key constraints
  await prisma.answer.deleteMany();
  await prisma.application.deleteMany();
  await prisma.question.deleteMany();
  await prisma.job.deleteMany();
  await prisma.position.deleteMany();
  await prisma.admin.deleteMany();
  
  // Disconnect the client
  await prisma.$disconnect();
}
