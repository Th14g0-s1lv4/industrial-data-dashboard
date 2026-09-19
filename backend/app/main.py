from fastapi import FastAPI

from .database import Base, engine
from .routers import sensores, leituras

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Industrial Data Dashboard API")

app.include_router(sensores.router)
app.include_router(leituras.router)


@app.get("/")
def root():
    return {"status": "ok"}