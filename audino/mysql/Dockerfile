FROM mysql:5.7

RUN apt-get update && apt-get -y install cron

ADD ./crontab /etc/cron.d/backup-cron

ADD ./start.sh /

RUN chmod +x /start.sh

RUN chmod 0644 /etc/cron.d/backup-cron

RUN crontab /etc/cron.d/backup-cron

RUN touch /var/log/cron.log

CMD ["/start.sh"]