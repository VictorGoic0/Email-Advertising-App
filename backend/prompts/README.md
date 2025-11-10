# OpenAI Prompts

This directory contains structured prompts for AI-powered features in the email advertising workflow system.

## Structure

All prompts follow a consistent format inspired by best practices:
- **System Prompt**: Defines the AI's role, principles, and guidelines
- **User Prompt Builder**: Formats user-specific data into task instructions

## Files

### `asset_categorization.py`
**Purpose**: Categorize uploaded marketing assets (logos, images, copy, URLs)

**System Prompt Sections**:
- Core principles for classification accuracy
- Category definitions with examples
- Guidelines for edge cases
- Output format specification

**Key Features**:
- Detailed category definitions with naming patterns
- Clear fallback behavior (default to 'pending' only when uncertain)
- Emphasis on marketing asset context

---

### `email_generation.py`
**Purpose**: Generate responsive MJML email templates for campaigns

**System Prompt Sections**:
- Core design principles
- Technical MJML guidelines
- Email structure requirements
- Content strategy
- Performance considerations
- Common pitfalls to avoid

**Key Features**:
- Comprehensive MJML best practices
- Mobile-first, accessible design standards
- Asset utilization strategy
- Clear output format (pure MJML, no markdown)

---

## Usage

```python
from prompts import (
    CATEGORIZATION_SYSTEM_PROMPT,
    build_categorization_prompt,
    EMAIL_GENERATION_SYSTEM_PROMPT,
    build_email_generation_prompt,
)

# Categorization
system_msg = CATEGORIZATION_SYSTEM_PROMPT
user_msg = build_categorization_prompt(assets)

# Email generation
system_msg = EMAIL_GENERATION_SYSTEM_PROMPT
user_msg = build_email_generation_prompt(campaign_details, assets)
```

## Maintenance

When updating prompts:
1. Keep the structured format (Core Principles, Guidelines, Output Format)
2. Test changes with real API calls
3. Document any behavioral changes
4. Maintain backward compatibility with existing endpoints

## Prompt Engineering Best Practices

✅ **Do:**
- Provide clear role definition
- Include specific examples and patterns
- Define edge cases and fallback behavior
- Specify exact output format
- Give context about the domain (marketing, email design)

❌ **Don't:**
- Use vague instructions
- Assume the model knows domain-specific conventions
- Leave output format ambiguous
- Forget error cases

---

**Prompt Lengths**:
- Categorization: ~2,120 characters
- Email Generation: ~3,374 characters

