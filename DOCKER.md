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

This pulls and starts:
- **MongoDB** on port `27017`
- **API Server** on port `3000` (`demensdeum/kaban-server:latest`)
- **Web Client** on port `80` (`demensdeum/kaban-client:latest`)

Access the application at: **http://localhost**

## Services

| Service  | Image                              | Port  | Description             |
|----------|------------------------------------|-------|-------------------------|
| mongodb  | mongo:latest                       | 27017 | MongoDB database        |
| server   | demensdeum/kaban-server:latest     | 3000  | Node.js REST API        |
| client   | demensdeum/kaban-client:latest     | 80    | Vue.js frontend (nginx) |

## Commands

### Start all services
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### Pull latest images
```bash
docker-compose pull
```

### View logs
```bash
docker-compose logs -f
```

### Remove all data (including database)
```bash
docker-compose down -v
```

## Building & Pushing Images

### Build and push server
```bash
cd server
docker build -t demensdeum/kaban-server:latest .
docker push demensdeum/kaban-server:latest
```

### Build and push client
```bash
cd client
docker build -t demensdeum/kaban-client:latest .
docker push demensdeum/kaban-client:latest
```

## Environment Variables

| Variable     | Default                           | Description           |
|--------------|-----------------------------------|-----------------------|
| MONGODB_URI  | mongodb://mongodb:27017/kaban     | MongoDB connection    |
| PORT         | 3000                              | Server port           |

## Data Persistence

MongoDB data is stored in a Docker volume named `mongodb_data`. This persists across container restarts.
