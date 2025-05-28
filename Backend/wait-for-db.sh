#!/bin/bash
# wait-for-db.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until nc -z -v -w30 "$host" "$port"; do
  echo "Waiting for database connection..."
  sleep 2
done

echo "Database is up - executing command"
exec $cmd