FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom configuration file from the current directory
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80
