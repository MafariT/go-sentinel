#!/bin/bash

if ! command -v air &> /dev/null
then
    echo "Installing 'air' for Go hot-reload..."
    go install github.com/air-verse/air@latest
fi

echo "Starting Go-Sentinel Dev Environment..."

cleanup() {
    echo "Stopping dev environment..."
    kill $(jobs -p)
    exit
}

trap cleanup SIGINT

air &

cd web
npm run dev
