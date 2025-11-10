"""OpenAI service for AI-powered asset categorization and email generation."""
from openai import OpenAI
from typing import Dict, List, Optional
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import json
import re

from config import settings
from prompts import (
    CATEGORIZATION_SYSTEM_PROMPT,
    build_categorization_prompt,
    EMAIL_GENERATION_SYSTEM_PROMPT,
    build_email_generation_prompt,
)


class OpenAIService:
    """Service for interacting with OpenAI API."""
    
    def __init__(self):
        """Initialize OpenAI client with API key from settings."""
        self._client = None
        self.model = "gpt-3.5-turbo"
        self.email_model = "gpt-4"
    
    @property
    def client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is not set in environment variables")
            self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((Exception,)),
        reraise=True
    )
    def categorize_assets(self, assets: List[Dict]) -> Dict[str, str]:
        """
        Categorize multiple assets using GPT-3.5-turbo.
        
        Args:
            assets: List of asset dictionaries with keys: id, filename, file_type, category
            
        Returns:
            Dictionary mapping asset_id to category (logo, image, copy, url, or pending)
            
        Raises:
            Exception: If OpenAI API call fails after retries
        """
        if not assets:
            return {}
        
        # Build prompt from prompts module
        prompt = build_categorization_prompt(assets)
        
        try:
            # Call OpenAI API with system prompt from prompts module
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": CATEGORIZATION_SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for more consistent categorization
                response_format={"type": "json_object"}
            )
            
            # Parse JSON response
            response_text = response.choices[0].message.content
            result = json.loads(response_text)
            
            # Extract categorization mapping
            # Expected format: {"asset_id": "category", ...}
            categorization_map = {}
            for asset in assets:
                asset_id = asset["id"]
                # Try to get category from result, fallback to pending
                category = result.get(asset_id, "pending")
                if isinstance(category, str):
                    category = category.lower()
                else:
                    category = "pending"
                
                # Validate category
                valid_categories = ["logo", "image", "copy", "url", "pending"]
                if category in valid_categories:
                    categorization_map[asset_id] = category
                else:
                    # Fallback to pending if invalid category
                    categorization_map[asset_id] = "pending"
            
            return categorization_map
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse OpenAI response as JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"OpenAI API call failed: {str(e)}")
    
    
    def generate_email_mjml(
        self,
        campaign_details: Dict,
        assets: List[Dict]
    ) -> str:
        """
        Generate email MJML code using GPT-4.
        
        Args:
            campaign_details: Dictionary with campaign information (name, audience, goal, notes)
            assets: List of asset dictionaries with metadata
            
        Returns:
            MJML code as string
            
        Raises:
            Exception: If OpenAI API call fails
        """
        # Build prompt from prompts module
        prompt = build_email_generation_prompt(campaign_details, assets)
        
        try:
            # Call OpenAI API with system prompt from prompts module
            response = self.client.chat.completions.create(
                model=self.email_model,
                messages=[
                    {
                        "role": "system",
                        "content": EMAIL_GENERATION_SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7
            )
            
            mjml_code = response.choices[0].message.content
            
            # Clean markdown code blocks if present
            mjml_code = self._clean_markdown_blocks(mjml_code)
            
            return mjml_code
            
        except Exception as e:
            raise Exception(f"Failed to generate email MJML: {str(e)}")
    
    
    def _clean_markdown_blocks(self, text: str) -> str:
        """
        Remove markdown code blocks from text.
        
        Args:
            text: Text that may contain markdown code blocks
            
        Returns:
            Cleaned text without markdown blocks
        """
        # Remove ```mjml or ``` blocks
        text = re.sub(r'```mjml\s*\n?', '', text)
        text = re.sub(r'```\s*\n?', '', text)
        text = re.sub(r'\n?```\s*$', '', text)
        
        return text.strip()


# Global OpenAI service instance
openai_service = OpenAIService()

