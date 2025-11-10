"""Main FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import auth, asset

app = FastAPI(
    title="Email Advertising Workflow System API",
    description="AI-accelerated email advertising workflow system",
    version="1.0.0",
)

# CORS configuration - allow Vite dev servers
allowed_origins = [
    f"http://localhost:{port}" for port in [5173, 5174, 5175, 5176, 5177]
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(asset.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "email-advertising-api",
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Email Advertising Workflow System API",
        "docs": "/docs",
    }

