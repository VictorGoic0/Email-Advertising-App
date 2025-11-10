# Project Brief

## Project Overview

**Project Name**: Automated Email Advertising Workflow System  
**Project ID**: 7I6vCTUQoLBswu6xcOZW_1762636780105  
**Version**: 1.0 (MVP)  
**Target Completion**: Wednesday (3-day sprint)

## Core Mission

Build an AI-accelerated email advertising workflow system that automates asset collection, email proof generation, and approval processes. The system reduces campaign setup time from hours to minutes by leveraging AI (OpenAI) for intelligent asset categorization and email content generation.

## Primary Goals

1. **Automate Asset Collection**: Streamline upload and categorization of logos, images, URLs, and copy text
2. **AI-Powered Email Generation**: Generate professional email proofs in under 5 seconds using GPT-4
3. **Streamlined Approval Workflow**: Enable seamless communication between Advertisers and Campaign Managers
4. **Performance Monitoring**: Provide real-time system health metrics for Technical Support staff

## Success Criteria

MVP is successful if:
- ✅ Advertisers can upload assets and create campaigns in <5 minutes
- ✅ Email proofs generate in <5 seconds (average)
- ✅ Campaign Managers can approve/reject campaigns with reasons
- ✅ System supports 3 distinct user roles with appropriate access controls
- ✅ Performance monitoring dashboard displays all key metrics
- ✅ Asset categorization works with 90%+ accuracy (rules + optional AI)
- ✅ Zero data loss (all uploads persist to S3 and database)
- ✅ System handles 10+ concurrent users without degradation
- ✅ Backend tests pass for critical paths

## Scope Boundaries

### In Scope (MVP - P0 Features)
- Asset upload and categorization (rules-based + optional AI)
- Campaign creation and management
- AI-powered email proof generation (GPT-4 + MJML)
- Real-time email preview (desktop/mobile views)
- Approval workflow (submit, approve, reject)
- Performance monitoring dashboard
- Role-based access control (3 roles)
- Mock authentication (plain text passwords)

### Out of Scope (Post-MVP)
- Email sending integration
- Password hashing/security hardening
- Asset library UI (assets are per-campaign only)
- Campaign scheduling UI (data model ready, UI not implemented)
- Editorial review interface
- A/B testing
- Analytics tracking
- Multi-organization support
- Frontend testing
- Deployment (prioritizing functionality over deployment)

## Key Constraints

1. **Timeline**: 3-day MVP sprint (Monday-Wednesday)
2. **Security**: Minimal security for MVP speed (plain text passwords, X-User-ID header auth)
3. **Database**: SQLite for development, PostgreSQL for production (future)
4. **Deployment**: Not included in MVP scope
5. **Testing**: Backend tests only, at end of MVP

## Stakeholders

- **Advertisers**: Create campaigns, upload assets, submit for approval
- **Campaign Managers**: Review and approve/reject campaigns
- **Technical Support**: Monitor system performance and health

## Project Structure

```
Email-Advertising-App/
├── backend/          # FastAPI Python backend
├── frontend/         # React + Vite frontend
├── scripts/          # Utility scripts (seed data, health checks)
├── data/             # Seed data files
└── .cursor/
    └── memory-bank/  # Project documentation
```

## Documentation References

- **PRD**: `/PRD.md` - Complete technical requirements
- **Tasks**: `/tasks-1.md`, `/tasks-2.md`, `/tasks-3.md` - Implementation checklist
- **Architecture**: `/architecture.mermaid` - System architecture diagram

