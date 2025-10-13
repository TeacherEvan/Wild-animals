# Dockerfile for Wild Animals Adventure static site

# Use lightweight nginx to serve static content
FROM nginx:stable-alpine

# Copy all site files to nginx html folder
COPY . /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
