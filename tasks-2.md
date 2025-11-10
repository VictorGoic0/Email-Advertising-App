## PR #7: Approval Workflow (Backend)

**Branch**: `feature/approval-workflow-backend`

### Backend - Campaign Submission
- [x] 7.1 Add `POST /api/campaigns/{campaign_id}/submit` endpoint
- [x] 7.2 Verify user is advertiser
- [x] 7.3 Verify campaign belongs to current user
- [x] 7.4 Verify campaign has generated email
- [x] 7.5 Update campaign status to "pending_approval"
- [x] 7.6 Update campaign updated_at timestamp
- [x] 7.7 Return success message

### Backend - Approval Queue
- [x] 7.8 Add `GET /api/campaigns/approval-queue` endpoint
- [x] 7.9 Verify user is campaign_manager
- [x] 7.10 Query campaigns with status "pending_approval"
- [x] 7.11 Sort by created_at (oldest first)
- [x] 7.12 Return list of campaigns

### Backend - Campaign Approval
- [x] 7.13 Add `POST /api/campaigns/{campaign_id}/approve` endpoint
- [x] 7.14 Verify user is campaign_manager
- [x] 7.15 Fetch campaign from database
- [x] 7.16 Update status to "approved"
- [x] 7.17 Set reviewed_by to current user ID
- [x] 7.18 Set reviewed_at to current timestamp
- [x] 7.19 Record approval metric
- [x] 7.20 Return success message

### Backend - Campaign Rejection
- [x] 7.21 Add `POST /api/campaigns/{campaign_id}/reject` endpoint
- [x] 7.22 Verify user is campaign_manager
- [x] 7.23 Accept rejection_reason in request body
- [x] 7.24 Validate rejection_reason is not empty
- [x] 7.25 Fetch campaign from database
- [x] 7.26 Update status to "rejected"
- [x] 7.27 Set reviewed_by to current user ID
- [x] 7.28 Set reviewed_at to current timestamp
- [x] 7.29 Set rejection_reason
- [x] 7.30 Record rejection metric
- [x] 7.31 Return success message

### Backend - Metrics Tracking
- [x] 7.32 Implement queue depth metric calculation
- [x] 7.33 Implement approval rate calculation
- [x] 7.34 Add time-to-approval tracking

### Testing
- [ ] 7.35 Test campaign submission by advertiser
- [ ] 7.36 Test approval queue retrieval by campaign manager
- [ ] 7.37 Test campaign approval flow
- [ ] 7.38 Test campaign rejection flow with reason
- [ ] 7.39 Test permission checks for each role

---

## PR #8: Performance Monitoring Dashboard (Backend)

**Branch**: `feature/monitoring-backend`

### Backend - Health Check Service
- [x] 8.1 Create `/backend/services/health_service.py`
- [x] 8.2 Implement `check_s3_health` function
- [x] 8.3 Implement `check_database_health` function
- [x] 8.4 Implement `check_openai_health` function
- [x] 8.5 Implement `perform_all_health_checks` function
- [x] 8.6 Record results in system_health table

### Backend - Metrics Router
- [x] 8.7 Create `/backend/routers/metrics.py`
- [x] 8.8 Implement `GET /api/metrics/uptime` endpoint
- [x] 8.9 Verify user is tech_support role
- [x] 8.10 Query system_health table for last 24 hours
- [x] 8.11 Calculate uptime percentage
- [x] 8.12 Return uptime metrics

### Backend - Proof Generation Metrics
- [x] 8.13 Implement `GET /api/metrics/proof-generation` endpoint
- [x] 8.14 Verify user is tech_support role
- [x] 8.15 Query performance_metrics table for proof generation times
- [x] 8.16 Calculate average, P50, P95, P99 percentiles
- [x] 8.17 Return metrics

### Backend - Queue Depth Metrics
- [x] 8.18 Implement `GET /api/metrics/queue-depth` endpoint
- [x] 8.19 Verify user is tech_support role
- [x] 8.20 Count campaigns with status "pending_approval"
- [x] 8.21 Return queue depth

### Backend - Approval Rate Metrics
- [x] 8.22 Implement `GET /api/metrics/approval-rate` endpoint
- [x] 8.23 Verify user is tech_support role
- [x] 8.24 Accept days parameter (default 7)
- [x] 8.25 Query approved and rejected campaigns
- [x] 8.26 Calculate approval rate percentage
- [x] 8.27 Return approval metrics with breakdown
- [x] 8.28 Register metrics router in `main.py`

### Backend - Background Job Setup
- [x] 8.29 Create `/scripts/health_check_worker.py`
- [x] 8.30 Implement scheduled health checks (every 5 minutes)
- [x] 8.31 Call health service from worker
- [x] 8.32 Add error handling and logging

### Testing
- [ ] 8.33 Test uptime metrics endpoint
- [ ] 8.34 Test proof generation metrics endpoint
- [ ] 8.35 Test queue depth metrics endpoint
- [ ] 8.36 Test approval rate metrics endpoint
- [ ] 8.37 Verify tech_support role requirement

---

## PR #9: Backend Testing

**Branch**: `feature/backend-tests`

### Test Setup
- [ ] 9.1 Create `/backend/tests` directory
- [ ] 9.2 Create `/backend/tests/conftest.py` with fixtures
- [ ] 9.3 Set up test database fixture
- [ ] 9.4 Set up test client fixture
- [ ] 9.5 Set up test user fixtures (advertiser, manager, support)
- [ ] 9.6 Install pytest and pytest-asyncio

### Auth Tests
- [ ] 9.7 Create `/backend/tests/test_auth.py`
- [ ] 9.8 Test login with valid credentials
- [ ] 9.9 Test login with invalid credentials
- [ ] 9.10 Test get_current_user with valid user ID
- [ ] 9.11 Test get_current_user with invalid user ID

### Asset Tests
- [ ] 9.12 Create `/backend/tests/test_assets.py`
- [ ] 9.13 Test asset upload with logo file
- [ ] 9.14 Test asset upload with image file
- [ ] 9.15 Test asset upload with text file
- [ ] 9.16 Test rules-based categorization
- [ ] 9.17 Test AI recategorization
- [ ] 9.18 Test manual category update
- [ ] 9.19 Test get all assets for user
- [ ] 9.20 Test delete asset

### Campaign Tests
- [ ] 9.21 Create `/backend/tests/test_campaigns.py`
- [ ] 9.22 Test create campaign with assets
- [ ] 9.23 Test get campaigns for advertiser
- [ ] 9.24 Test get single campaign with assets
- [ ] 9.25 Test update campaign details
- [ ] 9.26 Test delete campaign
- [ ] 9.27 Test email proof generation
- [ ] 9.28 Test campaign submission
- [ ] 9.29 Test permission checks for campaigns

### Approval Workflow Tests
- [ ] 9.30 Create `/backend/tests/test_approval.py`
- [ ] 9.31 Test get approval queue as campaign manager
- [ ] 9.32 Test approve campaign
- [ ] 9.33 Test reject campaign with reason
- [ ] 9.34 Test role-based access control for approval
- [ ] 9.35 Test advertiser cannot approve campaigns

### Metrics Tests
- [ ] 9.36 Create `/backend/tests/test_metrics.py`
- [ ] 9.37 Test uptime metrics endpoint
- [ ] 9.38 Test proof generation metrics
- [ ] 9.39 Test queue depth metrics
- [ ] 9.40 Test approval rate metrics
- [ ] 9.41 Test tech_support role requirement

### Run Tests
- [ ] 9.42 Run all tests with pytest
- [ ] 9.43 Fix any failing tests
- [ ] 9.44 Ensure test coverage for critical paths
- [ ] 9.45 Document test running instructions in README

---

## PR #10: Frontend Setup & Authentication

**Branch**: `feature/frontend-setup`

### Frontend Project Setup
- [ ] 10.1 Create Vite + React + TypeScript project in `/frontend`
- [ ] 10.2 Install dependencies (react-router-dom, axios)
- [ ] 10.3 Install and configure Tailwind CSS
- [ ] 10.4 Initialize shadcn/ui
- [ ] 10.5 Install shadcn components (button, card, input, form, label)
- [ ] 10.6 Create `/frontend/.env` with VITE_API_URL
- [ ] 10.7 Create `/frontend/.gitignore`

### Frontend Folder Structure
- [ ] 10.8 Create `/frontend/src/components` directory
- [ ] 10.9 Create `/frontend/src/pages` directory
- [ ] 10.10 Create `/frontend/src/lib` directory
- [ ] 10.11 Create `/frontend/src/hooks` directory
- [ ] 10.12 Create `/frontend/src/contexts` directory
- [ ] 10.13 Create `/frontend/src/types` directory

### TypeScript Types
- [ ] 10.14 Create `/frontend/src/types/index.ts`
- [ ] 10.15 Define User interface
- [ ] 10.16 Define Asset interface
- [ ] 10.17 Define Campaign interface
- [ ] 10.18 Define LoginRequest interface
- [ ] 10.19 Define LoginResponse interface

### Axios Setup
- [ ] 10.20 Create `/frontend/src/lib/axios.ts`
- [ ] 10.21 Create Axios instance with baseURL
- [ ] 10.22 Add request interceptor for X-User-ID header
- [ ] 10.23 Read user from localStorage in interceptor
- [ ] 10.24 Add response interceptor for error handling

### Auth Context
- [ ] 10.25 Create `/frontend/src/contexts/AuthContext.tsx`
- [ ] 10.26 Define AuthContext interface
- [ ] 10.27 Create AuthProvider component
- [ ] 10.28 Implement user state with useState
- [ ] 10.29 Implement login function (call API, store user)
- [ ] 10.30 Implement logout function (clear localStorage)
- [ ] 10.31 Restore user from localStorage on mount
- [ ] 10.32 Export useAuth hook

### Login Page
- [ ] 10.33 Create `/frontend/src/pages/Login.tsx`
- [ ] 10.34 Build login form with shadcn components
- [ ] 10.35 Add email and password input fields
- [ ] 10.36 Add form validation with zod
- [ ] 10.37 Handle form submission
- [ ] 10.38 Call login function from AuthContext
- [ ] 10.39 Show loading state during login
- [ ] 10.40 Show error message for failed login
- [ ] 10.41 Redirect to dashboard on success
- [ ] 10.42 Style login page with Tailwind

### Protected Routes
- [ ] 10.43 Create `/frontend/src/components/ProtectedRoute.tsx`
- [ ] 10.44 Check if user is authenticated
- [ ] 10.45 Redirect to /login if not authenticated
- [ ] 10.46 Render children if authenticated

### App Routing
- [ ] 10.47 Update `/frontend/src/App.tsx`
- [ ] 10.48 Wrap app with AuthProvider
- [ ] 10.49 Set up React Router with BrowserRouter
- [ ] 10.50 Add route for /login
- [ ] 10.51 Add protected route wrapper
- [ ] 10.52 Add placeholder route for dashboard

### Layout Components
- [ ] 10.53 Create `/frontend/src/components/Layout.tsx`
- [ ] 10.54 Add header with user info and logout button
- [ ] 10.55 Add sidebar navigation
- [ ] 10.56 Style layout with Tailwind

### Testing
- [ ] 10.57 Test login flow with seed user credentials
- [ ] 10.58 Verify localStorage stores user correctly
- [ ] 10.59 Verify X-User-ID header is sent with requests
- [ ] 10.60 Test logout clears user data
- [ ] 10.61 Test protected route redirects when not authenticated

---

## PR #11: Asset Upload UI

**Branch**: `feature/asset-upload-ui`

### Asset Upload Components
- [ ] 11.1 Create `/frontend/src/components/AssetUpload.tsx`
- [ ] 11.2 Implement drag-and-drop zone with file input
- [ ] 11.3 Style drop zone with hover states
- [ ] 11.4 Handle file selection from input
- [ ] 11.5 Handle file drop event
- [ ] 11.6 Show file preview for selected files
- [ ] 11.7 Implement upload to backend API
- [ ] 11.8 Show upload progress indicator
- [ ] 11.9 Handle upload errors
- [ ] 11.10 Display success message on upload

### Asset Card Component
- [ ] 11.11 Create `/frontend/src/components/AssetCard.tsx`
- [ ] 11.12 Display asset filename
- [ ] 11.13 Display asset category tag
- [ ] 11.14 Show image preview for image assets
- [ ] 11.15 Show text preview for text assets
- [ ] 11.16 Style card with Tailwind
- [ ] 11.17 Add delete button to card
- [ ] 11.18 Implement delete functionality

### Asset Review Component
- [ ] 11.19 Create `/frontend/src/components/AssetReview.tsx`
- [ ] 11.20 Fetch uploaded assets from API
- [ ] 11.21 Display assets in grid layout
- [ ] 11.22 Group assets by category
- [ ] 11.23 Add "Looks Good" button
- [ ] 11.24 Add "Recategorize with AI" button
- [ ] 11.25 Implement AI recategorization API call
- [ ] 11.26 Show loading state during AI recategorization
- [ ] 11.27 Update asset categories on success

### Category Zone Component
- [ ] 11.28 Create `/frontend/src/components/CategoryZone.tsx`
- [ ] 11.29 Create drop zones for each category (logos, images, copy, urls)
- [ ] 11.30 Implement drag-and-drop functionality
- [ ] 11.31 Update asset category on drop
- [ ] 11.32 Call manual category update API
- [ ] 11.33 Show visual feedback during drag
- [ ] 11.34 Style category zones with Tailwind

### Asset Hooks
- [ ] 11.35 Create `/frontend/src/hooks/useAssets.ts`
- [ ] 11.36 Implement fetchAssets function
- [ ] 11.37 Implement uploadAsset function
- [ ] 11.38 Implement deleteAsset function
- [ ] 11.39 Implement recategorizeAssets function
- [ ] 11.40 Implement updateAssetCategory function
- [ ] 11.41 Add loading and error states

### Asset Upload Page
- [ ] 11.42 Create `/frontend/src/pages/AssetUploadPage.tsx`
- [ ] 11.43 Integrate AssetUpload component
- [ ] 11.44 Integrate AssetReview component
- [ ] 11.45 Integrate CategoryZone component (conditionally)
- [ ] 11.46 Implement navigation between upload steps
- [ ] 11.47 Add breadcrumb or progress indicator

### Testing
- [ ] 11.48 Test file upload with different file types
- [ ] 11.49 Test drag-and-drop functionality
- [ ] 11.50 Test AI recategorization
- [ ] 11.51 Test manual category update
- [ ] 11.52 Test asset deletion