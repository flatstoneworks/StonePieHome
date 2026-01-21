import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import system, services, docker, network, settings, actions, wifi

# Directory paths
BACKEND_DIR = Path(__file__).parent.parent
STATIC_DIR = BACKEND_DIR / "static"
DATA_DIR = BACKEND_DIR.parent / "data"

# Ensure directories exist
STATIC_DIR.mkdir(parents=True, exist_ok=True)
(STATIC_DIR / "wallpapers").mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
(DATA_DIR / "wallpapers").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="StonePieHome API",
    description="Personal AI Dashboard by FlatStoneWorks",
    version="1.0.0"
)

# CORS middleware for frontend
# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://spark.local:8020,http://localhost:8020"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for wallpapers
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")

# Include routers
app.include_router(system.router)
app.include_router(services.router)
app.include_router(docker.router)
app.include_router(network.router)
app.include_router(settings.router)
app.include_router(actions.router)
app.include_router(wifi.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "StonePieHome"}
