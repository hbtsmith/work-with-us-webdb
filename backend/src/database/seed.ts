import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

const prisma = new PrismaClient();

async function main() {
  
  // Create default admin user
  const hashedPassword = await bcrypt.hash(
    process.env['ADMIN_PASSWORD'] || 'admin123',
    12
  );
  
  await prisma.admin.upsert({
    where: { email: process.env['ADMIN_EMAIL'] || 'admin@company.com' },
    update: {},
    create: {
      email: process.env['ADMIN_EMAIL'] || 'admin@company.com',
      password: hashedPassword,
      isFirstLogin: true,
    },
  });
  
  
  // Create sample positions
  const positions = [
    {
      title: 'Frontend Developer',
      level: 'Mid-level',
      salaryRange: 'R$ 5.000 - R$ 8.000',
    },
    {
      title: 'Backend Developer',
      level: 'Senior',
      salaryRange: 'R$ 8.000 - R$ 12.000',
    },
    {
      title: 'Full Stack Developer',
      level: 'Mid-level',
      salaryRange: 'R$ 6.000 - R$ 10.000',
    },
    {
      title: 'DevOps Engineer',
      level: 'Senior',
      salaryRange: 'R$ 10.000 - R$ 15.000',
    },
  ];
  
  for (const positionData of positions) {
    await prisma.position.create({
      data: positionData,
    });
  }
  
  // Create sample job
  const frontendPosition = await prisma.position.findFirst({
    where: { title: 'Frontend Developer' },
  });
  
  if (frontendPosition) {
    const job = await prisma.job.create({
      data: {
        title: 'Frontend Developer - React/TypeScript',
        description: `
          Estamos procurando um desenvolvedor frontend apaixonado por tecnologia e inovação.
          
          **Responsabilidades:**
          - Desenvolver interfaces de usuário modernas e responsivas
          - Trabalhar com React, TypeScript e bibliotecas relacionadas
          - Colaborar com designers e desenvolvedores backend
          - Participar de code reviews e discussões técnicas
          
          **Requisitos:**
          - Experiência sólida com React e TypeScript
          - Conhecimento em HTML5, CSS3 e JavaScript ES6+
          - Familiaridade com ferramentas de build (Webpack, Vite)
          - Experiência com controle de versão (Git)
          
          **Diferencial:**
          - Conhecimento em Next.js
          - Experiência com testes automatizados
          - Conhecimento em design systems
        `,
        slug: 'frontend-developer-2024',
        requiresResume: true,
        positionId: frontendPosition.id,
        questions: {
          create: [
            {
              label: 'Qual sua experiência com React?',
              type: 'SINGLE_CHOICE',
              isRequired: true,
              order: 1,
            },
            {
              label: 'Descreva um projeto React que você desenvolveu recentemente',
              type: 'LONG_TEXT',
              isRequired: true,
              order: 2,
            },
            {
              label: 'Quais tecnologias você tem experiência? (selecione todas que se aplicam)',
              type: 'MULTIPLE_CHOICE',
              isRequired: true,
              order: 3,
            },
            {
              label: 'Qual sua pretensão salarial?',
              type: 'SHORT_TEXT',
              isRequired: true,
              order: 4,
            },
            {
              label: 'Quando você pode começar?',
              type: 'SHORT_TEXT',
              isRequired: false,
              order: 5,
            },
          ],
        },
      },
    });

    // Criar opções para as perguntas de escolha
    const questions = await prisma.question.findMany({
      where: { jobId: job.id },
      orderBy: { order: 'asc' }
    });

    // Opções para pergunta 1 (SINGLE_CHOICE)
    if (questions[0]) {
      await prisma.questionOption.createMany({
        data: [
          { questionId: questions[0].id, label: 'Menos de 1 ano', orderIndex: 0 },
          { questionId: questions[0].id, label: '1-2 anos', orderIndex: 1 },
          { questionId: questions[0].id, label: '3-5 anos', orderIndex: 2 },
          { questionId: questions[0].id, label: 'Mais de 5 anos', orderIndex: 3 }
        ]
      });
    }

    // Opções para pergunta 3 (MULTIPLE_CHOICE)
    if (questions[2]) {
      await prisma.questionOption.createMany({
        data: [
          { questionId: questions[2].id, label: 'TypeScript', orderIndex: 0 },
          { questionId: questions[2].id, label: 'Next.js', orderIndex: 1 },
          { questionId: questions[2].id, label: 'Redux', orderIndex: 2 },
          { questionId: questions[2].id, label: 'GraphQL', orderIndex: 3 },
          { questionId: questions[2].id, label: 'Jest', orderIndex: 4 },
          { questionId: questions[2].id, label: 'Cypress', orderIndex: 5 }
        ]
      });
    }
  }
  
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
