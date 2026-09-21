from fastapi import FastAPI
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application Starting...")
    yield
    print("Application Shutdown...")


app = FastAPI(
    title="AI Platform",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/")
async def home():
    return {
        "message": "Welcome to AI Platform",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }