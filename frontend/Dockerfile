# Frontend Dockerfile for MerkleGuard
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5288

# Run development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
