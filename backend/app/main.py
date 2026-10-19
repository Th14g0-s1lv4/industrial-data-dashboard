from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import sensores, leituras

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Industrial Data Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensores.router)
app.include_router(leituras.router)


@app.get("/")
def root():
    return {"status": "ok"}