#!/bin/bash

# Script helper para gerenciar o Docker do projeto

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se o Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker não está rodando!${NC}"
        echo -e "${YELLOW}Por favor, inicie o Docker Desktop e tente novamente.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker está rodando${NC}"
}

# Função para subir os serviços
start() {
    check_docker
    echo -e "${GREEN}🚀 Subindo serviços...${NC}"
    docker compose up -d postgres
    echo -e "${GREEN}✓ PostgreSQL iniciado!${NC}"
    echo ""
    echo -e "${YELLOW}📊 Para ver os logs:${NC} docker compose logs -f"
    echo -e "${YELLOW}📊 Para verificar status:${NC} docker compose ps"
}

# Função para parar os serviços
stop() {
    echo -e "${YELLOW}🛑 Parando serviços...${NC}"
    docker compose down
    echo -e "${GREEN}✓ Serviços parados!${NC}"
}

# Função para ver logs
logs() {
    docker compose logs -f postgres
}

# Função para ver status
status() {
    check_docker
    docker compose ps
}

# Função para resetar o banco (apaga tudo)
reset() {
    echo -e "${RED}⚠️  ATENÇÃO: Isso vai apagar todos os dados do banco!${NC}"
    read -p "Tem certeza? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down -v
        echo -e "${GREEN}✓ Banco resetado!${NC}"
        start
    else
        echo -e "${YELLOW}Cancelado.${NC}"
    fi
}

# Função para testar conexão
test_connection() {
    check_docker
    echo -e "${GREEN}🔍 Testando conexão com o banco...${NC}"
    docker compose exec postgres psql -U docker -d mytasks -c "SELECT version();"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Conexão bem-sucedida!${NC}"
    else
        echo -e "${RED}❌ Erro ao conectar${NC}"
        exit 1
    fi
}

# Menu principal
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    reset)
        reset
        ;;
    test)
        test_connection
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|logs|status|reset|test}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia os serviços"
        echo "  stop    - Para os serviços"
        echo "  restart - Reinicia os serviços"
        echo "  logs    - Mostra logs do PostgreSQL"
        echo "  status  - Mostra status dos containers"
        echo "  reset   - Reseta o banco (apaga dados)"
        echo "  test    - Testa conexão com o banco"
        exit 1
        ;;
esac
