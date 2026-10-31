#!/bin/sh
set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/facilita_db_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "=================================================="
echo "[$(date)] INICIANDO BACKUP DO POSTGRESQL..."
echo "Host: db | Banco: $POSTGRES_DB | Usuário: $POSTGRES_USER"
echo "=================================================="

# Executa pg_dump comprimido com gzip
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$FILENAME"

FILESIZE=$(du -h "$FILENAME" | cut -f1)
echo "[$(date)] Backup concluído com sucesso: $FILENAME ($FILESIZE)"

# Rotação de 7 dias: remove arquivos de backup mais antigos que 7 dias
echo "[$(date)] Aplicando política de retenção (7 dias)..."
find "$BACKUP_DIR" -type f -name "facilita_db_*.sql.gz" -mtime +7 -print -delete
echo "[$(date)] Rotação finalizada. Backups ativos:"
ls -lh "$BACKUP_DIR"
