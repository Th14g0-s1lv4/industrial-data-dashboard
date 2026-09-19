from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/leituras", tags=["leituras"])


@router.get("/{sensor_id}", response_model=list[schemas.LeituraOut])
def historico_leituras(sensor_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Leitura)
        .filter(models.Leitura.sensor_id == sensor_id)
        .order_by(models.Leitura.timestamp)
        .all()
    )


@router.post("/", response_model=schemas.LeituraOut)
def registrar_leitura(leitura: schemas.LeituraCreate, db: Session = Depends(get_db)):
    nova_leitura = models.Leitura(**leitura.dict())
    db.add(nova_leitura)
    db.commit()
    db.refresh(nova_leitura)
    return nova_leitura