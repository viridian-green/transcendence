#!/bin/sh
set -e

# This "EOSQL" block sends SQL commands to the default postgres DB
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE user_db;
	GRANT ALL PRIVILEGES ON DATABASE user_db TO myuser;
EOSQL

