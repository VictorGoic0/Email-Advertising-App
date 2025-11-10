#!/bin/bash
# Script to set S3 CORS configuration using AWS CLI
# Uses the s3-cors.json file from the project root

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORS_CONFIG="$PROJECT_ROOT/s3-cors.json"
BUCKET_NAME="${AWS_S3_BUCKET:-email-assets-dev-goico}"

if [ ! -f "$CORS_CONFIG" ]; then
    echo "Error: $CORS_CONFIG not found!"
    exit 1
fi

echo "Setting CORS configuration on bucket: $BUCKET_NAME"
echo "Using configuration from: $CORS_CONFIG"
echo ""

# Apply CORS configuration
aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration "file://$CORS_CONFIG"

echo "✅ CORS configuration applied successfully!"
echo ""

# Verify the configuration
echo "Current CORS configuration:"
aws s3api get-bucket-cors --bucket "$BUCKET_NAME" --output json

echo "✅ CORS configuration verified successfully!"