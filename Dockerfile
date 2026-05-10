FROM alpine:latest
WORKDIR /app
COPY . .
RUN echo "Build successful!"
EXPOSE 3000
CMD ["echo", "Container is running"]
