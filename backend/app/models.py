from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class Sensor(Base):
    __tablename__ = "sensores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)
    unidade = Column(String, nullable=False)
    valor_min_esperado = Column(Float, nullable=False)
    valor_max_esperado = Column(Float, nullable=False)

    leituras = relationship("Leitura", back_populates="sensor", cascade="all, delete-orphan")


class Leitura(Base):
    __tablename__ = "leituras"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensores.id"), nullable=False)
    valor = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    sensor = relationship("Sensor", back_populates="leituras")