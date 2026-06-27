# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first for efficient Docker layer caching
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Final Production Image
# ==========================================
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies (curl and git for developer utilities if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend and agent scripts
COPY agents/ ./agents/
COPY backend/ ./backend/

# Copy the compiled static assets from the frontend builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set production environment variables
ENV ENV=production
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Launch FastAPI server
CMD ["python", "backend/main.py"]
