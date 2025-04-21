# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies with relaxed peer resolution
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Expose backend port
EXPOSE 5000

# Run the backend server
CMD ["npm", "start"]
