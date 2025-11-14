# Nixite Dockerfile
# Multi-stage build for optimized container

# Stage 1: Base with Node.js and Python
FROM nixos/nix:latest AS base

# Install system dependencies
RUN nix-env -iA nixpkgs.python3 \
    nixpkgs.nodejs \
    nixpkgs.git

# Stage 2: Application
FROM base AS app

# Set working directory
WORKDIR /app

# Copy application files
COPY . /app/

# Make start script executable
RUN chmod +x /app/start.sh

# Expose ports
# 8000: Web interface
# 8890: AI bridge (optional)
EXPOSE 8000 8890

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

# Set environment
ENV NODE_ENV=production \
    NIXITE_HOST=0.0.0.0 \
    NIXITE_PORT=8000

# Default command: start web server
CMD ["python3", "-m", "http.server", "8000", "--bind", "0.0.0.0"]

# Alternative: Use start script for full stack
# CMD ["/app/start.sh"]
