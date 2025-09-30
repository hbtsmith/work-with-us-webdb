const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRawData() {
  try {
    // Query direta para verificar se ainda existem dados
    const result = await prisma.$queryRaw`SELECT id, label, \`options\` FROM questions WHERE \`options\` IS NOT NULL AND \`options\` != '[]' LIMIT 3`;
    console.log('Dados encontrados:', result);
  } catch (error) {
    console.log('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRawData();
