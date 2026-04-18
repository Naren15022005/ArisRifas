#!/usr/bin/env bash
set -euo pipefail

# Simple deploy script for the server.
# Usage: run from the project root on the VPS: ./backend/deploy.sh

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR/backend"

echo "Pulling latest code..."
git fetch --all
git checkout main
git pull origin main

echo "Installing dependencies..."
npm ci

echo "Building backend..."
npm run build

echo "Ensuring dist entry exists:"
if [ ! -f dist/src/main.js ]; then
  echo "ERROR: dist/src/main.js not found. Build failed or output path changed." >&2
  exit 2
fi

echo "Restarting PM2 process 'rifas'..."
# Stop and delete previous process to avoid stale config
pm2 stop rifas || true
pm2 delete rifas || true

pm2 start dist/src/main.js --name rifas --cwd "$ROOT_DIR/backend" --update-env
pm2 save

echo "Deployment finished. Tailing logs (ctrl-c to exit)..."
pm2 logs rifas --lines 100
