"""MJML service for compiling MJML to HTML."""
import subprocess
import tempfile
import os
from typing import Optional

try:
    import mjml
    MJML_PYTHON_AVAILABLE = True
except ImportError:
    MJML_PYTHON_AVAILABLE = False


def compile_mjml_to_html(mjml_code: str) -> str:
    """
    Compile MJML code to HTML using the mjml Python package or CLI tool.
    
    Args:
        mjml_code: MJML code as string
        
    Returns:
        Compiled HTML as string
        
    Raises:
        ValueError: If MJML code is invalid or compilation fails
        RuntimeError: If mjml is not available
    """
    if not mjml_code or not mjml_code.strip():
        raise ValueError("MJML code cannot be empty")
    
    # Try using Python mjml package first
    if MJML_PYTHON_AVAILABLE:
        try:
            result = mjml.mjml_to_html(mjml_code)
            if result.errors:
                error_messages = [str(e) for e in result.errors]
                raise ValueError(f"MJML compilation failed: {', '.join(error_messages)}")
            return result.html
        except Exception as e:
            # Fall back to CLI if Python package fails
            pass
    
    # Fallback to CLI method
    # Create temporary file for MJML input
    with tempfile.NamedTemporaryFile(mode='w', suffix='.mjml', delete=False) as mjml_file:
        mjml_file.write(mjml_code)
        mjml_file_path = mjml_file.name
    
    try:
        # Create temporary file for HTML output
        with tempfile.NamedTemporaryFile(mode='r', suffix='.html', delete=False) as html_file:
            html_file_path = html_file.name
        
        try:
            # Call mjml command-line tool
            # mjml input.mjml -o output.html
            result = subprocess.run(
                ['mjml', mjml_file_path, '-o', html_file_path],
                capture_output=True,
                text=True,
                check=True
            )
            
            # Read compiled HTML
            with open(html_file_path, 'r') as f:
                html_output = f.read()
            
            return html_output
            
        except subprocess.CalledProcessError as e:
            error_message = e.stderr or e.stdout or "Unknown MJML compilation error"
            raise ValueError(f"MJML compilation failed: {error_message}")
        except FileNotFoundError:
            raise RuntimeError("mjml command not found. Please install mjml: npm install -g mjml")
        finally:
            # Clean up HTML temp file
            if os.path.exists(html_file_path):
                os.unlink(html_file_path)
    
    finally:
        # Clean up MJML temp file
        if os.path.exists(mjml_file_path):
            os.unlink(mjml_file_path)

