# Docker Deployment Guide for Telegram Scraper

This guide explains how to deploy the Telegram Scraper application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)
- Docker daemon running (start Docker Desktop or `sudo systemctl start docker` on Linux)
- A Telegram Bot Token (get one from [@BotFather](https://t.me/BotFather))

## Quick Start

### 1. Environment Setup

Copy the environment example file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your Telegram bot token:

```env
BOT_TOKEN=your_actual_bot_token_here
PORT=3000
MAX_PAGES=10
TIMEOUT=60000
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 3. Build and Run with Docker (Manual)

```bash
# Build the image
docker build -t tg-scraper .

# Run the container
docker run -d \
  --name tg-scraper-app \
  -p 3000:3000 \
  -e BOT_TOKEN=your_bot_token_here \
  -v $(pwd)/downloads:/usr/src/app/downloads \
  -v $(pwd)/logs:/usr/src/app/logs \
  tg-scraper
```

## API Endpoints

Once running, the following endpoints are available:

- **Health Check**: `GET http://localhost:3000/health`
- **Scrape**: `POST http://localhost:3000/scrape`
- **Download**: `GET http://localhost:3000/download/:filename`

### Example API Usage

```bash
# Health check
curl http://localhost:3000/health

# Scrape channels
curl -X POST http://localhost:3000/scrape \
  -H "Content-Type: application/json" \
  -d '{"keyword": "crypto", "maxPages": 5}'
```

## Telegram Bot Usage

1. Start a chat with your bot on Telegram
2. Send `/start` to see the welcome message
3. Send any keyword (e.g., "crypto", "news", "tech")
4. The bot will scrape channels and send you a CSV file

## Docker Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `BOT_TOKEN` | Telegram Bot Token | Required |
| `PORT` | Server port | 3000 |
| `MAX_PAGES` | Maximum pages to scrape | 10 |
| `TIMEOUT` | Request timeout in ms | 60000 |
| `NODE_ENV` | Node environment | production |

### Volumes

- `./downloads:/usr/src/app/downloads` - Downloaded CSV files
- `./logs:/usr/src/app/logs` - Application logs

### Resource Limits

The docker-compose.yml includes resource limits:
- Memory: 1GB limit, 512MB reservation
- CPU: 0.5 cores limit, 0.25 cores reservation

## Production Deployment

### 1. Security Considerations

- Use Docker secrets for sensitive data:

```yaml
secrets:
  bot_token:
    file: ./secrets/bot_token.txt

services:
  tg-scraper:
    secrets:
      - bot_token
    environment:
      - BOT_TOKEN_FILE=/run/secrets/bot_token
```

- Run with non-root user (already configured)
- Use `no-new-privileges` security option (already configured)

### 2. Reverse Proxy (Optional)

Uncomment the nginx service in `docker-compose.yml` and create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream tg-scraper {
        server tg-scraper:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://tg-scraper;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 3. Monitoring

```bash
# Check container health
docker-compose ps

# View resource usage
docker stats tg-scraper-app

# Check logs
docker-compose logs -f --tail=100
```

## Troubleshooting

### Common Issues

1. **Docker Daemon Not Running**:
   ```
   Cannot connect to the Docker daemon at unix:///var/run/docker.sock
   ```
   - **Solution**: Start Docker Desktop on macOS/Windows or run `sudo systemctl start docker` on Linux
   - Verify Docker is running: `docker --version`

2. **Puppeteer/Chrome Issues**:
   - The Dockerfile installs Chromium and configures Puppeteer
   - If you encounter issues, check the logs: `docker-compose logs`

3. **Permission Issues**:
   - Ensure the downloads and logs directories are writable
   - The container runs as a non-root user for security

4. **Memory Issues**:
   - Increase memory limits in docker-compose.yml if needed
   - Monitor usage with `docker stats`

5. **Bot Token Issues**:
   - Verify your bot token is correct
   - Check environment variables: `docker-compose exec tg-scraper env | grep BOT`

### Debugging

```bash
# Access container shell
docker-compose exec tg-scraper sh

# Check Puppeteer installation
docker-compose exec tg-scraper node -e "console.log(require('puppeteer').executablePath())"

# Test API manually
docker-compose exec tg-scraper curl http://localhost:3000/health
```

## Development

For development with hot reload:

```bash
# Create development docker-compose override
cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  tg-scraper:
    volumes:
      - ./src:/usr/src/app/src
    command: npm run api:dev
    environment:
      - NODE_ENV=development
EOF

# Run in development mode
docker-compose up
```

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi tg-scraper

# Clean up volumes (WARNING: This will delete downloaded files)
docker-compose down -v
```