from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import system, services, docker, network

app = FastAPI(
    title="SparkHome API",
    description="Dashboard API for NVIDIA DGX Spark",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://spark.local:8888", "http://localhost:8888"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(system.router)
app.include_router(services.router)
app.include_router(docker.router)
app.include_router(network.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "SparkHome"}
