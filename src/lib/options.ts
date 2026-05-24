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
    en: 'in front of the iconic white Obelisco of Buenos Aires on Avenida 9 de Julio, the Obelisco clearly visible directly behind the person in the background, golden hour light, Argentine fans and flags around the avenue',
    icon: Landmark,
  },
  {
    id: 'cancha',
    label: 'Cancha de fútbol',
    en: 'on the fresh green grass of a professional soccer field inside a packed stadium, bright stadium floodlights overhead, the crowd in the stands softly blurred in the background',
    icon: Goal,
  },
  {
    id: 'tribuna',
    label: 'Tribuna de estadio',
    en: 'in the middle of the stands of a packed soccer stadium, surrounded on all sides by cheering Argentine fans in sky-blue and white, the soccer field visible far below, stadium floodlights',
    icon: Users,
  },
];

export const ACCIONES: Option[] = [
  {
    id: 'pelota',
    label: 'Pelota de Fútbol',
    en: 'holding a classic black-and-white soccer ball in their hands at chest level',
    icon: CircleDot,
  },
  {
    id: 'bandera',
    label: 'Bandera Argentina',
    en: 'holding a large Argentine flag mounted on a wooden flagpole — the person is gripping the flagpole firmly with one raised hand, the flag attached to the pole and waving in the wind (flameando), fabric rippling dynamically as if blown by a breeze; the flag has three horizontal stripes (sky blue on top, white in the middle, sky blue on the bottom) with the golden Sun of May in the center stripe, no other logos or text, the flag clearly visible and unfurled',
    icon: Flag,
  },
  {
    id: 'bombo',
    label: 'Bombo',
    en: 'wearing a traditional Argentine hinchada bass drum (bombo) hanging from their neck by a wide fabric strap across the shoulder, the drum resting against their torso, holding a wooden drumstick (maza) in their hand ready to play',
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
    en: 'ultra photorealistic photograph, sharp focus, natural lighting, high detail, photorealistic skin tones and textures, faithfully preserving the exact face shape, bone structure, facial proportions, and likeness from the first reference image',
    icon: Camera,
  },
  {
    id: 'pixar',
    label: 'Pixar 3D',
    en: 'highly stylized Pixar-Disney 3D animated character render in the cinematic look of modern Disney/Pixar feature films (Tangled, Encanto, Inside Out, Soul, Luca), very large expressive cartoon eyes with detailed glossy multi-toned irises, bright sparkling catchlights and soft eyelashes, rounded soft cheeks, slightly exaggerated stylized facial proportions (small button nose, gentle half-smile, soft jawline), smooth stylized skin with rich subsurface scattering, fluffy detailed hair with visible individual hair strands and flyaways catching soft cinematic rim light wrapping around the silhouette, very soft painterly diffused shadows on the character (NEVER harsh edges, NEVER realistic shadow falloff), shallow depth of field with creamy dreamy bokeh, ultra detailed PBR materials on the character, soft global illumination, high-quality octane/arnold/renderman 3D render, animation-grade topology and shading, NOT photorealistic, NOT realistic photo — pure stylized 3D animation movie still',
    icon: Clapperboard,
  },
  {
    id: 'caricatura',
    label: 'Caricatura',
    en: 'hand-drawn cartoon caricature, sketched by an artist on paper, exaggerated oversized head with small cartoon body, thick uneven hand-inked black outlines with visible pen strokes, slightly wobbly imperfect linework, hand-colored with soft cel-shading and simple highlights, exaggerated facial features (huge expressive eyes, big oversized smile with prominent teeth and lips, playful goofy expression), traditional caricature artist style like a street fair portrait, clean off-white paper background, vibrant marker-like colors',
    icon: Laugh,
  },
];
