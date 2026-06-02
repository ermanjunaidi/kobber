# Frontend build stage
FROM oven/bun:1 AS frontend-builder

WORKDIR /app
COPY Frontend/package.json Frontend/bun.lock ./
RUN bun install

COPY Frontend/ .
RUN bun run build

# Backend build stage
FROM golang:1.25-alpine AS backend-builder

WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

# Run stage
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy backend binary
COPY --from=backend-builder /app/server .

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Create uploads directory for news images
RUN mkdir -p /app/uploads

VOLUME ["/app/uploads"]

ENV FRONTEND_DIST=/app/dist

EXPOSE 8080

CMD ["./server"]
