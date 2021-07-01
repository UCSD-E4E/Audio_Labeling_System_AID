#!/usr/bin/env bash

echo "Restoring latest database backup"
latest_backup=/mnt/backup/`ls /mnt/backup/ | grep -Eo "[0-9]{8}-[0-9]{2}:[0-9]{2}.sql" | sort -ru | head -n 1`;
mysqladmin -f -u root --password=root drop audino;
mysqladmin -u root --password=root create audino;
mysql -u root --password=root audino < $latest_backup;
