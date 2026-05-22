FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

RUN rm /etc/nginx/conf.d/default.conf && \
    echo 'server { listen 80; root /usr/share/nginx/html; index index.html; }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
