# Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web/ .
COPY VERSION ../VERSION
RUN npm run build

# Build Backend
FROM golang:1.24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Copy built frontend from previous stage
COPY --from=frontend-builder /web/dist ./web/dist
RUN VERSION=$(cat VERSION) && \
    CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -ldflags "-X main.Version=${VERSION}" -o go-sentinel main.go

# Final Stage
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates sqlite-libs
RUN mkdir -p /app/data
COPY --from=builder /app/go-sentinel .
EXPOSE 8088
CMD ["./go-sentinel"]
