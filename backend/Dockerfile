# Use Node.js 20 LTS Alpine image for minimal footprint
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install dependencies cleanly
RUN npm install --omit=dev

# Copy all source code
COPY . .

# Default port (Railway injects process.env.PORT automatically)
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
