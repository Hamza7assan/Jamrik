# Use Node.js as the base image
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better for caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]