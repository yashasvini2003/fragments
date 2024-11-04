##########################################################
# Dockerfile for Containerizing Fragments Microservice   #
##########################################################

# Stage 0: Build the application
FROM node:18.13.0-alpine3.17.1@sha256:fda98168118e5a8f4269efca4101ee51dd5c75c0fe56d8eb6fad80455c2f5827 AS build

# Setting Environment var to production
ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install node dependencies
RUN npm ci --only=production

# Copy Source files
COPY ./src ./src

##################################################################################################################

# Stage 1: Create the production image
FROM node:18.13.0-alpine3.17.1@sha256:fda98168118e5a8f4269efca4101ee51dd5c75c0fe56d8eb6fad80455c2f5827 AS production

# Adding Curl for health check
RUN apk update && \
    apk add --no-cache curl=8.2.1-r0

# Metadata about the image
LABEL maintainer="Yashasvini Bhanuraj <yashasvinibhanuraj29@gmail.com>"
LABEL description="Fragments node.js microservice"

# Creat a non-root user and switch to that user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable color when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy built files from the build stage
# I am keeping package.json files deliberately. 
COPY --from=build --chown=appuser:appgroup /app ./

# Copy the .htpasswd file from the same directory as the Dockerfile into the working directory (/app)
COPY --chown=appuser:appgroup tests/.htpasswd .

# Expose the application port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl --fail localhost:8080 || exit 1

# Start the application
CMD ["node", "src/index.js"]
