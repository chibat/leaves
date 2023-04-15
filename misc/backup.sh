#!/bin/bash

export $(cat ../.env | grep -v ^#)

DATE=$(date +%Y%m%d)
pg_dump --file=db-${DATE}.sql && gzip db-${DATE}.sql
ls -lh db-*.sql.gz

