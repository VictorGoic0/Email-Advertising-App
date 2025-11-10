"""Asset categorization service using rules engine."""
from typing import Tuple
import os


def categorize_asset(filename: str, file_type: str) -> Tuple[str, str]:
    """
    Categorize an asset using rules-based detection.
    
    Args:
        filename: Name of the uploaded file
        file_type: MIME type of the file
        
    Returns:
        Tuple of (category, categorization_method)
        - category: One of 'logo', 'image', 'copy', 'url', or 'pending'
        - categorization_method: 'rules' or 'pending'
    """
    filename_lower = filename.lower()
    file_extension = os.path.splitext(filename_lower)[1]
    
    # Rule 1: Logo detection (filename contains "logo")
    if "logo" in filename_lower:
        return ("logo", "rules")
    
    # Rule 2: Text file extensions
    text_extensions = [".txt", ".doc", ".docx", ".pdf", ".rtf"]
    if file_extension in text_extensions:
        return ("copy", "rules")
    
    # Rule 3: Image file extensions
    image_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]
    if file_extension in image_extensions:
        # Check if it's a logo by filename
        if "logo" in filename_lower:
            return ("logo", "rules")
        return ("image", "rules")
    
    # Rule 4: URL detection (if filename looks like a URL)
    if filename_lower.startswith(("http://", "https://", "www.")):
        return ("url", "rules")
    
    # Fallback: pending category
    return ("pending", "rules")

