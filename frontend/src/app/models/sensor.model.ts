export interface Sensor {
  id: number;
  nome: string;
  tipo: string;
  unidade: string;
  valor_min_esperado: number;
  valor_max_esperado: number;
}

export interface Leitura {
  id: number;
  sensor_id: number;
  valor: number;
  timestamp: string;
}

export interface Agregado {
  sensor_id: number;
  janela_minutos: number;
  media: number | null;
  minimo: number | null;
  maximo: number | null;
  total_leituras: number;
}