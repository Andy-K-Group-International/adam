#!/bin/bash
# ADAM Database Backup Script
# Runs daily via cron, stores backups locally and optionally syncs to R2

set -euo pipefail

BACKUP_DIR="/root/backups/supabase"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/adam_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Dump and compress
docker exec supabase-db pg_dump -U postgres --clean --if-exists | gzip > "$BACKUP_FILE"

# Delete backups older than retention period
find "$BACKUP_DIR" -name "adam_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup complete: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
