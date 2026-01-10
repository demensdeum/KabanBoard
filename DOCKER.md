# Docker Deployment

This guide explains how to run KabanBoard using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

Run the full stack with a single command:

```bash
docker-compose up -d
```

This starts:
- **MongoDB** on port `27017`
- **API Server** on port `3000`
- **Web Client** on port `80`

Access the application at: **http://localhost**

## Services

| Service  | Container Name   | Port  | Description                |
|----------|------------------|-------|----------------------------|
| mongodb  | kaban-mongodb    | 27017 | MongoDB database           |
| server   | kaban-server     | 3000  | Node.js REST API           |
| client   | kaban-client     | 80    | Vue.js frontend (nginx)    |

## Commands

### Start all services
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Remove all data (including database)
```bash
docker-compose down -v
```

## Building Individual Images

### Client
```bash
cd client
docker build -t kaban-client .
```

### Server
```bash
cd server
docker build -t kaban-server .
```

## Environment Variables

The server accepts the following environment variables:

| Variable     | Default                           | Description           |
|--------------|-----------------------------------|-----------------------|
| MONGODB_URI  | mongodb://localhost:27017/kaban   | MongoDB connection    |
| PORT         | 3000                              | Server port           |

## Data Persistence

MongoDB data is stored in a Docker volume named `mongodb_data`. This persists across container restarts.

To backup the database:
```bash
docker exec kaban-mongodb mongodump --out /data/backup
docker cp kaban-mongodb:/data/backup ./backup
```

To restore:
```bash
docker cp ./backup kaban-mongodb:/data/backup
docker exec kaban-mongodb mongorestore /data/backup
```
