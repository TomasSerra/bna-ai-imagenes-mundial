import type { Opciones } from '@/types';
import { ACCIONES, AMBIENTES, ESTILOS } from './options';

export function buildPrompt(opciones: Opciones): string {
  const ambiente = AMBIENTES.find((a) => a.id === opciones.ambiente)?.en ?? opciones.ambiente;
  const accion = ACCIONES.find((a) => a.id === opciones.accion)?.en ?? opciones.accion;
  const estilo = ESTILOS.find((e) => e.id === opciones.estilo)?.en ?? 'photorealistic photograph';

  return [
    `A ${estilo} of the same person as in the reference image,`,
    `${accion}, in ${ambiente}.`,
    `Preserve the person's facial features, identity, and likeness exactly — same face, same features.`,
    `Cinematic composition, rich detail.`,
  ].join(' ');
}
