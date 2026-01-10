# All-in-one Docker image with MongoDB and KabanBoard
FROM node:20-bullseye

# Install MongoDB
RUN apt-get update && apt-get install -y \
    gnupg \
    curl \
    supervisor \
    && curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-org \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /data/db /app

# Copy the application files
WORKDIR /app
COPY . .

# Install dependencies and build client
RUN cd client && npm install && npm run build

# Install server dependencies
RUN cd server && npm install

# Create MongoDB data directory with correct permissions
RUN chown -R mongodb:mongodb /data/db

# Create supervisor config
RUN echo "[supervisord]\n\
nodaemon=true\n\
user=root\n\
\n\
[program:mongodb]\n\
command=bash -c \"chown -R mongodb:mongodb /data/db && /usr/bin/mongod --dbpath /data/db --bind_ip_all\"\n\
autostart=true\n\
autorestart=true\n\
user=root\n\
stdout_logfile=/var/log/mongodb.log\n\
stderr_logfile=/var/log/mongodb.err\n\
\n\
[program:kaban-server]\n\
command=/usr/local/bin/node index.js\n\
directory=/app/server\n\
autostart=true\n\
autorestart=true\n\
environment=MONGODB_URI=\"mongodb://localhost:27017/kaban\",PORT=\"3000\",NODE_ENV=\"production\"\n\
stdout_logfile=/var/log/kaban.log\n\
stderr_logfile=/var/log/kaban.err" > /etc/supervisor/conf.d/services.conf

# Expose ports
EXPOSE 3000

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
