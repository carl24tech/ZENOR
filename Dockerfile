FROM node:lts-alpine

# Install system dependencies with correct Alpine package names
RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    libwebp \
    bash

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Create and switch to non-root user (optional but recommended)
RUN adduser -D -u 1001 appuser && chown -R appuser:appuser /usr/src/app
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
