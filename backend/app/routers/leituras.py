from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/leituras", tags=["leituras"])


@router.get("/{sensor_id}", response_model=list[schemas.LeituraOut])
def historico_leituras(
    sensor_id: int,
    desde: datetime | None = Query(None, description="Filtra leituras a partir desse timestamp (ISO 8601)"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Leitura).filter(models.Leitura.sensor_id == sensor_id)

    if desde:
        query = query.filter(models.Leitura.timestamp >= desde)

    return query.order_by(models.Leitura.timestamp).all()


@router.post("/", response_model=schemas.LeituraOut)
def registrar_leitura(leitura: schemas.LeituraCreate, db: Session = Depends(get_db)):
    nova_leitura = models.Leitura(**leitura.dict())
    db.add(nova_leitura)
    db.commit()
    db.refresh(nova_leitura)
    return nova_leitura


@router.get("/{sensor_id}/agregado")
def leituras_agregadas(
    sensor_id: int,
    minutos: int = Query(60, description="Janela de tempo em minutos (padrão: última hora)"),
    db: Session = Depends(get_db),
):
    desde = datetime.utcnow() - timedelta(minutes=minutos)

    resultado = (
        db.query(
            func.avg(models.Leitura.valor).label("media"),
            func.min(models.Leitura.valor).label("minimo"),
            func.max(models.Leitura.valor).label("maximo"),
            func.count(models.Leitura.id).label("total_leituras"),
        )
        .filter(models.Leitura.sensor_id == sensor_id)
        .filter(models.Leitura.timestamp >= desde)
        .first()
    )

    return {
        "sensor_id": sensor_id,
        "janela_minutos": minutos,
        "media": round(resultado.media, 2) if resultado.media is not None else None,
        "minimo": resultado.minimo,
        "maximo": resultado.maximo,
        "total_leituras": resultado.total_leituras,
    }


@router.get("/{sensor_id}/alertas", response_model=list[schemas.LeituraOut])
def leituras_fora_do_range(
    sensor_id: int,
    minutos: int = Query(60, description="Janela de tempo em minutos (padrão: última hora)"),
    db: Session = Depends(get_db),
):
    sensor = db.query(models.Sensor).filter(models.Sensor.id == sensor_id).first()

    if sensor is None:
        return []

    desde = datetime.utcnow() - timedelta(minutes=minutos)

    return (
        db.query(models.Leitura)
        .filter(models.Leitura.sensor_id == sensor_id)
        .filter(models.Leitura.timestamp >= desde)
        .filter(
            (models.Leitura.valor < sensor.valor_min_esperado)
            | (models.Leitura.valor > sensor.valor_max_esperado)
        )
        .order_by(models.Leitura.timestamp)
        .all()
    )