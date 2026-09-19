from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/sensores", tags=["sensores"])


@router.get("/", response_model=list[schemas.SensorOut])
def listar_sensores(db: Session = Depends(get_db)):
    return db.query(models.Sensor).all()


@router.post("/", response_model=schemas.SensorOut)
def criar_sensor(sensor: schemas.SensorCreate, db: Session = Depends(get_db)):
    novo_sensor = models.Sensor(**sensor.dict())
    db.add(novo_sensor)
    db.commit()
    db.refresh(novo_sensor)
    return novo_sensor