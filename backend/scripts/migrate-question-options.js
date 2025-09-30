const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateQuestionOptions() {
  try {
    console.log('🔄 Iniciando migração de question options...');
    
    // 1. Buscar todas as questões que têm opções
    const questionsWithOptions = await prisma.question.findMany({
      where: {
        options: {
          not: null
        }
      }
    });

    console.log(`📊 Encontradas ${questionsWithOptions.length} questões com opções`);

    for (const question of questionsWithOptions) {
      console.log(`🔄 Migrando questão: ${question.label}`);
      
      // 2. Parsear as opções do JSON
      let options = [];
      
      try {
        if (typeof question.options === 'string') {
          options = JSON.parse(question.options);
        } else if (Array.isArray(question.options)) {
          options = question.options;
        }
      } catch (error) {
        console.log(`⚠️ Erro ao parsear opções da questão ${question.label}:`, error.message);
        continue;
      }
      
      if (Array.isArray(options) && options.length > 0) {
        // 3. Criar as questionOptions
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          
          await prisma.questionOption.create({
            data: {
              questionId: question.id,
              label: option.label || option.value || 'Opção sem label',
              orderIndex: i,
              isActive: true
            }
          });
        }
        
        console.log(`✅ Migradas ${options.length} opções para questão: ${question.label}`);
      } else {
        console.log(`⚠️ Questão ${question.label} não tem opções válidas`);
      }
    }

    console.log('✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateQuestionOptions()
  .then(() => {
    console.log('🎉 Migração finalizada!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na migração:', error);
    process.exit(1);
  });
