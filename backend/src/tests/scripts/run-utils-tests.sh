#!/bin/bash

# Script para executar testes unitários de utils individualmente
# Evita conflitos de dados entre testes

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Função para executar um teste individual
run_test() {
    local test_file="$1"
    local test_name=$(basename "$test_file" .test.ts)
    
    print_status "Executando teste: $test_name"
    print_status "Arquivo: $test_file"
    echo "----------------------------------------"
    
    # Executar o teste
    if npx vitest --run "$test_file" --reporter=verbose; then
        print_success "✅ $test_name - PASSOU"
    else
        print_error "❌ $test_name - FALHOU"
        return 1
    fi
    
    echo ""
    echo "========================================"
    echo ""
}

# Função para executar todos os testes individualmente
run_all_tests() {
    local test_dir="src/tests/utils"
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    print_status "Iniciando execução individual de todos os testes unitários de utils..."
    echo ""
    
    # Lista de arquivos de teste
    local test_files=(
        "src/tests/utils/fileUpload.test.ts"
        "src/tests/utils/pagination.test.ts"
        "src/tests/utils/slug.test.ts"
    )
    
    # Executar cada teste individualmente
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            total_tests=$((total_tests + 1))
            
            if run_test "$test_file"; then
                passed_tests=$((passed_tests + 1))
            else
                failed_tests=$((failed_tests + 1))
            fi
        else
            print_warning "Arquivo não encontrado: $test_file"
        fi
    done
    
    # Resumo final
    echo ""
    echo "========================================"
    print_status "RESUMO FINAL:"
    print_status "Total de testes: $total_tests"
    print_success "Testes que passaram: $passed_tests"
    if [ $failed_tests -gt 0 ]; then
        print_error "Testes que falharam: $failed_tests"
    else
        print_success "Testes que falharam: $failed_tests"
    fi
    
    if [ $failed_tests -eq 0 ]; then
        print_success "🎉 TODOS OS TESTES PASSARAM!"
        return 0
    else
        print_error "⚠️  ALGUNS TESTES FALHARAM"
        return 1
    fi
}

# Função para executar um teste específico
run_specific_test() {
    local test_name="$1"
    local test_file=""
    
    case "$test_name" in
        "file-upload")
            test_file="src/tests/utils/fileUpload.test.ts"
            ;;
        "pagination")
            test_file="src/tests/utils/pagination.test.ts"
            ;;
        "slug")
            test_file="src/tests/utils/slug.test.ts"
            ;;
        *)
            print_error "Teste não reconhecido: $test_name"
            print_status "Testes disponíveis: file-upload, pagination, slug"
            return 1
            ;;
    esac
    
    if [ -f "$test_file" ]; then
        run_test "$test_file"
    else
        print_error "Arquivo de teste não encontrado: $test_file"
        return 1
    fi
}

# Função para mostrar ajuda
show_help() {
    echo "Script para executar testes unitários de utils individualmente"
    echo ""
    echo "Uso:"
    echo "  $0                    # Executa todos os testes individualmente"
    echo "  $0 <nome_do_teste>    # Executa um teste específico"
    echo "  $0 --help            # Mostra esta ajuda"
    echo ""
    echo "Testes disponíveis:"
    echo "  file-upload          # Testes de upload de arquivos (8 testes)"
    echo "  pagination           # Testes de paginação (15 testes)"
    echo "  slug                 # Testes de slug (12 testes)"
    echo ""
    echo "Exemplos:"
    echo "  $0                   # Executa todos os testes"
    echo "  $0 file-upload       # Executa apenas testes de file-upload"
    echo "  $0 pagination        # Executa apenas testes de pagination"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script a partir do diretório raiz do projeto (onde está o package.json)"
    exit 1
fi

# Verificar se o vitest está disponível
if ! command -v npx &> /dev/null; then
    print_error "npx não encontrado. Certifique-se de que o Node.js está instalado."
    exit 1
fi

# Processar argumentos
case "${1:-}" in
    "")
        run_all_tests
        ;;
    "--help" | "-h")
        show_help
        ;;
    *)
        run_specific_test "$1"
        ;;
esac
