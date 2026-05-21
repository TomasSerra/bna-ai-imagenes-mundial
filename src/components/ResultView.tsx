import { Download, Sparkles, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultViewProps {
  imageUrl: string;
  onRegenerate: () => void;
  onChangeOptions: () => void;
  busy?: boolean;
}

export function ResultView({ imageUrl, onRegenerate, onChangeOptions, busy }: ResultViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center overflow-hidden rounded-lg border bg-muted">
        <img
          src={imageUrl}
          alt="Imagen generada"
          className="max-h-[80dvh] w-auto object-contain"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button asChild>
          <a
            href={imageUrl}
            download={`vos-en-el-campo-${Date.now()}.jpg`}
            rel="noopener noreferrer"
          >
            <Download className="size-4" /> Descargar
          </a>
        </Button>
        <Button variant="outline" onClick={onRegenerate} disabled={busy}>
          <RotateCw className="size-4" /> Regenerar
        </Button>
        <Button variant="outline" onClick={onChangeOptions} disabled={busy}>
          <Sparkles className="size-4" /> Cambiar opciones
        </Button>
      </div>
    </div>
  );
}
