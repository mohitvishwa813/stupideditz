# Use Node.js 20 LTS Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy the build context
COPY . .

# If built from the repo root, move backend files to the current directory
RUN if [ -d "backend" ]; then \
      cp -r backend/* ./ && \
      rm -rf backend src public dist; \
    fi

# Install only production dependencies
RUN npm install --omit=dev

# Expose port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]

