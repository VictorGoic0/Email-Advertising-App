# Product Context

## Problem Statement

Email advertising campaign creation is a time-consuming, manual process that involves:
- Collecting and organizing various assets (logos, images, copy, URLs)
- Manually categorizing and placing assets in email templates
- Writing email copy aligned with campaign goals
- Coordinating approval workflows between teams
- Managing multiple iterations and revisions

This process typically takes hours per campaign and is prone to human error.

## Solution Overview

The Automated Email Advertising Workflow System automates the entire campaign creation pipeline:

1. **Intelligent Asset Collection**: Drag-and-drop upload with automatic categorization (rules + optional AI)
2. **AI-Powered Email Generation**: GPT-4 generates professional MJML email templates in seconds
3. **Streamlined Approval**: Digital workflow for Campaign Managers to review and approve/reject
4. **Performance Monitoring**: Real-time dashboards for system health tracking

## User Experience Goals

### For Advertisers
- Upload multiple assets simultaneously via drag-and-drop
- See automatic categorization with option to refine via AI
- Generate email proofs instantly (<5 seconds)
- Preview emails in desktop and mobile views
- Submit campaigns for approval with one click
- Track campaign status (draft, pending, approved, rejected)

### For Campaign Managers
- View all pending campaigns in a single queue
- See campaign details, advertiser info, and email preview
- Approve or reject with reason in seconds
- Sort by submission date (oldest first)

### For Technical Support
- Monitor API uptime and system health
- Track email generation performance (latency, percentiles)
- View approval queue depth
- Analyze approval rates over time

## Key User Flows

### Flow 1: Campaign Creation (Advertiser)
1. Navigate to "Create Campaign"
2. Upload assets (drag-and-drop or file picker)
3. Review auto-categorized assets
4. Optionally: Recategorize with AI or manually adjust
5. Fill in campaign details (name, audience, goal, notes)
6. Click "Generate Email Proof"
7. Preview generated email (desktop/mobile toggle)
8. Submit for approval or save as draft

### Flow 2: Campaign Approval (Campaign Manager)
1. Log in → See Approval Queue dashboard
2. View list of pending campaigns (sorted by oldest first)
3. Click campaign to view full details and email preview
4. Review email proof
5. Approve or Reject (with reason if rejecting)
6. Advertiser receives notification of decision

### Flow 3: Performance Monitoring (Tech Support)
1. Log in → See Performance Dashboard
2. View real-time metrics:
   - API uptime percentage (24h)
   - Average proof generation time (with P50/P95/P99)
   - Approval queue depth
   - Approval rate (7d, 30d)
3. Monitor system health status
4. Identify performance bottlenecks

## Product Principles

1. **Speed First**: Every operation should feel instant (<5 seconds for generation)
2. **AI-Assisted, Not AI-Controlled**: Users can override AI decisions at any point
3. **Role-Based Clarity**: Each role sees only what they need
4. **Progressive Enhancement**: Rules-based categorization first, AI as enhancement
5. **Transparency**: Show categorization method (rules/AI/manual) and generation time

## Success Metrics

- **Time to Campaign**: <5 minutes from upload to submission
- **Generation Speed**: <5 seconds average for email proof generation
- **Categorization Accuracy**: 90%+ correct categorization (rules + AI)
- **Approval Efficiency**: Campaign Managers can review in <30 seconds
- **System Reliability**: 99%+ uptime, <500ms API response time (p95)

## Future Vision (Post-MVP)

- **Phase 2**: Proper authentication, asset library, campaign scheduling, email sending
- **Phase 3**: Multi-org support, advanced analytics, A/B testing
- **Phase 4**: AI content optimization, CRM integrations, mobile app

