# Active Context

## Current Status

**Phase**: Project Initialization  
**Date**: Project start  
**Focus**: Memory bank creation and project setup

## Recent Changes

- ✅ Memory bank structure created
- ✅ Core documentation files initialized
- 📋 Project structure planning in progress

## Next Steps

### Immediate (Project Setup)
1. Create project directory structure (`/backend`, `/frontend`, `/scripts`, `/data`)
2. Initialize backend (FastAPI, virtual environment, dependencies)
3. Initialize frontend (Vite + React, dependencies)
4. Set up database models and migrations
5. Create seed data script
6. Configure environment variables

### Short-term (PR #1-3)
1. **PR #1**: Project setup & database foundation
   - Backend structure, models, migrations, seed data
2. **PR #2**: Authentication system (backend)
   - Login endpoint, user dependency, schemas
3. **PR #3**: Asset upload & S3 integration (backend)
   - S3 service, categorization service, asset router

### Medium-term (PR #4-9)
4. **PR #4**: AI asset recategorization (backend)
5. **PR #5**: Campaign creation & management (backend)
6. **PR #6**: Email proof generation with AI (backend)
7. **PR #7**: Approval workflow (backend)
8. **PR #8**: Performance monitoring dashboard (backend)
9. **PR #9**: Backend testing

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

**Primary Goal**: Establish project foundation
- Memory bank documentation ✅
- Project structure setup (next)
- Backend initialization (next)
- Frontend initialization (next)

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

