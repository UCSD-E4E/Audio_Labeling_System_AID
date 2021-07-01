#!/usr/bin/env bash

mysqld --init-file=/mysql/create_database.sql --character-set-server=utf8mb4 --collation-server=utf8mb4_bin;

if [ "${RESTORE}" == "true" ]; then
	latest_backup=/mnt/backup/`ls /mnt/backup/ | grep -Eo "[0-9]{8}-[0-9]{2}:[0-9]{2}.sql" | sort -ru | head -n 1`;
	mysqladmin -f -u root --password=root drop audino;
	mysqladmin -u root --password=root create audino;
	mysql -u root --password=root audino < $latest_backup;
fi
