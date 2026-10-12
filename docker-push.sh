docker tag momcare-frontend:latest ghcr.io/nghiapham0311/momcare-frontend:v1.0.0
docker push ghcr.io/nghiapham0311/momcare-frontend:v1.0.0
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/nghiapham0311/momcare-frontend:v1.0.0 --push .

docker tag momcare-backend:latest ghcr.io/nghiapham0311/momcare-backend:v1.0.0
docker push ghcr.io/nghiapham0311/momcare-backend:v1.0.0
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/nghiapham0311/momcare-backend:v1.0.0 --push .