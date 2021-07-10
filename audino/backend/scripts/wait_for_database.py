"""
wait_for_database.py
runs by run-dev.sh and run-prod.sh. Has backend wait for the mysql database to start up before connecting to it
"""
import argparse
import os
import time
import sys

from sqlalchemy import create_engine

parser = argparse.ArgumentParser(description="Check if MySQL is up")

parser.add_argument("--poll_seconds",
    type=int,
    help="Wait for `poll` seconds before retrying",
    default=5)
parser.add_argument("--max_retries",
    type=int,
    help="Maximum number of retries for connection",
    default=30)

args = parser.parse_args()

max_retries = args.max_retries
poll_seconds = args.poll_seconds


RETRY = 0
while RETRY < max_retries:
    try:
        engine = create_engine(os.getenv("DATABASE_URL"), pool_pre_ping=True)
        conn = engine.connect()
        conn.execute('SELECT 1')
        break
    except Exception as e:
        print(f"Couldn't connect to MySQL: {RETRY}/{max_retries}", flush=True)
        time.sleep(poll_seconds)
        RETRY += 1

if RETRY == max_retries:
    print('Error connecting to database', flush=True)
    sys.exit(1)
else:
    print('Connected to database', flush=True)
