import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhotoCapture } from '@/components/PhotoCapture';
import { OptionsForm } from '@/components/OptionsForm';
import type { Opciones } from '@/types';

interface CapturePageProps {
  photo: { base64: string; dataUrl: string } | null;
  setPhoto: (p: { base64: string; dataUrl: string } | null) => void;
  opciones: Opciones;
  setOpciones: (o: Opciones) => void;
  canGenerate: boolean;
  onGenerate: () => void;
}

export function CapturePage({
  photo,
  setPhoto,
  opciones,
  setOpciones,
  canGenerate,
  onGenerate,
}: CapturePageProps) {
  return (
    <div className="flex h-dvh w-dvw flex-col gap-4 overflow-hidden p-6">
      <section className="flex flex-[1.15] min-h-0 flex-col">
        <h2 className="mb-4 text-3xl font-bold">1. Sacate una foto</h2>
        <div className="flex-1 min-h-0">
          <PhotoCapture
            hasPhoto={Boolean(photo)}
            previewUrl={photo?.dataUrl}
            onCapture={(p) => setPhoto(p)}
            onReset={() => setPhoto(null)}
          />
        </div>
      </section>

      <section className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
        <h2 className="text-3xl font-bold">2. Elegí la escena mundialera</h2>
        <div className="flex-1 min-h-0 overflow-auto">
          <OptionsForm value={opciones} onChange={setOpciones} />
        </div>
        {photo ? (
          <Button
            className="h-20 w-full text-3xl [&_svg]:size-8"
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            <Sparkles /> Generar imagen
          </Button>
        ) : (
          <p className="text-center text-xl text-muted-foreground">
            Primero capturá una foto arriba.
          </p>
        )}
      </section>
    </div>
  );
}
