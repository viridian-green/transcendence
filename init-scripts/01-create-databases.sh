#!/bin/sh
set -e

# This "EOSQL" block sends SQL commands to the default postgres DB
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE user_db;
	CREATE DATABASE game_db;
	GRANT ALL PRIVILEGES ON DATABASE user_db TO myuser;
	GRANT ALL PRIVILEGES ON DATABASE game_db TO myuser;
EOSQL

