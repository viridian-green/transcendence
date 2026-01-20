## Chat Service

### Testing Chat and User Database in Browser

```bash
wscat -c ws://localhost:3004/websocket -H "x-username: testuser" -H "x-user-id: 123"
```

### Inspecting PostgreSQL Tables via Docker

To access your PostgreSQL database container and inspect tables, use the following command:

```bash
docker exec -it postgres_db_dev psql -U <username> <database>
```

Replace `<username>` and `<database>` with your actual Postgres username and database name.

### Updating User State

```bash
curl -X PATCH http://localhost:3003/state -H "Content-Type: application/json" -d '{"id":"test","state":"online"}'
```

```bash

```

### Inspect Users Table (Dev Mode)

```bash
docker exec -it postgres_db_dev psql -U myuser -d user_db -c "\d users"
```
