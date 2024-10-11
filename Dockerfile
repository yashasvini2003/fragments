# Dockerfile for Fragments Microservice
# This file defines how to build a Docker image for the Fragments microservice,
# specifying the base image, environment variables, working directories, dependencies, and
# the command to run the service.

# Use node version 18.13.0 as the base image
FROM node:18.13.0

# Metadata about the image
LABEL maintainer="Yashasvini Bhanuraj <yashasvinibhanuraj29@gmail.com>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json files into the image
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080
