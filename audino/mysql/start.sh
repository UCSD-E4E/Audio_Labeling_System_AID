#!/usr/bin/env bash

echo "Restoring latest database backup"
if [ -d /backup/db_file ]; then \
	latest_backup=/mnt/backup/`ls /mnt/backup/ | grep -Eo "[0-9]{8}-[0-9]{2}:[0-9]{2}.sql" | sort -ru | head -n 1`; \
f1; \
if [ -f /backup/db_file ]; then \
	latest_backup=/backup/db_file; \
fi;

tail $latest_backup; 
mysqladmin -f -u root --password=root drop audino; \
mysqladmin -u root --password=root create audino; \
mysql -u root --password=root audino < $latest_backup;
