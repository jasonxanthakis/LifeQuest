FROM node:22.14.0-alpine
# Install production dependecies into container
WORKDIR /app
COPY package.json /app
RUN npm install --production
# Set Up Supabase Postgre database