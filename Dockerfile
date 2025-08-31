# Multi-stage Dockerfile for Telegram Scraper

# Base stage with common dependencies
FROM node:18-bullseye AS base

# Install dependencies needed for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrender1 \
    libxtst6 \
    libcups2 \
    libdrm2 \
    libxss1 \
    libgbm1 \
    libnss3 \
    libnspr4 \
    libatspi2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxrandr2 \
    libasound2 \
    libcups2 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Create app directory
WORKDIR /usr/src/app

# Create a non-root user
RUN groupadd -r nodejs --gid=1001 && \
    useradd -r -g nodejs --uid=1001 --home-dir=/usr/src/app --shell=/bin/bash appuser

# Development stage
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Change ownership
RUN chown -R appuser:nodejs /usr/src/app
USER appuser

# Expose ports (app + debug)
EXPOSE 6000 9229

# Default command for development
CMD ["npm", "run", "api:dev"]

# Production build stage
FROM base AS builder

# Copy package files
COPY package*.json ./

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Production stage
FROM base AS production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy necessary files
COPY --from=builder /usr/src/app/public ./public

# Create necessary directories
RUN mkdir -p downloads logs

# Change ownership of the app directory
RUN chown -R appuser:nodejs /usr/src/app
USER appuser

# Expose port
EXPOSE 6000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:6000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Default command
CMD ["node", "dist/api/server.js"]