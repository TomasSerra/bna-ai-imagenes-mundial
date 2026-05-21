export type EstiloId = 'realista' | 'vectorial' | 'oleo' | 'acuarela' | 'ghibli' | 'pixar' | 'caricatura';

export interface Opciones {
  ambiente: string;
  accion: string;
  estilo: EstiloId;
}
