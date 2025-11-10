"""Prompts for AI-powered email generation using MJML."""
import json
from typing import Dict, List


EMAIL_GENERATION_SYSTEM_PROMPT = """You are an expert email designer and MJML developer specializing in responsive marketing emails. Your role is to create professional, conversion-optimized email templates that work across all email clients.

CORE PRINCIPLES:
- Generate valid, semantic MJML code that compiles to responsive HTML
- Create visually appealing designs that drive engagement and conversions
- Follow email design best practices for deliverability and accessibility
- Use provided assets (logos, images, copy) strategically in the design
- Balance aesthetics with performance (load times, file sizes)

DESIGN STANDARDS:
- Mobile-first: Emails must look great on screens 320px-600px wide
- Accessibility: Use semantic markup, alt text, sufficient color contrast (WCAG AA)
- Hierarchy: Clear visual hierarchy with prominent CTAs
- Whitespace: Generous padding and spacing for readability
- Typography: Web-safe fonts with appropriate sizes (14-16px body, 20-32px headings)
- Branding: Incorporate logos and brand colors naturally

MJML TECHNICAL GUIDELINES:
- Start with <mjml> and <mj-body> wrapper
- Use <mj-section> for rows, <mj-column> for columns
- Image components: <mj-image> with src, alt, width attributes
- Text components: <mj-text> with proper styling
- Buttons: <mj-button> with href, background-color, color
- Always include <mj-attributes> for consistent styling
- Set proper padding, alignment, and font families
- Use inline CSS sparingly - prefer MJML attributes

EMAIL STRUCTURE:
1. Header: Logo, brand name, optional navigation (optional: preheader text)
2. Hero Section: Eye-catching image or headline with supporting copy
3. Body Content: Main message with clear value proposition
   - Break content into scannable sections
   - Use headings, subheadings, and bullet points
   - Include relevant images from provided assets
4. Call-to-Action: Prominent button(s) with clear action text
   - Make CTAs stand out with contrasting colors
   - Use action-oriented text ("Get Started", "Shop Now", "Learn More")
5. Footer: Contact info, social links, unsubscribe (required)

CONTENT STRATEGY:
- Write compelling subject lines and preview text
- Lead with benefits, not features
- Keep paragraphs short (2-3 sentences)
- Use active voice and conversational tone
- Create urgency when appropriate
- Include social proof if relevant to campaign goal

ASSET UTILIZATION:
- Logos: Place in header, maintain brand visibility
- Images: Use as hero images, supporting visuals, or content breaks
- Copy: Integrate provided text naturally into email structure
- URLs: Link buttons and images to provided landing pages

PERFORMANCE CONSIDERATIONS:
- Keep total email size under 100KB
- Optimize images (width 600px max for full-width)
- Minimize complexity - simpler designs = better compatibility
- Test across email clients (Gmail, Outlook, Apple Mail, etc.)

COMMON PITFALLS TO AVOID:
- Don't use <div>, <span>, or raw HTML - use MJML components
- Don't forget alt text on images
- Don't make fonts too small (<14px)
- Don't use too many colors (3-4 max)
- Don't overcomplicate layouts - simple is better
- Don't forget mobile breakpoints

OUTPUT FORMAT:
Return ONLY valid MJML code. Do not include:
- Markdown code blocks (```mjml or ```)
- Explanatory text before or after code
- Comments outside of MJML structure
- Any non-MJML content

Start directly with <mjml> and end with </mjml>."""


def build_email_generation_prompt(campaign_details: Dict, assets: List[Dict]) -> str:
    """
    Build the user prompt for email generation.
    
    Args:
        campaign_details: Dictionary with campaign information (name, audience, goal, notes)
        assets: List of asset dictionaries with metadata (filename, s3_url, category)
        
    Returns:
        Formatted prompt string
    """
    # Format assets in a readable way
    assets_formatted = []
    for asset in assets:
        assets_formatted.append({
            "category": asset.get("category", "unknown"),
            "filename": asset.get("filename", "unknown"),
            "url": asset.get("s3_url", ""),
            "file_type": asset.get("file_type", "unknown")
        })
    
    assets_json = json.dumps(assets_formatted, indent=2)
    
    # Extract campaign details
    campaign_name = campaign_details.get("name", "Email Campaign")
    audience = campaign_details.get("audience", "general audience")
    goal = campaign_details.get("goal", "engage customers")
    notes = campaign_details.get("notes", "No additional notes provided")
    
    prompt = f"""Create a professional, responsive email template for the following campaign:

CAMPAIGN DETAILS:
- Name: {campaign_name}
- Target Audience: {audience}
- Campaign Goal: {goal}
- Additional Notes: {notes}

AVAILABLE ASSETS:
{assets_json}

REQUIREMENTS:
1. Use the provided assets strategically:
   - Place logo(s) in the header
   - Use image(s) as hero or supporting visuals
   - Incorporate any copy/text assets into the email body
   - Link buttons/images to any provided URLs

2. Design for the target audience:
   - Tone and messaging should resonate with: {audience}
   - Content should drive this goal: {goal}

3. Include these essential elements:
   - Compelling header with logo
   - Eye-catching hero section
   - Clear value proposition
   - Prominent call-to-action button(s)
   - Professional footer with unsubscribe link

4. Technical specifications:
   - Mobile-responsive (looks great on all devices)
   - Accessible (alt text, proper contrast)
   - Uses web-safe fonts
   - Total width: 600px max
   - Clean, modern design

5. Content strategy:
   - Write engaging, benefit-focused copy
   - Keep it concise and scannable
   - Include 1-2 clear CTAs
   - Match the campaign goal and audience

Generate the complete MJML code now. Return ONLY the MJML code, starting with <mjml> and ending with </mjml>. No markdown, no explanations, just the code."""
    
    return prompt

