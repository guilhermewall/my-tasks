#!/usr/bin/env node

import crypto from 'node:crypto';

console.log('🔑 Gerando secrets JWT para produção...\n');

const accessSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('📋 Copie estas variáveis para o painel do Render:');
console.log('─'.repeat(60));
console.log(`JWT_ACCESS_SECRET=${accessSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log('─'.repeat(60));
console.log('\n✅ Secrets gerados com sucesso!');
console.log('💡 Mantenha estes valores seguros e não os compartilhe.');