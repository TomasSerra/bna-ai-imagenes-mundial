import type { Opciones } from '@/types';
import { ACCIONES, AMBIENTES, ESTILOS } from './options';

export function buildPrompt(opciones: Opciones): string {
  const ambiente = AMBIENTES.find((a) => a.id === opciones.ambiente)?.en ?? opciones.ambiente;
  const accion = ACCIONES.find((a) => a.id === opciones.accion)?.en ?? opciones.accion;
  const estilo = ESTILOS.find((e) => e.id === opciones.estilo)?.en ?? 'photorealistic photograph';

  // The model receives TWO reference images:
  //   1) the user's face (identity reference)
  //   2) a flat 2D illustration of a light-blue/white striped soccer jersey
  //      (design reference — we copy stripes/pattern from it, NOT its art style)
  //
  // We tell the model explicitly to use ref #2 only for the jersey design and
  // to render that jersey in whatever style the user picked.
  return [
    `A ${estilo} of the same person as in the first reference image,`,
    `wearing a soccer jersey whose design, stripe pattern, and color layout match exactly the second reference image — light blue (sky blue) and white vertical stripes, no logos, no sponsors, no text, no numbers, no crest, no badges of any kind, just clean alternating vertical stripes,`,
    `CRITICAL: the second reference image is a flat 2D illustration shown ONLY as a design template for the jersey stripes and shape; render the jersey in the SAME artistic style as the rest of the image (the style described above), NOT as a flat 2D illustration, unless the chosen style is itself a flat illustration,`,
    `${accion}, in ${ambiente}.`,
    `Preserve the person's facial features, identity, and likeness exactly from the first reference image — same face, same features.`,
    `Vertical 9:16 portrait composition, cinematic, rich detail.`,
  ].join(' ');
}
