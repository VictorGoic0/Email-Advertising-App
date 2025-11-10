# Technical Context

## Technology Stack

### Frontend
- **Framework**: Vite + React 18+ with TypeScript
- **UI Library**: shadcn/ui (copy-paste components)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router v6

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **API Docs**: Auto-generated OpenAPI/Swagger
- **Async**: asyncio for concurrent operations
- **Validation**: Pydantic models
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic

### Database
- **Development**: SQLite (local file: `dev.db`)
- **Production**: PostgreSQL via AWS RDS (future)
- **Connection**: SQLAlchemy async engine

### External Services
- **File Storage**: AWS S3
  - Dev bucket: `email-assets-dev`
  - Prod bucket: `email-assets-prod` (future)
- **AI Services**: OpenAI API
  - GPT-3.5-turbo: Asset categorization
  - GPT-4: Email content generation
- **Email Templates**: MJML (responsive email framework)
  - Python package: `mjml` (wrapper for Node.js compiler)

### Development Tools
- **Version Control**: Git
- **Package Managers**: npm (frontend), pip (backend)
- **Code Quality**:
  - Frontend: ESLint, Prettier
  - Backend: Black, Ruff
- **Testing**: Pytest (backend only, end of MVP)

### Deployment (Post-MVP)
- **Frontend**: Netlify
- **Backend**: Railway
- **Note**: AWS Lambda out of scope (configuration complexity)

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=sqlite:///./dev.db
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=email-assets-dev
OPENAI_API_KEY=your_openai_key
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000/api
```

## Package Dependencies

### Backend Dependencies
- `fastapi`
- `uvicorn`
- `sqlalchemy`: 2.0+
- `alembic`
- `boto3` (AWS SDK)
- `openai`
- `mjml`
- `python-multipart` (file uploads)
- `pydantic`
- `tenacity` (retry logic)

### Frontend Dependencies
- `react`: 18+
- `react-dom`: 18+
- `react-router-dom`: v6
- `axios`
- `react-hook-form`
- `zod`
- `tailwindcss`
- `@radix-ui/*` (shadcn dependencies)

## Development Setup

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
python ../scripts/seed_database.py
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npx tailwindcss init -p
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input form
npm run dev
```

## Database Schema

### Core Tables
1. **users**: User accounts with roles (advertiser, campaign_manager, tech_support)
2. **assets**: Uploaded files metadata (linked to S3)
3. **campaigns**: Campaign details and generated email content
4. **campaign_assets**: Junction table (many-to-many)
5. **performance_metrics**: System performance data
6. **system_health**: Component health check records

### Key Relationships
- `users` → `assets` (1:N)
- `users` → `campaigns` (1:N, as advertiser)
- `campaigns` → `assets` (N:M via `campaign_assets`)
- `users` → `campaigns` (1:N, as reviewer)

## API Architecture

### Base URL
- Development: `http://localhost:8000/api`
- Production: TBD (post-MVP)

### Authentication
- All requests (except `/auth/login`) require `X-User-ID` header
- Header contains UUID of logged-in user
- Backend validates user exists in database

### Core Endpoints

**Authentication**:
- `POST /api/auth/login` - User login

**Assets**:
- `POST /api/assets/upload` - Upload file
- `GET /api/assets` - Get user's assets
- `GET /api/assets/{id}` - Get asset details
- `PATCH /api/assets/{id}/category` - Update category
- `POST /api/assets/recategorize` - AI recategorization
- `DELETE /api/assets/{id}` - Delete asset

**Campaigns**:
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - Get user's campaigns
- `GET /api/campaigns/{id}` - Get campaign details
- `PATCH /api/campaigns/{id}` - Update campaign
- `POST /api/campaigns/{id}/generate-proof` - Generate email
- `POST /api/campaigns/{id}/submit` - Submit for approval
- `POST /api/campaigns/{id}/approve` - Approve (manager only)
- `POST /api/campaigns/{id}/reject` - Reject (manager only)
- `DELETE /api/campaigns/{id}` - Delete campaign

**Approval Queue**:
- `GET /api/campaigns/approval-queue` - Get pending campaigns (manager only)

**Metrics**:
- `GET /api/metrics/uptime` - API uptime (tech_support only)
- `GET /api/metrics/proof-generation` - Generation latency (tech_support only)
- `GET /api/metrics/queue-depth` - Queue depth (tech_support only)
- `GET /api/metrics/approval-rate` - Approval rate (tech_support only)

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Email proof generation | <5 seconds | API call to HTML response |
| Asset upload | <3 seconds | File selection to S3 complete |
| API response time (p95) | <500ms | All non-generation endpoints |
| Concurrent users | 100+ | Without degradation |
| Database query time | <100ms | p95 for all SELECT queries |
| Frontend initial load | <2 seconds | Time to interactive |

## AWS S3 Configuration

### Bucket Structure
```
email-assets-dev/
├── users/
│   ├── {user_id}/
│   │   ├── logos/
│   │   ├── images/
│   │   ├── copy/
│   │   └── urls/
```

### Permissions
- IAM policy allows: PutObject, GetObject, DeleteObject, ListBucket
- Pre-signed URLs: 7-day expiration for file access

## OpenAI Integration

### Models
- **GPT-3.5-turbo**: Asset categorization (cheaper, faster)
- **GPT-4**: Email generation (higher quality, slower)

### Configuration
- Max tokens: 2000 (email generation)
- Temperature: 0.7 (balanced creativity)
- Retry logic: 3 attempts with exponential backoff

### Cost Estimates
- Asset categorization: ~$0.005 per campaign (if AI used)
- Email generation: ~$0.05-0.10 per campaign
- Total: ~$0.055-0.105 per campaign

## MJML Integration

- Python package: `mjml` (requires Node.js)
- Compiles MJML → email-safe HTML
- Handles email client quirks automatically
- Responsive by default

## Deployment (Post-MVP)

### Platforms
- **Frontend**: Netlify
- **Backend**: Railway
- **Note**: AWS Lambda out of scope (configuration complexity)

### Database Migration
- Development: SQLite (file-based, easy reset)
- Production: PostgreSQL (requires migration script)
- Alembic handles schema migrations

### Environment Variables
- Must be set in deployment platform dashboards
- Never commit `.env` files to git
- Use platform-specific secret management

