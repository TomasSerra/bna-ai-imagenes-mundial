import type { Opciones } from '@/types';
import { ACCIONES, AMBIENTES, ESTILOS } from './options';

export function buildPrompt(opciones: Opciones): string {
  const ambiente = AMBIENTES.find((a) => a.id === opciones.ambiente)?.en ?? opciones.ambiente;
  const accion = ACCIONES.find((a) => a.id === opciones.accion)?.en ?? opciones.accion;
  const estilo = ESTILOS.find((e) => e.id === opciones.estilo)?.en ?? 'photorealistic photograph';

  const confetti =
    opciones.ambiente === 'cancha' || opciones.ambiente === 'tribuna'
      ? 'A few scattered sky-blue and white paper confetti pieces gently falling through the air around the person — sparse, only a small amount, light and celebratory (not a heavy shower).'
      : '';

  const usesBallReference = opciones.accion === 'pelota';

  // Reference images sent to the multi-reference model:
  //   1) the user's face (identity reference)
  //   2) a flat 2D illustration of a light-blue/white striped soccer jersey
  //      (design reference — we copy stripes/pattern from it, NOT its art style)
  //   3) (optional, when accion === 'pelota') a soccer ball reference
  //
  // We tell the model explicitly how to use each reference and to render the
  // jersey/ball in whatever style the user picked.
  const ballRefLine = usesBallReference
    ? 'The soccer ball must visually match the THIRD reference image (its shape, panel pattern, color and proportions); render that ball in the SAME artistic style as the rest of the image (the style described above), NOT as a photograph if the chosen style is non-photographic.'
    : '';

  return [
    `A ${estilo} of the same person as in the first reference image,`,
    `wearing a soccer jersey whose stripe pattern and color layout match exactly the second reference image — light blue (sky blue) and white vertical stripes only.`,
    `ABSOLUTELY NO logos, NO brand marks, NO manufacturer marks (no Adidas, no Nike, no Puma, no swoosh, no three stripes), NO team crest, NO shield, NO AFA badge, NO Argentina football association emblem, NO sponsor patches, NO numbers, NO text, NO names — the jersey must be 100% clean: only the plain sky-blue and white vertical stripes, nothing else printed or embroidered on it. This rule is critical and must not be violated.`,
    `CRITICAL: the second reference image is a flat 2D illustration shown ONLY as a design template for the jersey stripes and shape; render the jersey in the SAME artistic style as the rest of the image (the style described above), NOT as a flat 2D illustration, unless the chosen style is itself a flat illustration.`,
    `The person is ${accion}, ${ambiente}.`,
    ballRefLine,
    confetti,
    `Preserve the person's facial features, identity, and likeness exactly from the first reference image — same face, same features.`,
    `Frame the shot from the waist up — do NOT show the full body, legs, or feet. Upper-body / half-body portrait only.`,
    `Vertical 9:16 portrait composition, cinematic, rich detail.`,
  ]
    .filter(Boolean)
    .join(' ');
}
