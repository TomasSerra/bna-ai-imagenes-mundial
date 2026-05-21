export type EstiloId = 'realista' | 'pixar' | 'caricatura';

export interface Opciones {
  ambiente: string;
  accion: string;
  estilo: EstiloId;
}
