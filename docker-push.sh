#!/bin/bash
set -e

VERSION="${1:-v1.4.3}"

echo "=========================================================="
echo "🚀 Building & Pushing MomCare Images: $VERSION & latest"
echo "=========================================================="

echo "📦 1/2. Building & Pushing Backend ($VERSION, latest)..."
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/nghiapham0311/momcare-backend:$VERSION \
  -t ghcr.io/nghiapham0311/momcare-backend:latest \
  -f backend/Dockerfile ./backend --push

echo "📦 2/2. Building & Pushing Frontend ($VERSION, latest)..."
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/nghiapham0311/momcare-frontend:$VERSION \
  -t ghcr.io/nghiapham0311/momcare-frontend:latest \
  -f frontend/Dockerfile ./frontend --push

echo "=========================================================="
echo "✅ Build & Push completed successfully!"
echo "   - ghcr.io/nghiapham0311/momcare-backend:$VERSION / latest"
echo "   - ghcr.io/nghiapham0311/momcare-frontend:$VERSION / latest"
echo "=========================================================="