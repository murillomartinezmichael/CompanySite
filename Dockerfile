# Multi-stage build: compile Astro static output, then serve with nginx.
# Cloudflare Pages is the primary deploy target — this Dockerfile is the
# Railway/self-host fallback. Both stay in sync because both build from
# `npm run build`.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d
USER nginx
CMD ["sh", "-c", "sed -i s/NGINX_PORT/${PORT:-8080}/g /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
