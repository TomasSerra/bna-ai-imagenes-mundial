import type { Opciones } from '@/types';
import { ACCIONES, AMBIENTES, ESTILOS } from './options';

export function buildPrompt(opciones: Opciones): string {
  const ambiente = AMBIENTES.find((a) => a.id === opciones.ambiente)?.en ?? opciones.ambiente;
  const accion = ACCIONES.find((a) => a.id === opciones.accion)?.en ?? opciones.accion;
  const estilo = ESTILOS.find((e) => e.id === opciones.estilo)?.en ?? 'photorealistic photograph';

  return [
    `A ${estilo} of the same person as in the reference image,`,
    // We intentionally do NOT call this "the Argentina jersey" — that phrase
    // makes the model recall branded training images (AFA crest, Adidas
    // stripes, sponsor logos). Instead we describe the garment purely visually
    // and stack negatives so the fabric stays blank.
    `wearing a plain casual short-sleeve t-shirt with vertical sky-blue and white stripes (alternating, equal width) — completely blank fabric, no logos, no brand marks, no sponsor marks, no text, no numbers, no crest, no shield, no emblem, no patches, no embroidery, no graphics of any kind, just simple alternating vertical stripes on smooth plain cotton —`,
    `${accion}, in ${ambiente}.`,
    `Preserve the person's facial features, identity, and likeness exactly — same face, same features.`,
    `Vertical 9:16 portrait composition, cinematic, rich detail.`,
  ].join(' ');
}
