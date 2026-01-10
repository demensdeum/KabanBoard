# Docker Deployment


### Option 1: Docker Compose (Recommended)

This interacts with the `docker-compose.yml` file to build and run the all-in-one container.

1.  **Start**:
    ```bash
    docker-compose up -d --build
    ```

2.  **Stop**:
    ```bash
    docker-compose down
    ```

### Option 2: Manual Docker Command

1.  **Build**:
    ```bash
    docker build -t demensdeum/kaban-board .
    ```

2.  **Run**:
    ```bash
    docker run -p 3000:3000 -v kaban_mongo_data:/data/db demensdeum/kaban-board
    ```

## How to use a different port

By default, the application runs on port `3000`. If you want to use **port 8080** (or any other port), you only need to change the **Host Port** mapping.

### Using Docker Compose

1.  Open `docker-compose.yml`.
2.  Find the `ports` section.
3.  Change the **left number** (External Port) to your desired port.

    ```yaml
    ports:
      - "8080:3000"  # <--- Change 3000 to 8080 here
    ```

4.  Run `docker-compose up -d`.
5.  Access at `http://localhost:8080`.

### Using Manual Command

Change the `-p` flag:

```bash
docker run -p 8080:3000 kaban-app
```


Run the full stack with a single command:

```bash
docker-compose up -d
```
*   **Internal Communication (Reverse Proxy)**:
    *   **Browser** -> **Nginx (Client Container)**: Request `/api/...` on port 80.
    *   **Nginx** -> **Server Container**: Proxies request to `http://server:3000`.
    *   **Server** -> **MongoDB Container**: Connects via `mongodb://mongodb:27017`.
    *   **Result**: The browser *never* talks to the server directly. It only talks to Nginx.

*   **External Access (Port Mapping)**:
    *   **MongoDB** on port `27017`
    *   **API Server** on port `3000` (`demensdeum/kaban-server:latest`)
    *   **Web Client** on port `80` (`demensdeum/kaban-client:latest`)

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

## Option 2: Single Container (Simplest)

If you prefer to run MongoDB, Server, and Client all in **one single container** (good for demos or simple deployment):

1.  **Build the image**:
    ```bash
    docker build -f Dockerfile.allinone -t kaban-allinone .
    ```

2.  **Run the container**:
    ```bash
    docker run -p 3000:3000 kaban-allinone
    ```

3.  Access the app at: **http://localhost:3000**
