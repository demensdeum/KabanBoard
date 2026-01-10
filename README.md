# KabanBoard

![logo.jpg](logo.jpg)

A modern Kanban board application built with **Vue 3** and **MongoDB**.

## Features

- 📋 Create multiple boards
- 📝 Add, edit, and delete cards
- 🎨 Color-coded cards
- 🖱️ Drag and drop cards between columns
- 🌙 Modern dark theme
- 💾 Data persistence with MongoDB

![screenshot.png](screenshot.png)

## Tech Stack

- **Frontend**: Vue 3, Vite, Vue Router
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Quick Start

### 1. Start MongoDB
```bash
mongod
```

### 2. Start Backend
```bash
cd server
npm install
npm start
```

### 3. Start Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5173`

## Default Columns

New boards automatically include three columns:
- **New** - For new tasks
- **In Progress** - For tasks being worked on
- **Done** - For completed tasks

## Docker

Run with Docker Compose:

```bash
docker-compose up -d
```

This pulls images from Docker Hub (`demensdeum/kaban-server`, `demensdeum/kaban-client`) and starts the full stack.

Access at: **http://localhost**

## Deployment & Base Path

⚠️ **Important**: The application is configured to run under the base path `/kaban-board/`.
This means it expects to be accessed at `http://your-domain.com/kaban-board/`.

### Nginx Configuration Example

Use this configuration to proxy requests to the container (running on port 3002 in this example):

```nginx
server {
    server_name your-domain.com;

    location /kaban-board/ {
        proxy_pass http://localhost:3002/kaban-board/;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https; 
    }
}
```

See [DOCKER.md](DOCKER.md) for full documentation.

## License

MIT
