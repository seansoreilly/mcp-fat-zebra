FROM node:18-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY src/ ./src/
COPY tsconfig.json ./

# Build the project
RUN npm run build

# Set environment variables - these will be overridden by AWS Secrets Manager
ENV FAT_ZEBRA_API_URL=https://gateway.sandbox.fatzebra.com.au/v1.0
ENV FAT_ZEBRA_USERNAME=TEST
ENV FAT_ZEBRA_TOKEN=TEST
ENV NODE_ENV=production

# Expose the MCP server port
EXPOSE 3000

# Run the MCP server
CMD ["node", "dist/index.js"]
