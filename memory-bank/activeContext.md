# Active Context

## Current Status

**Phase**: Backend Development  
**Date**: PR #8 Complete  
**Focus**: Backend testing (PR #9)

## Recent Changes

- ✅ **PR #8 Complete**: Performance monitoring dashboard (backend)
  - Created `/backend/services/health_service.py` with health check functions:
    - `check_api_health()` - Checks API health via database connectivity
    - `check_s3_health()` - Checks S3 service by listing bucket contents
    - `check_database_health()` - Checks database with simple query
    - `check_openai_health()` - Checks OpenAI API connectivity
    - `perform_all_health_checks()` - Runs all checks and records results
  - Created `/backend/routers/metrics.py` with metrics endpoints:
    - `GET /api/metrics/uptime` - Returns uptime metrics for components (api, s3, database, openai) over last 24 hours
    - `GET /api/metrics/proof-generation` - Returns proof generation performance metrics (average, P50, P95, P99)
    - `GET /api/metrics/queue-depth` - Returns current approval queue depth
    - `GET /api/metrics/approval-rate` - Returns approval rate metrics with breakdown (accepts days parameter)
    - All endpoints require `tech_support` role
  - Created `/backend/schemas/metrics.py` with response schemas:
    - `UptimeMetricsResponse`, `ProofGenerationMetricsResponse`, `QueueDepthMetricsResponse`, `ApprovalRateMetricsResponse`
  - Created `/scripts/health_check_worker.py` for background health checks:
    - Runs health checks every 5 minutes
    - Records results in `system_health` table
    - Includes error handling and logging
  - Registered metrics router in `main.py`
  - All implementation tasks complete (8.1-8.32), testing deferred until PR #9

- ✅ **PR #7 Complete**: Approval workflow (backend)
  - Added `POST /api/campaigns/{campaign_id}/submit` endpoint
    - Verifies user is advertiser
    - Verifies campaign belongs to current user
    - Verifies campaign has generated email (both HTML and MJML)
    - Updates campaign status to "pending_approval"
    - Updates `updated_at` timestamp
  - Added `GET /api/campaigns/approval-queue` endpoint
    - Verifies user is campaign_manager
    - Queries campaigns with status "pending_approval"
    - Sorts by created_at (oldest first)
  - Added `POST /api/campaigns/{campaign_id}/approve` endpoint
    - Verifies user is campaign_manager
    - Updates status to "approved"
    - Sets reviewed_by and reviewed_at
    - Records approval metric
  - Added `POST /api/campaigns/{campaign_id}/reject` endpoint
    - Verifies user is campaign_manager
    - Accepts rejection_reason in request body (RejectionRequest schema)
    - Validates rejection_reason is not empty
    - Updates status to "rejected"
    - Sets reviewed_by, reviewed_at, and rejection_reason
    - Records rejection metric
  - Added metrics helper functions in `crud/metrics.py`:
    - `get_queue_depth()` - Calculate current approval queue depth
    - `calculate_approval_rate()` - Calculate approval rate over time period
    - `calculate_time_to_approval()` - Calculate average time to approval
  - Created `RejectionRequest` and `SuccessMessage` schemas
  - All implementation tasks complete (7.1-7.34), testing deferred until PR #9

- ✅ **PR #6 Complete**: Email proof generation with AI (backend)
  - Created `/backend/services/mjml_service.py` with `compile_mjml_to_html` function
    - Uses Python mjml package API when available, falls back to CLI
    - Error handling for invalid MJML and missing dependencies
  - Created `/backend/crud/metrics.py` with `record_metric` function
    - Records performance metrics with type, value, and optional metadata
    - Exported in `crud/__init__.py`
  - Added `POST /api/campaigns/{campaign_id}/generate-proof` endpoint to campaign router
    - Fetches campaign with linked assets from database
    - Verifies campaign belongs to current user
    - Calls OpenAI service to generate MJML (GPT-4, temperature 0.7)
    - Compiles MJML to HTML using MJML service
    - Updates campaign with `generated_email_mjml` and `generated_email_html`
    - Records performance metric with generation time and metadata
    - Returns `ProofGenerationResponse` with MJML, HTML, and generation_time
    - Comprehensive error handling for OpenAI failures, MJML compilation errors, and permission issues
  - Added `ProofGenerationResponse` schema to campaign schemas
  - All implementation tasks complete (6.1-6.30), testing deferred until UI is ready (similar to PR #5)

- ✅ **PR #5 Complete**: Campaign creation & management (backend)
  - Created `/backend/schemas/campaign.py` with comprehensive campaign schemas:
    - `CampaignStatus` enum (draft, pending_approval, approved, rejected)
    - `CampaignCreate`, `CampaignResponse`, `CampaignUpdate`, `CampaignWithAssets`
    - `CampaignAssetResponse` for campaign-asset relationships
  - Created `/backend/routers/campaign.py` with full CRUD operations:
    - `POST /api/campaigns` - Create campaign with linked assets (status: draft)
    - `GET /api/campaigns` - Role-based filtering (advertisers see own, managers see pending)
    - `GET /api/campaigns/{campaign_id}` - Get campaign with assets (permission checks)
    - `PATCH /api/campaigns/{campaign_id}` - Update campaign details (only draft campaigns)
    - `DELETE /api/campaigns/{campaign_id}` - Delete campaign (only draft campaigns, cascades)
  - Created `/backend/crud/campaign.py` with database query functions:
    - `get_campaigns_by_user()` - Get all campaigns for a user
    - `get_campaigns_by_status()` - Get campaigns by status
    - `get_campaign_with_assets()` - Get campaign with eager-loaded assets
    - `link_assets_to_campaign()` - Link assets to campaign
  - Registered campaign router in `main.py`
  - Role-based access control: advertisers see own campaigns, managers see pending approval
  - Status validation: only draft campaigns can be updated/deleted
  - Asset validation: verifies all assets belong to user before linking
  - All implementation tasks complete (5.1-5.30), testing deferred until UI is ready

- ✅ **PR #4 Complete**: AI asset recategorization (backend)
  - Created `/backend/services/openai_service.py` with OpenAI client integration
  - Implemented `categorize_assets()` method using GPT-3.5-turbo with retry logic
  - Created `/backend/prompts/` module with structured prompts:
    - `asset_categorization.py`: Comprehensive categorization prompt with core principles, category definitions, guidelines
    - `email_generation.py`: Detailed email generation prompt with MJML best practices, design standards, content strategy
  - Added `POST /api/assets/recategorize` endpoint for AI-powered recategorization
  - Added `PATCH /api/assets/{asset_id}/category` endpoint for manual category updates
  - Updated `config.py` to support `.env.local` file (takes precedence over `.env`)
  - All endpoints tested and working
  - OpenAI service includes `generate_email_mjml()` method for PR #6 (email generation)

- ✅ **PR #3 Complete**: Asset upload & S3 integration (backend)
  - Created `/backend/services` directory with S3 and categorization services
  - Implemented S3 service (`s3_service.py`) with upload, pre-signed URL generation, and deletion
  - Implemented categorization service (`categorization_service.py`) with rules-based detection
  - Created asset schemas (`AssetCreate`, `AssetResponse`, `AssetUpdate`) with validators
  - Created asset router (`asset.py`) with full CRUD operations:
    - `POST /api/assets/upload` - Upload file to S3, categorize, store metadata
    - `GET /api/assets` - Get all user's assets
    - `GET /api/assets/{asset_id}` - Get specific asset
    - `DELETE /api/assets/{asset_id}` - Delete asset from S3 and database
  - Registered asset router in `main.py`
  - Created S3 bucket `email-assets-dev-goico` in us-east-2 region
  - All endpoints tested and working via Swagger UI
  - Updated config with AWS_REGION (us-east-2)

- ✅ **PR #2 Complete**: Authentication system (backend)
  - Created `/backend/routers` directory and `auth.py` router
  - Implemented `POST /api/auth/login` endpoint with email/password authentication
  - Created `/backend/dependencies.py` with `get_current_user` dependency function
  - Created `/backend/schemas` directory with user Pydantic models (UserResponse, LoginRequest, LoginResponse)
  - Registered auth router in `main.py`
  - Tested login endpoint with valid/invalid credentials
  - Updated README with authentication flow documentation
  - Added `email-validator` to requirements.txt

- ✅ **PR #1 Complete**: Project setup & database foundation
  - Project structure created (`/backend`, `/frontend`, `/scripts`, `/data`)
  - Backend setup: FastAPI app, virtual environment, dependencies installed
  - Database models: All 6 models created (User, Asset, Campaign, CampaignAsset, PerformanceMetric, SystemHealth)
  - Alembic migrations: Initial migration generated and applied
  - Seed data: JSON file and Python script created (ready to run)
  - CORS configured for Vite dev servers (ports 5173-5177)
  - Health endpoint created

## Next Steps

### Immediate (PR #9)
1. **PR #9**: Backend testing
   - Pytest setup with fixtures
   - Tests for all routers (auth, asset, campaign, metrics)
   - Test critical paths and role-based access control

### Long-term (PR #10-17)
10. **PR #10**: Frontend setup & authentication
11. **PR #11**: Asset upload UI
12. **PR #12**: Campaign creation UI
13. **PR #13**: Email preview & generation UI
14. **PR #14**: Approval queue UI
15. **PR #15**: Performance monitoring UI
16. **PR #16**: Role-based dashboard & navigation
17. **PR #17**: UI polish & final touches

## Active Decisions

### Technical Decisions Made
1. **FastAPI over Flask**: Better async support, auto-docs, type safety
2. **SQLite for dev**: Zero config, fast iteration
3. **shadcn/ui over Material-UI**: More control, less bloat
4. **Axios over React Query**: Simpler for MVP, less abstraction
5. **Mock auth for MVP**: Speed over security (post-MVP hardening)

### Pending Decisions
1. **Deployment timeline**: Post-MVP, but need to plan

## Current Work Focus

**Primary Goal**: Backend testing and quality assurance
- PR #1 foundation complete ✅
- Authentication backend (PR #2) - complete ✅
- Asset upload system (PR #3) - complete ✅
- AI recategorization (PR #4) - complete ✅
- Campaign management (PR #5) - complete ✅
- Email proof generation (PR #6) - complete ✅
- Approval workflow (PR #7) - complete ✅
- Performance monitoring (PR #8) - complete ✅
- Backend testing (PR #9) - next

## Blockers & Risks

### Known Blockers
- None currently

### Potential Risks
1. **OpenAI API rate limits**: May need to implement queuing if high volume
2. **S3 configuration**: ✅ AWS credentials configured, bucket created (`email-assets-dev-goico`)
3. **MJML Node.js dependency**: Requires Node.js installed for Python package
4. **Timeline pressure**: 3-day MVP is aggressive, prioritize P0 features

## Key Files to Reference

- **PRD**: `/PRD.md` - Complete technical requirements
- **Tasks**: `/tasks-1.md`, `/tasks-2.md`, `/tasks-3.md` - Implementation checklist
- **Architecture**: `/architecture.mermaid` - System diagram

## Development Workflow

### Branch Strategy
- `main`: Production-ready code (protected)
- `develop`: Integration branch
- `feature/*`: Individual features
- `bugfix/*`: Bug fixes

### Commit Convention
```
feat: Add asset upload functionality
fix: Resolve S3 upload timeout issue
docs: Update API documentation
refactor: Simplify AI categorization logic
```

## Testing Strategy

### Backend (End of MVP)
- Pytest with async support
- Test critical paths: auth, upload, generation, approval
- Mock external services (S3, OpenAI)

### Frontend (Post-MVP)
- Not included in MVP scope
- Future: React Testing Library, Playwright E2E

## Performance Targets

- Email generation: <5 seconds
- Asset upload: <3 seconds
- API response: <500ms (p95)
- Frontend load: <2 seconds

## Notes

- MVP prioritizes functionality over deployment
- Security is intentionally minimal for speed (post-MVP hardening)
- Focus on P0 features only, P1/P2 are documented but not implemented
- Backend testing at end of MVP, frontend testing post-MVP

