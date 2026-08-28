FROM node:20-alpine

WORKDIR /app

# Copy package info
COPY apps/web/package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY apps/web ./

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
