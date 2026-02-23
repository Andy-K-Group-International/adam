#!/bin/bash
# Run this on data-server to set up daily backup cron
# Usage: ssh data-server "bash -s" < scripts/setup-backup-cron.sh

SCRIPT_PATH="/root/backup-db.sh"

# Copy the backup script
cat > "$SCRIPT_PATH" << 'SCRIPT'
#!/bin/bash
set -euo pipefail
BACKUP_DIR="/root/backups/supabase"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/adam_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30
mkdir -p "$BACKUP_DIR"
docker exec supabase-db pg_dump -U postgres --clean --if-exists | gzip > "$BACKUP_FILE"
find "$BACKUP_DIR" -name "adam_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Backup complete: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
SCRIPT

chmod +x "$SCRIPT_PATH"

# Add cron job (daily at 3 AM)
(crontab -l 2>/dev/null | grep -v backup-db.sh; echo "0 3 * * * /root/backup-db.sh >> /root/backups/supabase/backup.log 2>&1") | crontab -

echo "Backup cron installed. Run 'crontab -l' to verify."
