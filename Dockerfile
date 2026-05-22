FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

RUN echo 'server { listen $PORT; root /usr/share/nginx/html; index index.html; }' > /etc/nginx/templates/default.conf.template

ENV PORT=80

EXPOSE 80
