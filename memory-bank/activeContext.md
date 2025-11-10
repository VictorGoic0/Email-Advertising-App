# Active Context

## Current Status

**Phase**: Backend Development  
**Date**: PR #2 Complete  
**Focus**: Asset upload & S3 integration (PR #3)

## Recent Changes

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

### Immediate (PR #3)
1. **PR #3**: Asset upload & S3 integration (backend)
   - Create S3 service for file uploads
   - Create categorization service (rules-based)
   - Create asset router with CRUD endpoints
   - Implement file upload endpoint
   - Test S3 integration

### Short-term (PR #4-6)
2. **PR #4**: AI asset recategorization (backend)
   - OpenAI service integration, AI recategorization endpoint
3. **PR #5**: Campaign creation & management (backend)
4. **PR #6**: Email proof generation with AI (backend)

### Medium-term (PR #7-9)
5. **PR #7**: Approval workflow (backend)
6. **PR #8**: Performance monitoring dashboard (backend)
7. **PR #9**: Backend testing

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

**Primary Goal**: Implement asset upload system
- PR #1 foundation complete ✅
- Authentication backend (PR #2) - complete ✅
- Asset upload system (PR #3) - next

## Blockers & Risks

### Known Blockers
- None currently

### Potential Risks
1. **OpenAI API rate limits**: May need to implement queuing if high volume
2. **S3 configuration**: Need AWS credentials and bucket setup
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

