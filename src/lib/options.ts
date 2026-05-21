import {
  Camera,
  CircleDot,
  Clapperboard,
  Drum,
  Flag,
  Goal,
  Landmark,
  Laugh,
  Users,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import type { EstiloId } from '@/types';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

interface Option {
  id: string;
  label: string;
  en: string;
  icon: IconComponent;
}

export const AMBIENTES: Option[] = [
  {
    id: 'obelisco',
    label: 'Obelisco',
    en: 'the Obelisco of Buenos Aires at dusk, with Argentine fans celebrating below',
    icon: Landmark,
  },
  {
    id: 'cancha',
    label: 'Cancha de fútbol',
    en: 'a professional soccer field at a packed stadium, bright stadium lights, fresh green grass',
    icon: Goal,
  },
  {
    id: 'tribuna',
    label: 'Tribuna de estadio',
    en: 'the stands of a packed soccer stadium full of cheering Argentine fans waving flags',
    icon: Users,
  },
];

export const ACCIONES: Option[] = [
  {
    id: 'pelota',
    label: 'Pelota de Fútbol',
    en: 'holding and controlling a classic black-and-white soccer ball',
    icon: CircleDot,
  },
  {
    id: 'bandera',
    label: 'Bandera Argentina',
    en: 'proudly waving a large Argentine flag (sky blue, white, sky blue horizontal stripes with a golden sun in the middle) over their shoulders',
    icon: Flag,
  },
  {
    id: 'bombo',
    label: 'Bombo',
    en: 'playing a traditional Argentine hinchada bass drum (bombo) strapped to the chest, holding drumsticks',
    icon: Drum,
  },
];

interface EstiloOption extends Option {
  id: EstiloId;
}

export const ESTILOS: EstiloOption[] = [
  {
    id: 'realista',
    label: 'Realista',
    en: 'photorealistic photograph, natural lighting, high detail, photorealistic skin tones',
    icon: Camera,
  },
  {
    id: 'pixar',
    label: 'Pixar 3D',
    en: 'Pixar-style 3D animated character, expressive face, stylized proportions, cinematic lighting, vibrant colors',
    icon: Clapperboard,
  },
  {
    id: 'caricatura',
    label: 'Caricatura',
    en: 'hand-drawn cartoon caricature, sketched by an artist on paper, exaggerated oversized head with small cartoon body, thick uneven hand-inked black outlines with visible pen strokes, slightly wobbly imperfect linework, hand-colored with soft cel-shading and simple highlights, exaggerated facial features (huge expressive eyes, big oversized smile with prominent teeth and lips, playful goofy expression), traditional caricature artist style like a street fair portrait, clean off-white paper background, vibrant marker-like colors',
    icon: Laugh,
  },
];
