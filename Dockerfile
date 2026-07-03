# Multi-stage: swap nginx's default confdir for our own, then run as non-root.
# nginx:alpine ships an `nginx` user (uid 101); we chown the served content
# and switch to it so a container escape doesn't land on root.
FROM nginx:alpine

# Config in place before we drop privileges
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Content owned by the nginx user
COPY --chown=nginx:nginx index.html /usr/share/nginx/html/index.html

# The stock main config writes pid to /var/run/nginx.pid and logs to
# /var/log/nginx/ — both root-owned by default. Loosen so the nginx user
# can boot without needing root.
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

CMD ["sh", "-c", "sed -i s/NGINX_PORT/${PORT:-8080}/g /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
