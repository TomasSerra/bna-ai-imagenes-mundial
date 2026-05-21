import {
  Beef,
  Brush,
  Camera,
  Clapperboard,
  Coffee,
  Dog,
  Droplets,
  Grape,
  Laugh,
  Milk,
  Mountain,
  PenTool,
  Scissors,
  Sparkles,
  Sprout,
  Sun,
  Tractor,
  Warehouse,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { Horse } from '@/components/icons/Horse';
import type { EstiloId } from '@/types';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

interface Option {
  id: string;
  label: string;
  en: string;
  icon: IconComponent;
}

export const AMBIENTES: Option[] = [
  { id: 'campo', label: 'Campo abierto', en: 'an open countryside field at sunrise', icon: Sun },
  { id: 'granja', label: 'Granja', en: 'a farm with a classic red barn', icon: Warehouse },
  { id: 'soja', label: 'Sembrado de soja', en: 'a vast soybean field', icon: Sprout },
  { id: 'vinedo', label: 'Viñedo', en: 'a vineyard in Mendoza, Argentina', icon: Grape },
  { id: 'patagonia', label: 'Patagonia', en: 'the Patagonian steppe with mountains in the distance', icon: Mountain },
  { id: 'corral', label: 'Corral con vacas', en: 'a corral surrounded by cows', icon: Beef },
];

export const ACCIONES: Option[] = [
  { id: 'tractor', label: 'Manejando un tractor', en: 'driving a green John Deere tractor', icon: Tractor },
  { id: 'caballo', label: 'A caballo', en: 'riding a horse at a gallop', icon: Horse },
  { id: 'ordenando', label: 'Ordeñando una vaca', en: 'milking a cow by hand on a wooden stool', icon: Milk },
  { id: 'arreando', label: 'Arreando ovejas', en: 'herding sheep with a sheepdog', icon: Dog },
  { id: 'mate', label: 'Tomando mate', en: 'drinking mate at sunset, leaning on a wooden fence', icon: Coffee },
  { id: 'esquilando', label: 'Esquilando ovejas', en: 'shearing a sheep with traditional shears', icon: Scissors },
];

interface EstiloOption extends Option {
  id: EstiloId;
}

export const ESTILOS: EstiloOption[] = [
  { id: 'realista', label: 'Realista', en: 'photorealistic photograph, natural lighting, high detail, photorealistic skin tones', icon: Camera },
  { id: 'vectorial', label: '2D vectorial', en: '2D flat vector illustration, bold lines, simple shapes, vibrant colors', icon: PenTool },
  { id: 'oleo', label: 'Óleo', en: 'oil painting, visible brush strokes, classical art style', icon: Brush },
  { id: 'acuarela', label: 'Acuarela', en: 'watercolor painting, soft washes, paper texture', icon: Droplets },
  { id: 'ghibli', label: 'Ghibli', en: 'Studio Ghibli anime style, soft pastel palette, hand-drawn feel', icon: Sparkles },
  { id: 'pixar', label: 'Pixar', en: 'Pixar-style 3D animated character, expressive face, stylized proportions, cinematic lighting, vibrant colors', icon: Clapperboard },
  { id: 'caricatura', label: 'Caricatura', en: 'hand-drawn cartoon caricature, sketched by an artist on paper, exaggerated oversized head with small cartoon body, thick uneven hand-inked black outlines with visible pen strokes, slightly wobbly imperfect linework, hand-colored with soft cel-shading and simple highlights, exaggerated facial features (huge expressive eyes, big oversized smile with prominent teeth and lips, playful goofy expression), traditional caricature artist style like a street fair portrait, clean off-white paper background, vibrant marker-like colors', icon: Laugh },
];
