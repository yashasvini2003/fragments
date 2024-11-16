########################################################
# Dockerfile for Containerizing Fragments Microservice #
########################################################

#######################################################################################################################

# Stage 1: Build Stage
FROM node:22.11.0-alpine3.19@sha256:844f517e92fb8f226a52f29ed5c2b5994ae0dd05e152fefac3f2399469701234 AS build

# Setting Environment var to production
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY ./src ./src

#######################################################################################################################

# Stage 2: Production Stage
FROM node:22.11.0-alpine3.19@sha256:844f517e92fb8f226a52f29ed5c2b5994ae0dd05e152fefac3f2399469701234 AS production

# Metadata about the image
LABEL maintainer="Yashasvini Bhanuraj <yashasvinibhanuraj29@gmail.com>"
LABEL description="Fragments node.js microservice"

# Set environment variables for the service
ENV PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Use the working directory
WORKDIR /app

# Copy package.json and package-lock.json to /app in the production stage
COPY package*.json ./

# Copy the installed node_modules from the build stage
COPY --from=build /app/node_modules ./node_modules

# Copy only necessary application files to the production image
COPY --from=build /app/src ./src  

# Copy any additional necessary files (like .htpasswd)
COPY ./tests/.htpasswd ./tests/.htpasswd

# Health check for the service
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8080/ || exit 1

# Expose the service port
EXPOSE 8080

# Start the application
CMD ["node", "src/index.js"]
