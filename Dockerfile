# syntax=docker/dockerfile:1

# No dependencies and no build step: the theme is the original static screen plus a
# Node server that talks to the CMS. The image is the repository.
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Nothing is compiled, so the source tree is the artifact.
COPY index.html styles.css app.js server.mjs package.json ./
COPY src ./src
COPY vendor ./vendor

# Run unprivileged.
USER node

EXPOSE 3000

# The container check stays local (`?live`) — a CMS blip must not mark every theme
# container unhealthy at once. IPv4 loopback on purpose: `localhost` can resolve to
# `::1` on IPv6-first images and the check then refuses to connect.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health?live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
