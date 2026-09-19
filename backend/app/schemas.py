from pydantic import BaseModel
from datetime import datetime


class SensorBase(BaseModel):
    nome: str
    tipo: str
    unidade: str
    valor_min_esperado: float
    valor_max_esperado: float


class SensorCreate(SensorBase):
    pass


class SensorOut(SensorBase):
    id: int

    class Config:
        from_attributes = True


class LeituraBase(BaseModel):
    valor: float


class LeituraCreate(LeituraBase):
    sensor_id: int


class LeituraOut(LeituraBase):
    id: int
    sensor_id: int
    timestamp: datetime

    class Config:
        from_attributes = True