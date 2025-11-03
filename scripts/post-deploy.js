#!/usr/bin/env node

import { execSync } from 'node:child_process';
import process from 'node:process';

console.log('🚀 Executando setup pós-deploy...');

try {
  // Verificar se é o primeiro deploy (tabelas vazias)
  console.log('📊 Verificando estado do banco...');
  
  // Se a variável SEED_ON_DEPLOY estiver definida, executa o seed
  if (process.env.SEED_ON_DEPLOY === 'true') {
    console.log('🌱 Executando seed de dados...');
    
    // Usar comando apropriado baseado no ambiente
    const seedCommand = process.env.NODE_ENV === 'production' 
      ? 'npm run seed:prod' 
      : 'npm run seed';
      
    execSync(seedCommand, { stdio: 'inherit' });
    console.log('✅ Seed executado com sucesso!');
  } else {
    console.log('⏭️  Seed pulado (defina SEED_ON_DEPLOY=true para executar)');
  }
  
  console.log('🎉 Setup pós-deploy concluído!');
} catch (error) {
  console.error('❌ Erro no setup pós-deploy:', error.message);
  process.exit(1);
}