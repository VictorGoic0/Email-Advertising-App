"""Prompts module for OpenAI interactions."""
from .asset_categorization import CATEGORIZATION_SYSTEM_PROMPT, build_categorization_prompt
from .email_generation import EMAIL_GENERATION_SYSTEM_PROMPT, build_email_generation_prompt

__all__ = [
    "CATEGORIZATION_SYSTEM_PROMPT",
    "build_categorization_prompt",
    "EMAIL_GENERATION_SYSTEM_PROMPT",
    "build_email_generation_prompt",
]

