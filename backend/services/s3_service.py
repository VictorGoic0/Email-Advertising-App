"""S3 service for file uploads and management."""
import boto3
from botocore.exceptions import ClientError, BotoCoreError
from typing import Tuple, Optional
import mimetypes
import os

from config import settings


class S3Service:
    """Service for interacting with AWS S3."""
    
    def __init__(self):
        """Initialize S3 client with credentials from settings."""
        self.bucket_name = settings.AWS_S3_BUCKET
        self.region = settings.AWS_REGION
        
        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=self.region
        )
    
    def upload_file(
        self,
        file_content: bytes,
        filename: str,
        user_id: str,
        content_type: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Upload file to S3 and generate pre-signed URL.
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            user_id: ID of the user uploading the file
            content_type: MIME type of the file (auto-detected if not provided)
            
        Returns:
            Tuple of (s3_key, s3_url) where s3_url is a pre-signed URL (7 day expiration)
            
        Raises:
            Exception: If S3 upload fails
        """
        # Generate unique S3 key: users/{user_id}/{filename}
        s3_key = f"users/{user_id}/{filename}"
        
        # Determine content type if not provided
        if not content_type:
            content_type = self._get_content_type(filename)
        
        try:
            # Upload file to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=content_type
            )
            
            # Generate pre-signed URL (7 day expiration)
            s3_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=604800  # 7 days in seconds
            )
            
            return s3_key, s3_url
            
        except (ClientError, BotoCoreError) as e:
            raise Exception(f"Failed to upload file to S3: {str(e)}")
    
    def delete_file(self, s3_key: str) -> None:
        """
        Delete file from S3.
        
        Args:
            s3_key: S3 object key to delete
            
        Raises:
            Exception: If S3 deletion fails
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
        except (ClientError, BotoCoreError) as e:
            raise Exception(f"Failed to delete file from S3: {str(e)}")
    
    def _get_content_type(self, filename: str) -> str:
        """
        Get MIME type for a filename.
        
        Args:
            filename: Name of the file
            
        Returns:
            MIME type string (defaults to 'application/octet-stream')
        """
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or 'application/octet-stream'


# Global S3 service instance
s3_service = S3Service()

