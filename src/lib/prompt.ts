import type { EstiloId, Opciones } from "@/types";
import { ACCIONES, AMBIENTES, ESTILOS } from "./options";

interface ExtraReference {
  label: string;
  url: string;
}

const EXTRA_REFERENCES: Record<string, ExtraReference> = {
  pelota: { label: "soccer ball", url: "/pelota.png" },
  vuvuzela: {
    label: "sky-blue and white striped vuvuzela horn",
    url: "/vuvuzela.png",
  },
};

export interface BuiltPrompt {
  prompt: string;
  extraReferenceUrl: string | null;
}

export function buildPrompt(opciones: Opciones): BuiltPrompt {
  const ambiente = AMBIENTES.find((a) => a.id === opciones.ambiente)?.en ?? "";
  const accion = ACCIONES.find((a) => a.id === opciones.accion)?.en ?? "";
  const estilo =
    ESTILOS.find((e) => e.id === opciones.estilo)?.en ?? "photograph";

  const extraRef = EXTRA_REFERENCES[opciones.accion] ?? null;

  // Pixar and caricatura push the model hardest away from the reference face.
  // For those, repeat an explicit per-feature reminder so identity wins over
  // the style's pull toward a generic cartoon face.
  const STYLIZED_LABELS: Partial<Record<EstiloId, string>> = {
    pixar: "animated 3D",
    caricatura2d: "2D hand-drawn caricature",
    caricatura3d: "3D caricature",
    ghibli: "Ghibli 2D anime",
  };
  const stylizedLabel = STYLIZED_LABELS[opciones.estilo];
  const stylizedIdentityLine = stylizedLabel
    ? `IMPORTANT: even though the style is ${stylizedLabel}, the rendered face must keep the person's actual identifiable features from the first reference image — their exact eye shape and color, their exact nose shape, their exact mouth shape, their exact hair color and style, their gender. Apply the style as a surface treatment (lighting, shading, line work) but DO NOT redraw the face into a generic cartoon character.`
    : "";

  // 3D styles (Pixar / Caricatura 3D) have the strongest prior toward rendering
  // an official Argentina national-team kit with a sponsor mark on the chest.
  // Reinforce the blank-jersey directive specifically for those.
  const blankJerseyOverride =
    opciones.estilo === "pixar" || opciones.estilo === "caricatura3d"
      ? `In this 3D style, render the jersey as a completely generic plain striped uniform — the front of the jersey across the chest area is a smooth empty piece of cloth with only the sky-blue and white stripes, nothing decorating the chest, nothing centered on the chest, no rectangular patch on the chest, no circular emblem on the chest.`
      : "";

  const lines = [
    `Render the EXACT same person from the first reference image. Preserve their identity faithfully: the same face shape, the same eyes, nose, mouth and jawline, the same skin tone, the same hair color and style, the same gender, age and ethnicity. The generated face must be an unmistakable likeness of that exact individual — do not invent a new face, do not blend with anyone else.`,
    `Style: ${estilo}.`,
    stylizedIdentityLine,
    blankJerseyOverride,
    `The person wears a generic plain striped soccer jersey — sky-blue and white vertical stripes only, matching the pattern of the second reference image. The chest, sleeves and back of the jersey are COMPLETELY UNMARKED clean fabric: no printed marks, no embroidered shapes, no logos, no badges, no emblems, no patches, no symbols, no text and no numbers anywhere on the garment. Imagine an off-brand generic store-bought striped jersey, not a real official national-team sports kit. The fabric is pure cloth with only the stripes — nothing else.`,
    `Action: ${accion}.`,
    `Scene: ${ambiente}.`,
    extraRef ? `Match the ${extraRef.label} to the third reference image.` : "",
    opciones.estilo === "caricatura2d" || opciones.estilo === "caricatura3d"
      ? `Vertical 9:16 composition with the character centered and the scene visible all around them — leave clear room for the background on every side. Cinematic, rich detail.`
      : `Waist-up vertical 9:16 portrait, cinematic, rich detail.`,
    `FINAL REMINDER: (1) the face in the generated image is a clear, recognizable likeness of the person in the first reference image — same eyes, same nose, same mouth, same jawline, same gender, do not stylize the facial structure away from that reference; (2) the jersey is completely blank, only the sky-blue and white stripes, zero logos / badges / text / numbers; (3) the background fills the entire frame in the chosen style — no empty white space.`,
  ].filter(Boolean);

  return { prompt: lines.join(" "), extraReferenceUrl: extraRef?.url ?? null };
}
