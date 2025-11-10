# Task List: Automated Email Advertising Workflow System MVP

---

## PR #1: Project Setup & Database Foundation

**Branch**: `feature/project-setup`

### Project Structure
- [x] 1.1 Create root project directory
- [x] 1.2 Create `/backend` folder
- [x] 1.3 Create `/frontend` folder
- [x] 1.4 Create `/scripts` folder
- [x] 1.5 Create `/data` folder
- [x] 1.6 Initialize git repository
- [x] 1.7 Create root `.gitignore`
- [x] 1.8 Create root `README.md` with setup instructions

### Backend Setup
- [x] 1.9 Create Python virtual environment in `/backend`
- [x] 1.10 Create `/backend/requirements.txt` with dependencies
- [x] 1.11 Create `/backend/.env` file with environment variables
- [x] 1.12 Create `/backend/main.py` with basic FastAPI app
- [x] 1.13 Add CORS middleware configuration
- [x] 1.14 Create `/backend/config.py` for environment variable loading
- [x] 1.15 Create `/health` endpoint

### Database Models
- [x] 1.16 Create `/backend/models` directory
- [x] 1.17 Create `/backend/models/user.py` with User model
- [x] 1.18 Create `/backend/models/asset.py` with Asset model
- [x] 1.19 Create `/backend/models/campaign.py` with Campaign model
- [x] 1.20 Create `/backend/models/campaign_asset.py` with CampaignAsset model
- [x] 1.21 Create `/backend/models/performance_metric.py` with PerformanceMetric model
- [x] 1.22 Create `/backend/models/system_health.py` with SystemHealth model
- [x] 1.23 Create `/backend/models/__init__.py` to export all models

### Database Configuration
- [x] 1.24 Initialize Alembic in `/backend`
- [x] 1.25 Configure SQLAlchemy database connection in `/backend/database.py`
- [x] 1.26 Set up session management and dependency injection
- [x] 1.27 Configure Alembic `env.py` with models
- [x] 1.28 Generate initial Alembic migration
- [x] 1.29 Run migration to create all tables in SQLite

### Seed Data
- [x] 1.30 Create `/data/seed_users.json` with user data
- [x] 1.31 Create `/scripts/seed_database.py` script
- [x] 1.32 Implement function to read JSON data
- [x] 1.33 Implement function to insert users into database
- [x] 1.34 Add CLI argument parsing for seed script
- [ ] 1.35 Run seed script to populate database with users

### Documentation & Commit
- [ ] 1.36 Document environment variables in README
- [ ] 1.37 Document database setup steps in README
- [ ] 1.38 Make initial commit
- [ ] 1.39 Push to remote repository

---

## PR #2: Authentication System (Backend)

**Branch**: `feature/auth-backend`

### Backend - Auth Router
- [x] 2.1 Create `/backend/routers` directory
- [x] 2.2 Create `/backend/routers/auth.py`
- [x] 2.3 Implement `POST /api/auth/login` endpoint
- [x] 2.4 Add Pydantic schema for login request (email, password)
- [x] 2.5 Add Pydantic schema for login response (user object)
- [x] 2.6 Query user by email from database
- [x] 2.7 Compare plain text password
- [x] 2.8 Return user object (id, email, full_name, role) on success
- [x] 2.9 Return 401 error with message for invalid credentials
- [x] 2.10 Register auth router in `main.py`

### Backend - Auth Dependencies
- [x] 2.11 Create `/backend/dependencies.py`
- [x] 2.12 Implement `get_current_user` dependency function
- [x] 2.13 Extract X-User-ID from request headers
- [x] 2.14 Query user by ID from database
- [x] 2.15 Return 401 error if user not found
- [x] 2.16 Return User object if found

### Backend - Schemas
- [x] 2.17 Create `/backend/schemas` directory
- [x] 2.18 Create `/backend/schemas/user.py`
- [x] 2.19 Define UserResponse Pydantic model
- [x] 2.20 Define LoginRequest Pydantic model
- [x] 2.21 Define LoginResponse Pydantic model
- [x] 2.22 Create `/backend/schemas/__init__.py`

### Testing & Documentation
- [x] 2.23 Test login endpoint with valid credentials via Swagger UI
- [x] 2.24 Test login endpoint with invalid credentials via Swagger UI
- [x] 2.25 Test get_current_user dependency with valid user ID
- [x] 2.26 Test get_current_user dependency with invalid user ID
- [x] 2.27 Document authentication flow in README

---

## PR #3: Asset Upload & S3 Integration (Backend)

**Branch**: `feature/asset-upload-backend`

### Backend - S3 Service
- [ ] 3.1 Create `/backend/services` directory
- [ ] 3.2 Create `/backend/services/s3_service.py`
- [ ] 3.3 Initialize S3 client with boto3
- [ ] 3.4 Implement `upload_file` method
- [ ] 3.5 Generate unique S3 key (users/{user_id}/{filename})
- [ ] 3.6 Upload file to S3 bucket
- [ ] 3.7 Generate pre-signed URL (7 day expiration)
- [ ] 3.8 Return s3_key and s3_url
- [ ] 3.9 Implement `_get_content_type` helper method
- [ ] 3.10 Add error handling for S3 upload failures

### Backend - Asset Categorization
- [ ] 3.11 Create `/backend/services/categorization_service.py`
- [ ] 3.12 Implement `categorize_asset` function with rules engine
- [ ] 3.13 Add rule for logo detection (filename contains "logo")
- [ ] 3.14 Add rule for text file extensions (.txt, .doc, .docx)
- [ ] 3.15 Add rule for image file extensions (.jpg, .jpeg, .png, .gif, .webp)
- [ ] 3.16 Return category and categorization_method tuple
- [ ] 3.17 Add fallback to "pending" category

### Backend - Asset Schemas
- [ ] 3.18 Create `/backend/schemas/asset.py`
- [ ] 3.19 Define AssetCreate Pydantic model
- [ ] 3.20 Define AssetResponse Pydantic model
- [ ] 3.21 Define AssetUpdate Pydantic model
- [ ] 3.22 Add validators for file types and sizes

### Backend - Asset Router
- [ ] 3.23 Create `/backend/routers/asset.py`
- [ ] 3.24 Implement `POST /api/assets/upload` endpoint
- [ ] 3.25 Accept multipart file upload
- [ ] 3.26 Extract user from get_current_user dependency
- [ ] 3.27 Read file content
- [ ] 3.28 Call S3 service to upload file
- [ ] 3.29 Call categorization service to categorize asset
- [ ] 3.30 Create asset record in database with metadata
- [ ] 3.31 Return AssetResponse with 201 status
- [ ] 3.32 Add error handling for upload failures

### Backend - Asset CRUD Operations
- [ ] 3.33 Implement `GET /api/assets` endpoint (get all user's assets)
- [ ] 3.34 Filter assets by user_id from current user
- [ ] 3.35 Implement `GET /api/assets/{asset_id}` endpoint
- [ ] 3.36 Verify asset belongs to current user
- [ ] 3.37 Return 404 if asset not found
- [ ] 3.38 Return 403 if asset belongs to different user
- [ ] 3.39 Implement `DELETE /api/assets/{asset_id}` endpoint
- [ ] 3.40 Delete file from S3
- [ ] 3.41 Delete asset record from database
- [ ] 3.42 Register asset router in `main.py`

### Testing
- [ ] 3.43 Test file upload with logo image via Swagger UI
- [ ] 3.44 Test file upload with general image via Swagger UI
- [ ] 3.45 Test file upload with text file via Swagger UI
- [ ] 3.46 Verify S3 bucket contains uploaded files
- [ ] 3.47 Test getting all assets for a user
- [ ] 3.48 Test deleting an asset

---

## PR #4: AI Asset Recategorization (Backend)

**Branch**: `feature/ai-recategorization-backend`

### Backend - OpenAI Service
- [ ] 4.1 Create `/backend/services/openai_service.py`
- [ ] 4.2 Initialize OpenAI client with API key
- [ ] 4.3 Implement `categorize_assets` method
- [ ] 4.4 Build prompt for GPT-3.5-turbo categorization
- [ ] 4.5 Format asset metadata as JSON in prompt
- [ ] 4.6 Call OpenAI API with retry logic (tenacity)
- [ ] 4.7 Parse JSON response from OpenAI
- [ ] 4.8 Return mapping of asset_id to category
- [ ] 4.9 Add error handling for API failures
- [ ] 4.10 Add error handling for rate limits

### Backend - Asset Recategorization Endpoint
- [ ] 4.11 Add `POST /api/assets/recategorize` endpoint to asset router
- [ ] 4.12 Accept list of asset IDs in request body
- [ ] 4.13 Verify all assets belong to current user
- [ ] 4.14 Fetch asset metadata from database
- [ ] 4.15 Call OpenAI service to recategorize
- [ ] 4.16 Update asset categories in database
- [ ] 4.17 Update categorization_method to "ai"
- [ ] 4.18 Return updated assets
- [ ] 4.19 Add error handling for OpenAI failures

### Backend - Manual Category Update
- [ ] 4.20 Add `PATCH /api/assets/{asset_id}/category` endpoint
- [ ] 4.21 Accept new category in request body
- [ ] 4.22 Verify asset belongs to current user
- [ ] 4.23 Validate category is valid (logo, image, copy, url)
- [ ] 4.24 Update asset category in database
- [ ] 4.25 Update categorization_method to "manual"
- [ ] 4.26 Return updated asset

### Testing
- [ ] 4.27 Test AI recategorization with multiple assets
- [ ] 4.28 Verify OpenAI API is called correctly
- [ ] 4.29 Test manual category update
- [ ] 4.30 Test error handling for invalid categories

---

## PR #5: Campaign Creation & Management (Backend)

**Branch**: `feature/campaigns-backend`

### Backend - Campaign Schemas
- [ ] 5.1 Create `/backend/schemas/campaign.py`
- [ ] 5.2 Define CampaignCreate Pydantic model
- [ ] 5.3 Define CampaignResponse Pydantic model
- [ ] 5.4 Define CampaignUpdate Pydantic model
- [ ] 5.5 Define CampaignWithAssets response model
- [ ] 5.6 Add status enum validation

### Backend - Campaign Router
- [ ] 5.7 Create `/backend/routers/campaign.py`
- [ ] 5.8 Implement `POST /api/campaigns` endpoint
- [ ] 5.9 Accept campaign details and asset IDs in request body
- [ ] 5.10 Create campaign record with status "draft"
- [ ] 5.11 Link assets to campaign via campaign_assets table
- [ ] 5.12 Return created campaign with 201 status
- [ ] 5.13 Add validation for required fields

### Backend - Campaign CRUD Operations
- [ ] 5.14 Implement `GET /api/campaigns` endpoint
- [ ] 5.15 Filter campaigns by user role (advertisers see own, managers see pending)
- [ ] 5.16 Implement `GET /api/campaigns/{campaign_id}` endpoint
- [ ] 5.17 Return campaign with linked assets
- [ ] 5.18 Verify user has permission to view campaign
- [ ] 5.19 Implement `PATCH /api/campaigns/{campaign_id}` endpoint
- [ ] 5.20 Allow updating campaign details (name, audience, goal, notes)
- [ ] 5.21 Verify campaign belongs to current user
- [ ] 5.22 Implement `DELETE /api/campaigns/{campaign_id}` endpoint
- [ ] 5.23 Delete campaign and cascade to campaign_assets
- [ ] 5.24 Register campaign router in `main.py`

### Backend - Database Queries
- [ ] 5.25 Create `/backend/crud` directory
- [ ] 5.26 Create `/backend/crud/campaign.py`
- [ ] 5.27 Implement `get_campaigns_by_user` function
- [ ] 5.28 Implement `get_campaigns_by_status` function
- [ ] 5.29 Implement `get_campaign_with_assets` function
- [ ] 5.30 Implement `link_assets_to_campaign` function

### Testing
- [ ] 5.31 Test creating campaign with assets
- [ ] 5.32 Test getting all campaigns for advertiser
- [ ] 5.33 Test getting single campaign with assets
- [ ] 5.34 Test updating campaign details
- [ ] 5.35 Test deleting campaign

---

## PR #6: Email Proof Generation with AI (Backend)

**Branch**: `feature/email-generation-backend`

### Backend - MJML Service
- [ ] 6.1 Install mjml Python package
- [ ] 6.2 Create `/backend/services/mjml_service.py`
- [ ] 6.3 Implement `compile_mjml_to_html` function
- [ ] 6.4 Call mjml compiler with MJML string
- [ ] 6.5 Return compiled HTML
- [ ] 6.6 Add error handling for invalid MJML

### Backend - OpenAI Email Generation
- [ ] 6.7 Add `generate_email_mjml` method to OpenAI service
- [ ] 6.8 Build prompt for GPT-4 email generation
- [ ] 6.9 Include campaign details in prompt
- [ ] 6.10 Include asset metadata in prompt
- [ ] 6.11 Specify MJML requirements in prompt
- [ ] 6.12 Call GPT-4 API with temperature 0.7
- [ ] 6.13 Parse MJML code from response
- [ ] 6.14 Clean markdown code blocks from response
- [ ] 6.15 Add retry logic with exponential backoff

### Backend - Proof Generation Endpoint
- [ ] 6.16 Add `POST /api/campaigns/{campaign_id}/generate-proof` to campaign router
- [ ] 6.17 Fetch campaign and linked assets from database
- [ ] 6.18 Verify campaign belongs to current user
- [ ] 6.19 Start performance timer
- [ ] 6.20 Call OpenAI service to generate MJML
- [ ] 6.21 Call MJML service to compile to HTML
- [ ] 6.22 Update campaign with generated_email_mjml and generated_email_html
- [ ] 6.23 Calculate generation time
- [ ] 6.24 Record performance metric in database
- [ ] 6.25 Return MJML, HTML, and generation_time
- [ ] 6.26 Add error handling for generation failures

### Backend - Performance Metrics
- [ ] 6.27 Create `/backend/crud/metrics.py`
- [ ] 6.28 Implement `record_metric` function
- [ ] 6.29 Insert metric record into performance_metrics table
- [ ] 6.30 Add metadata field for additional context

### Testing
- [ ] 6.31 Test email proof generation with complete campaign
- [ ] 6.32 Verify MJML is generated correctly
- [ ] 6.33 Verify HTML is compiled correctly
- [ ] 6.34 Verify generation time is recorded
- [ ] 6.35 Test error handling for OpenAI failures