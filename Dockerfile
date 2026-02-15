# Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web/ .
RUN npm run build

# Build Backend
FROM golang:1.23-alpine AS builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Copy built frontend from previous stage
COPY --from=frontend-builder /web/dist ./web/dist
RUN CGO_ENABLED=1 GOOS=linux go build -o go-sentinel main.go

# Final Stage
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates sqlite-libs
COPY --from=builder /app/go-sentinel .
EXPOSE 8088
CMD ["./go-sentinel"]
