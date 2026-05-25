import {
  Brush,
  CircleDot,
  Clapperboard,
  Flag,
  Goal,
  Landmark,
  Laugh,
  Megaphone,
  Sparkles,
  Users,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { EstiloId } from "@/types";

export type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { className?: string }
>;

interface Option {
  id: string;
  label: string;
  en: string;
  icon: IconComponent;
}

export const AMBIENTES: Option[] = [
  {
    id: "obelisco",
    label: "Obelisco",
    en: "on Avenida 9 de Julio in front of the white Obelisco of Buenos Aires at golden hour, with a packed crowd of Argentine fans in sky-blue and white waving large Argentine flags behind the person",
    icon: Landmark,
  },
  {
    id: "cancha",
    label: "Cancha de fútbol",
    en: "on the grass of a packed soccer stadium with floodlights and a softly blurred crowd in the stands behind",
    icon: Goal,
  },
  {
    id: "tribuna",
    label: "Tribuna de estadio",
    en: "seated among the crowd inside packed stadium stands, shoulder-to-shoulder with other Argentine fans in sky-blue and white — not on the field, no grass visible",
    icon: Users,
  },
];

export const ACCIONES: Option[] = [
  {
    id: "pelota",
    label: "Pelota de Fútbol",
    en: "holding a soccer ball at chest level",
    icon: CircleDot,
  },
  {
    id: "bandera",
    label: "Bandera Argentina",
    en: "holding one Argentine flag (sky-blue / white / sky-blue horizontal stripes with the golden Sun of May) on a single thin white flagpole, gripped with one raised hand only",
    icon: Flag,
  },
  {
    id: "vuvuzela",
    label: "Vuvuzela",
    en: "holding a long sky-blue and white striped vuvuzela horn raised toward the face, shown from a three-quarter side angle",
    icon: Megaphone,
  },
];

interface EstiloOption extends Option {
  id: EstiloId;
}

export const ESTILOS: EstiloOption[] = [
  {
    id: "ghibli",
    label: "Ghibli 2D",
    en: "hand-painted 2D anime in the style of Studio Ghibli films (Spirited Away, My Neighbor Totoro, Howl's Moving Castle) — soft watercolor backgrounds, gentle pastel colors, hand-drawn cel-shaded characters with clean line work, warm cinematic atmosphere; the styling is light so the person's actual facial features (their real eye shape and color, their real nose, their real mouth, their real hair color and style) remain clearly recognizable — do NOT replace the face with a generic anime character, do NOT enlarge the eyes into oversized anime eyes",
    icon: Sparkles,
  },
  {
    id: "pixar",
    label: "Pixar 3D",
    en: "stylized 3D animated render in the soft look of modern Pixar/Disney films (Encanto, Luca, Coco) — soft painterly lighting, gentle cel-shaded skin, warm cinematic atmosphere; the styling is light and subtle so the person's actual facial features (their real eye shape and color, their real nose, their real mouth, their real hair color and style) remain clearly recognizable — do NOT replace the face with a generic cartoon character, do NOT enlarge the eyes into oversized anime/cartoon eyes",
    icon: Clapperboard,
  },
  {
    id: "caricatura2d",
    label: "Caricatura 2D",
    en: "hand-drawn 2D caricature in the polished style of a professional caricature artist — exaggerated proportions with a noticeably oversized head and a small body, bold clean inked outlines around the face and hair, smooth hand-colored shading with subtle painted texture, detailed individual strands of hair, polished comic-style line work, recognizable real features brought out with slight playful exaggeration (eyes, smile, hair) while keeping the actual likeness of the reference photo. FRAMING: the character is positioned in the center of the canvas and occupies only the middle portion of the frame, with clear space all around them. BACKGROUND (MANDATORY): a fully drawn scene in the same caricature style covers 100% of the canvas — every pixel of the background, including above the head, beside the shoulders, below the body and in all four corners, must be drawn-in scene content; NO blank paper, NO white margins, NO empty space, NO vignette",
    icon: Brush,
  },
  {
    id: "caricatura3d",
    label: "Caricatura 3D",
    en: "highly stylized 3D caricature with a huge head, expressive facial features, and playful exaggeration — rendered in a smooth, polished style with clean materials and soft ambient lighting. The entire scene (background, crowd and objects) rendered in the same smooth 3D caricature style filling the full frame edge-to-edge — no empty white space",
    icon: Laugh,
  },
];
