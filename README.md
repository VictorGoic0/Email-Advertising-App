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
AWS_S3_BUCKET=email-assets-dev
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
- `AWS_S3_BUCKET`: S3 bucket name (e.g., `email-assets-dev`)
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

