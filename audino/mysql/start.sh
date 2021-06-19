#!/bin/bash

cron;
mysqld --user=root --init-file=/mysql/create_database.sql --character-set-server=utf8mb4 --collation-server=utf8mb4_bin