import random
import time

from .database import SessionLocal
from . import models


def gerar_valor(sensor: models.Sensor) -> float:
    """Gera um valor realista para o sensor, com chance ocasional de sair do range esperado."""
    margem = (sensor.valor_max_esperado - sensor.valor_min_esperado) * 0.1

    # 10% de chance de gerar uma leitura fora do range (simula anomalia)
    if random.random() < 0.1:
        if random.random() < 0.5:
            return round(random.uniform(
                sensor.valor_min_esperado - margem * 2,
                sensor.valor_min_esperado
            ), 2)
        else:
            return round(random.uniform(
                sensor.valor_max_esperado,
                sensor.valor_max_esperado + margem * 2
            ), 2)

    # Caso normal: valor dentro do range esperado
    return round(random.uniform(
        sensor.valor_min_esperado,
        sensor.valor_max_esperado
    ), 2)


def rodar_simulacao(intervalo_segundos: int = 5):
    print(f"Simulador iniciado — gerando leituras a cada {intervalo_segundos}s. Ctrl+C para parar.")

    while True:
        db = SessionLocal()
        try:
            sensores = db.query(models.Sensor).all()

            if not sensores:
                print("Nenhum sensor cadastrado ainda. Cadastre sensores via /sensores/ antes de simular.")
            else:
                for sensor in sensores:
                    valor = gerar_valor(sensor)
                    nova_leitura = models.Leitura(sensor_id=sensor.id, valor=valor)
                    db.add(nova_leitura)
                    print(f"[{sensor.nome}] nova leitura: {valor} {sensor.unidade}")

                db.commit()
        finally:
            db.close()

        time.sleep(intervalo_segundos)


if __name__ == "__main__":
    rodar_simulacao()