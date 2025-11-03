-- Script de inicialização do banco de dados
-- Este script é executado automaticamente quando o container do PostgreSQL é criado pela primeira vez

-- Garantir que o banco mytasks existe
SELECT 'CREATE DATABASE mytasks'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mytasks')\gexec

-- Conectar ao banco mytasks (isso será feito pelo Drizzle depois)
\c mytasks;

-- Criar extensão para UUID (se necessário)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensagem de sucesso
SELECT 'Database mytasks initialized successfully!' as status;
