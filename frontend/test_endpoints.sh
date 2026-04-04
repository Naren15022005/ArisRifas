#!/usr/bin/env bash
# Prueba las funciones y una imagen pública desde Supabase
# Uso: ./test_endpoints.sh <SUPABASE_BASE_URL> <BUCKET> <IMAGE_NAME>
# Ejemplo: ./test_endpoints.sh https://gvbhwgpjqzbbflcjhdqx.supabase.co uploads mi.jpg

BASE=$1
# BUCKET: nombre del bucket (ej: uploads)
# IMAGE_NAME: ruta relativa dentro del bucket (sin el prefijo del bucket)
BUCKET=$2
IMAGE_NAME=$3

if [ -z "$BASE" ] || [ -z "$BUCKET" ] || [ -z "$IMAGE_PATH" ]; then
  echo "Usage: $0 <SUPABASE_BASE_URL> <BUCKET> <IMAGE_PATH>"
  exit 1
fi

echo "GET $BASE/functions/v1/raffles"
curl -i "$BASE/functions/v1/raffles"

echo "\nHEAD image public URL"
curl -I "$BASE/storage/v1/object/public/$BUCKET/$IMAGE_NAME"
