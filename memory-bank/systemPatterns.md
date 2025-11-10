# System Patterns

## Architecture Overview

The system follows a **3-tier architecture**:
- **Frontend**: React SPA (Vite + TypeScript)
- **Backend**: FastAPI REST API (Python)
- **Database**: SQLite (dev) / PostgreSQL (prod)

External services: AWS S3 (storage), OpenAI API (AI), MJML (email compilation)

### Database Schema (✅ Implemented)
- **6 tables**: users, assets, campaigns, campaign_assets, performance_metrics, system_health
- **Relationships**: User → Assets (1:N), User → Campaigns (1:N), Campaign ↔ Assets (N:M)
- **Migrations**: Alembic configured, initial migration applied
- **Models**: All SQLAlchemy models in `/backend/models/` with proper relationships and indexes

## Core Design Patterns

### 1. Service Layer Pattern
All external integrations and complex business logic live in `/backend/services/`:
- `s3_service.py`: S3 file operations ✅ (upload, pre-signed URLs, deletion)
- `categorization_service.py`: Rules-based categorization ✅ (logo, image, copy, url detection)
- `openai_service.py`: AI categorization and email generation ✅ (GPT-3.5-turbo for categorization, GPT-4 for email generation)
- `mjml_service.py`: MJML compilation ✅ (Python package API with CLI fallback)
- `health_service.py`: System health checks ✅ (API, S3, database, OpenAI health monitoring)

**Prompts Module**: Structured prompts live in `/backend/prompts/`:
- `asset_categorization.py`: Comprehensive categorization prompt with core principles, category definitions, guidelines
- `email_generation.py`: Detailed email generation prompt with MJML best practices, design standards, content strategy
- Follows structured format: Core Principles → Guidelines → Output Format

**Rationale**: Separates concerns, enables testing, allows swapping implementations.

### 2. Router-Based API Organization
API endpoints organized by domain in `/backend/routers/`:
- `auth.py`: Authentication endpoints ✅ (login endpoint implemented)
- `asset.py`: Asset CRUD operations ✅ (upload, get all, get one, delete, recategorize, manual category update)
- `campaign.py`: Campaign management ✅ (create, get all, get one, update, delete, generate-proof with role-based filtering)
- `metrics.py`: Performance monitoring endpoints ✅ (uptime, proof-generation, queue-depth, approval-rate - tech_support only)

**Rationale**: Clear separation of concerns, easy to navigate, scales well.

### 3. Dependency Injection (FastAPI)
User authentication handled via FastAPI dependencies:
```python
async def get_current_user(
    x_user_id: str = Header(alias="X-User-ID"),
    db: Session = Depends(get_db)
) -> User:
    # Extract user from header, query database, return User object
    # Returns 401 if user not found
```

**Implementation**: Located in `/backend/dependencies.py`, used in protected endpoints.

**Rationale**: Reusable, testable, follows FastAPI best practices.

### 4. Context API (React)
Global state (authentication) managed via React Context:
- `AuthContext`: User state, login/logout functions
- Accessed via `useAuth()` hook throughout app

**Rationale**: Simple for MVP, no need for Redux/Zustand complexity.

### 5. Custom Hooks Pattern (React)
API calls abstracted into reusable hooks:
- `useAuth()`: Authentication operations ✅
- `useAssets()`: Asset CRUD operations ✅ (fetch, upload, delete, recategorize, updateCategory)
- `useCampaigns()`: Campaign operations
- `useMetrics()`: Performance metrics

**Rationale**: Reusable logic, consistent error handling, loading states.

## Data Flow Patterns

### Asset Upload Flow ✅ Implemented
```
User uploads file
  → Frontend sends multipart/form-data
  → Backend receives file (POST /api/assets/upload)
  → S3 Service uploads to S3 (users/{user_id}/{filename})
  → S3 Service generates pre-signed URL (7-day expiration)
  → Categorization Service categorizes (rules: logo, image, copy, url, pending)
  → Asset record created in DB with metadata
  → Response with AssetResponse (201 Created)
  → Frontend displays asset card
```

### Email Generation Flow ✅ Implemented
```
User clicks "Generate Email Proof"
  → Frontend calls POST /api/campaigns/{id}/generate-proof
  → Backend fetches campaign + assets (get_campaign_with_assets)
  → Verifies campaign belongs to user
  → OpenAI Service generates MJML (GPT-4, temperature 0.7)
  → MJML Service compiles to HTML (Python package API or CLI)
  → Campaign updated with generated_email_mjml + generated_email_html
  → Performance metric recorded (proof_generation_time with metadata)
  → Response with ProofGenerationResponse (MJML, HTML, generation_time)
  → Frontend renders preview in iframe
```

### Approval Workflow Flow
```
Advertiser submits campaign
  → Status: draft → pending_approval
  → Campaign Manager views approval queue
  → Manager reviews email preview
  → Manager approves/rejects
  → Status updated, reviewed_by/reviewed_at set
  → Metric recorded (approval/rejection)
  → Advertiser sees updated status
```

## Database Patterns

### UUID Primary Keys
All tables use UUID primary keys for:
- Security (non-sequential IDs)
- Distributed system compatibility
- Future multi-tenant support

### Soft Relationships
- `campaign_assets`: Junction table for many-to-many (campaigns ↔ assets)
- Allows asset reuse across campaigns
- Tracks asset role and display order

### Status Enums
Campaign status tracked via CHECK constraints:
- `draft`: Being created
- `pending_approval`: Awaiting review
- `approved`: Approved by manager
- `rejected`: Rejected with reason

### Timestamp Tracking
All tables include:
- `created_at`: Record creation time
- `updated_at`: Last modification time (auto-updated)

## Authentication Pattern (MVP)

**Simplified Auth for Speed**:
- Plain text password comparison (no hashing)
- User ID passed via `X-User-ID` header (no tokens)
- User stored in localStorage (frontend)
- No session management

**Post-MVP**: JWT tokens, password hashing, refresh tokens.

## Error Handling Patterns

### Backend
- Pydantic validation for request bodies
- HTTPException with appropriate status codes:
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (missing/invalid user)
  - 403: Forbidden (wrong role/permissions)
  - 404: Not Found
  - 500: Internal Server Error

### Frontend
- Axios interceptors for error handling
- User-friendly error messages
- Toast notifications for errors
- Retry buttons for failed requests

## Performance Patterns

### Async/Await Everywhere
- All I/O operations are async (database, S3, OpenAI)
- FastAPI native async support
- Concurrent operations where possible

### Retry Logic
- OpenAI API calls use `tenacity` for retries
- Exponential backoff for rate limits
- 3 attempts max

### Metrics Recording
- All proof generations record timing in `performance_metrics` table
- Health checks run every 5 minutes via background worker (`scripts/health_check_worker.py`)
- Health check results stored in `system_health` table
- Metrics endpoints provide uptime, performance, queue depth, and approval rate analytics

## Security Patterns (MVP Limitations)

**Intentionally Minimal for Speed**:
- ✅ Input validation (Pydantic)
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ File upload validation
- ✅ Sandboxed iframe for email preview
- ❌ No password hashing
- ❌ No JWT tokens
- ❌ No rate limiting
- ❌ No CSRF protection

**Post-MVP**: Full security hardening required.

## Component Organization (Frontend)

```
src/
├── components/
│   ├── ui/              # shadcn components (button, card, input, form, label, dropdown-menu, checkbox) ✅
│   ├── auth/            # Login, ProtectedRoute ✅
│   ├── assets/          # AssetUpload ✅, AssetReview ✅, AssetCard ✅, CategoryZone ✅
│   ├── campaigns/       # CampaignForm, CampaignList, EmailPreview
│   ├── monitoring/      # PerformanceDashboard, MetricCard
│   └── layout/          # Layout ✅
├── pages/               # Route-level components (Login ✅, Dashboard ✅, AssetUploadPage ✅)
├── hooks/               # Custom React hooks (useAssets ✅)
├── contexts/            # React Context providers (AuthContext ✅)
├── lib/                 # Utilities (axios ✅, utils ✅)
└── types/               # TypeScript interfaces (IDE-only) ✅
```

## Testing Patterns

### Backend (Pytest)
- Fixtures in `conftest.py` (test DB, client, users)
- Test each router independently
- Mock external services (S3, OpenAI) where needed
- Test critical paths: auth, upload, generation, approval

### Frontend (Post-MVP)
- Not included in MVP scope
- Future: React Testing Library, Playwright E2E

