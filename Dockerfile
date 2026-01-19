FROM node:lts-alpine

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    webp \
    bash

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Run as non-root user
RUN adduser -D -u 1001 appuser && chown -R appuser:appuser /usr/src/app
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
