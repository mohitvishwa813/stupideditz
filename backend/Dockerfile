# Use Node.js 20 LTS Alpine image
FROM node:20-alpine

# Set working directory to the root of the app
WORKDIR /app

# Copy the entire repository (from the root context)
COPY . .

# Change working directory explicitly to the backend folder
WORKDIR /app/backend

# Install only production backend dependencies
RUN npm install --omit=dev

# Default port (Railway injects process.env.PORT automatically)
EXPOSE 5000

# Start Express server from inside /app/backend
CMD ["node", "server.js"]

