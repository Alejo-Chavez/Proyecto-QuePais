export interface ApiResponse {
  categorias: Categoria[];
}

export interface Categoria {
  nombre: string;
  preguntas: Pregunta[];
}

export interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  respuesta: string;
}