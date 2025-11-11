#!/bin/bash
# Script to create and configure production S3 bucket for email advertising app
# Bucket name: email-assets-prod-goico
# Region: us-east-2

set -e

BUCKET_NAME="email-assets-prod-goico"
REGION="us-east-2"
NETLIFY_URL="https://email-advertising-generator.netlify.app"
CORS_CONFIG_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/s3-cors-prod.json"

echo "🚀 Setting up production S3 bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Step 1: Create the bucket
echo "Step 1: Creating S3 bucket..."
aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION"

echo "✅ Bucket created successfully!"
echo ""

# Step 2: Enable versioning (optional but recommended for production)
echo "Step 2: Enabling versioning..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled

echo "✅ Versioning enabled!"
echo ""

# Step 3: Block public access (keep bucket private)
echo "Step 3: Configuring public access settings..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "✅ Public access blocked (bucket remains private)"
echo ""

# Step 4: Set up CORS configuration
echo "Step 4: Configuring CORS..."
if [ ! -f "$CORS_CONFIG_FILE" ]; then
    echo "⚠️  CORS config file not found: $CORS_CONFIG_FILE"
    echo "Creating CORS config file..."
    cat > "$CORS_CONFIG_FILE" <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": [
        "*"
      ],
      "AllowedMethods": [
        "GET",
        "HEAD",
        "PUT",
        "POST"
      ],
      "AllowedOrigins": [
        "$NETLIFY_URL",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176"
      ],
      "ExposeHeaders": [
        "ETag",
        "Content-Length",
        "Content-Type"
      ],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF
    echo "✅ CORS config file created: $CORS_CONFIG_FILE"
fi

aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration "file://$CORS_CONFIG_FILE"

echo "✅ CORS configuration applied!"
echo ""

# Step 5: Verify bucket exists
echo "Step 5: Verifying bucket..."
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q "NoSuchBucket"; then
    echo "❌ Error: Bucket verification failed"
    exit 1
fi

echo "✅ Bucket verified and accessible!"
echo ""

# Step 6: Display bucket information
echo "📋 Bucket Information:"
echo "   Name: $BUCKET_NAME"
echo "   Region: $REGION"
echo "   Versioning: Enabled"
echo "   Public Access: Blocked"
echo "   CORS: Configured for $NETLIFY_URL"
echo ""

echo "✅ Production S3 bucket setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure IAM policy for Railway service to access this bucket"
echo "2. Set AWS_S3_BUCKET=$BUCKET_NAME in Railway environment variables"
echo "3. Test bucket access from Railway deployment"

