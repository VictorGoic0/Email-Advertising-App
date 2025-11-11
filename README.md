# Automated Email Advertising Workflow System

An AI-accelerated email advertising workflow system that automates asset collection, email proof generation, and approval processes. The system reduces campaign setup time from hours to minutes by leveraging AI (OpenAI) for intelligent asset categorization and email content generation.

## Project Structure

```
Email-Advertising-App/
├── backend/          # FastAPI Python backend
├── frontend/         # React + Vite frontend
├── scripts/          # Utility scripts (seed data, health checks)
├── data/             # Seed data files
└── memory-bank/       # Project documentation
```

## Prerequisites

- **Node.js**: Latest stable version (check compatibility)
- **Python**: 3.11 or higher
- **Git**: For version control
- **AWS Account**: For S3 bucket access
- **OpenAI API Key**: For AI-powered features

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file in the `backend/` directory:
```env
DATABASE_URL=sqlite:///./dev.db
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=email-assets-dev-goico
AWS_REGION=us-east-2
OPENAI_API_KEY=your_openai_key
```

6. Initialize Alembic for database migrations:
```bash
alembic init alembic
```

7. Configure Alembic and generate initial migration:
```bash
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

8. Seed the database with initial data:
```bash
python ../scripts/seed_database.py
```

9. Start the development server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Initialize Tailwind CSS:
```bash
npx tailwindcss init -p
```

4. Initialize shadcn/ui:
```bash
npx shadcn-ui@latest init
```

5. Add required shadcn components:
```bash
npx shadcn-ui@latest add button card input form
```

6. Create `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000/api
```

7. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in the terminal).

## Environment Variables

### Backend (`.env` in `backend/`)

- `DATABASE_URL`: SQLite database path (development) or PostgreSQL connection string (production)
- `AWS_ACCESS_KEY_ID`: AWS access key for S3
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3
- `AWS_S3_BUCKET`: S3 bucket name (e.g., `email-assets-dev-goico`)
- `AWS_REGION`: AWS region for S3 (default: `us-east-2`)
- `OPENAI_API_KEY`: OpenAI API key for AI features

### Frontend (`.env` in `frontend/`)

- `VITE_API_URL`: Backend API base URL (default: `http://localhost:8000/api`)

## Database Setup

The project uses SQLite for development and PostgreSQL for production (future).

### Development (SQLite)

The database file (`dev.db`) will be created automatically when you run migrations. It's already included in `.gitignore`.

### Running Migrations

```bash
cd backend
alembic upgrade head
```

### Creating New Migrations

```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## Seed Data

To populate the database with initial user data:

```bash
python scripts/seed_database.py
```

This will create users with different roles (advertiser, campaign_manager, tech_support) for testing.

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Authentication

### Authentication Flow

The system uses a simplified authentication mechanism for MVP speed:

1. **Login**: `POST /api/auth/login`
   - Request body: `{ "email": "user@example.com", "password": "password123" }`
   - Response: `{ "user": { "id": "...", "email": "...", "full_name": "...", "role": "..." } }`
   - Returns 401 if credentials are invalid

2. **Authenticated Requests**: Include `X-User-ID` header
   - Header: `X-User-ID: <user_id>`
   - The `get_current_user` dependency validates the user ID and returns the User object
   - Returns 401 if user ID is invalid or user not found

### Implementation Details

- **Plain text passwords**: No hashing for MVP (post-MVP: bcrypt/argon2)
- **No JWT tokens**: User ID passed directly in header (post-MVP: JWT with refresh tokens)
- **No session management**: Stateless API (post-MVP: session-based if needed)

**Note**: This is a simplified authentication system for MVP speed. Production should implement proper password hashing, JWT tokens, and session management.

## Development Workflow

1. **Backend**: Make changes to FastAPI routes, models, or services
2. **Frontend**: Make changes to React components
3. **Database**: Create Alembic migrations for schema changes
4. **Testing**: Run backend tests with `pytest` (end of MVP)

## Deployment

### Frontend Deployment (Netlify)

The frontend is configured for deployment on Netlify with automatic builds from GitHub.

#### Prerequisites

1. Test production build locally:
```bash
cd frontend
npm run build
npm run preview
```

2. Verify all features work correctly in the production build.

#### Netlify Setup

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect the configuration from `netlify.toml`

2. **Configure Environment Variables**:
   - In Netlify Dashboard: Site settings → Environment variables
   - Add the following variable:
     - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)
   - **Important**: Set this to your Railway backend URL after backend deployment

3. **Build Settings** (auto-configured via `netlify.toml`):
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Node version: 20 (LTS)

4. **Deploy**:
   - Netlify will automatically deploy from the `main` branch
   - Deploy previews are created for pull requests
   - The site will be available at `https://your-site.netlify.app`

#### Post-Deployment Checklist

- [ ] Verify deployed site loads correctly
- [ ] Test login flow with backend API
- [ ] Test asset upload (S3 integration)
- [ ] Test campaign creation and approval workflow
- [ ] Verify all routes work (no 404s on refresh)
- [ ] Test on mobile device/responsive design
- [ ] Check browser console for errors

### Backend Deployment (Railway)

The backend is configured for deployment on Railway with PostgreSQL support.

#### Prerequisites

1. Verify all backend endpoints work locally
2. Test database migrations locally:
```bash
cd backend
alembic upgrade head
```
3. Ensure Python 3.11+ compatibility
4. **Create production S3 bucket** (see S3 Setup section below)

#### Production S3 Bucket Setup

**Bucket Name**: `email-assets-prod-goico`  
**Region**: `us-east-2` (same as dev)

**Quick Setup (Automated)**:
```bash
# Run the setup script
./scripts/setup_prod_s3_bucket.sh
```

**Manual Setup**:

1. **Create the bucket**:
```bash
aws s3api create-bucket \
    --bucket email-assets-prod-goico \
    --region us-east-2 \
    --create-bucket-configuration LocationConstraint=us-east-2
```

2. **Enable versioning** (recommended for production):
```bash
aws s3api put-bucket-versioning \
    --bucket email-assets-prod-goico \
    --versioning-configuration Status=Enabled
```

3. **Block public access** (keep bucket private):
```bash
aws s3api put-public-access-block \
    --bucket email-assets-prod-goico \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

4. **Configure CORS** for Netlify domain:
```bash
aws s3api put-bucket-cors \
    --bucket email-assets-prod-goico \
    --cors-configuration file://s3-cors-prod.json
```

5. **Verify bucket access**:
```bash
aws s3 ls s3://email-assets-prod-goico
```

**IAM Policy for Railway**:
Ensure your AWS IAM user/role has permissions for the production bucket:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:ListBucket`

**Note**: The production bucket (`email-assets-prod-goico`) is separate from the development bucket (`email-assets-dev-goico`) to keep environments isolated.

#### Railway Setup

1. **Connect Repository**:
   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect the Python app from `requirements.txt`

2. **Add PostgreSQL Database**:
   - In your Railway project dashboard, look for "New" or "+" button
   - Click "New" → Select "Database" → Choose "PostgreSQL"
   - **Alternative**: In your service view, go to "Data" tab → "Add Database" → "PostgreSQL"
   - Railway will automatically:
     - Create a PostgreSQL database
     - Generate `DATABASE_URL` environment variable
     - Link it to your service
   - **Note**: If you don't see these options, PostgreSQL may be added as a separate service in your project

3. **Configure Environment Variables**:
   - In Railway Dashboard: Your service → Variables tab
   - Add the following variables:
     - `AWS_ACCESS_KEY_ID`: Your AWS access key
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
     - `AWS_S3_BUCKET`: **Production bucket**: `email-assets-prod-goico` (⚠️ not dev bucket)
     - `AWS_REGION`: AWS region (`us-east-2`)
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `FRONTEND_URL`: `https://email-advertising-generator.netlify.app` (optional, already configured)
   - **Note**: `DATABASE_URL` is auto-generated by Railway PostgreSQL plugin

4. **Set Root Directory** (REQUIRED if Railway doesn't auto-detect):
   - In Railway Dashboard: Your service → Settings → General
   - Find "Root Directory" setting
   - Set to: `backend`
   - **Important**: Railway needs to know where your `requirements.txt` and `Procfile` are located
   - Save changes (this may trigger a redeploy)

5. **Set Python Version** (if using Python 3.13+):
   - Railway may default to Python 3.13 which doesn't have psycopg2-binary wheels yet
   - **Solution**: In Railway Dashboard → Your service → Settings → Variables
   - Add variable: `PYTHON_VERSION` = `3.11.9`
   - **Alternative**: Railway should read `backend/runtime.txt` (created, specifies Python 3.11.9)
   - Commit and push `runtime.txt` to trigger redeploy with correct Python version

6. **Run Database Migrations**:
   - After first deployment, run migrations via Railway CLI:
   ```bash
   railway run alembic upgrade head
   ```
   - **Alternative**: Use Railway dashboard web terminal (available in service view)
   - Or add to startup (see migration strategy below)

6. **Seed Database** (if needed):
   ```bash
   railway run python ../scripts/seed_database.py
   ```
   - **Alternative**: Use Railway dashboard web terminal
   - **Note**: Both CLI and web terminal work - CLI recommended for one-time operations

#### Migration Strategy

Railway supports running migrations automatically on deploy. You can:

**Option 1: Manual Migration (Recommended for first deploy)**
```bash
railway run alembic upgrade head
```

**Option 2: Automatic Migration on Deploy**
Add a release command in Railway settings or use a startup script.

#### Post-Deployment Checklist

- [ ] Verify backend API is accessible at Railway URL
- [ ] Test `/health` endpoint
- [ ] Test `/docs` (Swagger UI) endpoint
- [ ] Test login endpoint with seeded users
- [ ] Test S3 upload functionality
- [ ] Test OpenAI integration (asset categorization)
- [ ] Test email generation (MJML compilation)
- [ ] Run full end-to-end test from frontend to backend
- [ ] Monitor Railway logs for errors
- [ ] Update frontend `VITE_API_URL` in Netlify with Railway URL

#### Railway Configuration Files

- `backend/Procfile`: Defines the web server command
- `backend/requirements.txt`: Python dependencies (includes PostgreSQL driver)
- Railway auto-detects Python apps and installs dependencies

#### Cost Information

- **Free Tier**: $5/month credit included
- **PostgreSQL**: Included in free tier (shared resources)
- **Service**: Uses free tier credits (shared CPU, 512MB RAM)
- **Note**: Monitor usage to avoid exceeding free tier limits

## Key Features

- **Asset Upload**: Upload logos, images, text files, and URLs to S3
- **AI Categorization**: Automatic asset categorization using rules and optional AI
- **Campaign Management**: Create and manage email advertising campaigns
- **AI Email Generation**: Generate professional email proofs in under 5 seconds using GPT-4
- **Approval Workflow**: Submit, approve, or reject campaigns with reasons
- **Performance Monitoring**: Real-time system health metrics

## User Roles

1. **Advertiser**: Create campaigns, upload assets, submit for approval
2. **Campaign Manager**: Review and approve/reject campaigns
3. **Technical Support**: Monitor system performance and health

## Technology Stack

- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy 2.0, Alembic
- **Database**: SQLite (dev), PostgreSQL (production)
- **Storage**: AWS S3
- **AI**: OpenAI API (GPT-3.5-turbo, GPT-4)
- **Email Templates**: MJML

## Documentation

- **PRD**: See `PRD.md` for complete technical requirements
- **Tasks**: See `tasks-1.md`, `tasks-2.md`, `tasks-3.md` for implementation checklist
- **Architecture**: See `architecture.mermaid` for system architecture diagram
- **Memory Bank**: See `memory-bank/` for project documentation

## Contributing

This is an MVP project. Follow the task lists in `tasks-*.md` files for implementation order.

## License

[To be determined]

