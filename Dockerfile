# ----------------------------------------------------------------------
# Dockerfile - CampusSpace
# A small, production-ready image based on Node.js Alpine.
# ----------------------------------------------------------------------

FROM node:20-alpine

# Optional build argument so CI can bake the git commit into the image.
# It is exposed as an env var so app.js can read it via process.env.
ARG GIT_SHA=local
ENV GIT_SHA=${GIT_SHA}

# Create and use a dedicated app directory
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application source
COPY . .

# Run as a non-root user for better container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Render / most hosts inject PORT at runtime; 3000 is the local default.
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
