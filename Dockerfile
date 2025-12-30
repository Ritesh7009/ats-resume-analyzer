# ATS Resume Analyzer - Docker Configuration

# Backend Dockerfile
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Frontend Dockerfile
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package*.json ./backend/

# Copy frontend build to be served by backend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

WORKDIR /app/backend

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/app.js"]
