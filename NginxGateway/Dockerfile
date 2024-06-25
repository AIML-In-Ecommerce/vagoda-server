# Use the official Nginx image from the Docker Hub
FROM nginx:alpine

# Remove the default.conf file from the container
RUN rm /etc/nginx/conf.d/default.conf

# Copy the Nginx configuration file to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]