import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Loader2, RotateCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FluxError, generateImage } from '@/lib/flux';
import { buildPrompt } from '@/lib/prompt';
import type { Opciones } from '@/types';

const STATUS_MESSAGES = [
  'Atando los botines…',
  'Inflando la pelota…',
  'Afinando el bombo…',
  'Pintando la camiseta albiceleste…',
  'Convocando a la hinchada…',
  'Ajustando la bandera…',
  'Calentando en el túnel…',
  'Acomodando la cinta de capitán…',
  'Último toque antes del kickoff…',
  'Cantando el himno…',
  'Limando los tapones…',
  'Llamando al técnico…',
];

type Phase = 'generating' | 'done' | 'error';

interface GeneratePageProps {
  apiKey: string;
  photo: { base64: string; dataUrl: string };
  opciones: Opciones;
  onBack: () => void;
}

export function GeneratePage({ apiKey, photo, opciones, onBack }: GeneratePageProps) {
  const [phase, setPhase] = useState<Phase>('generating');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(STATUS_MESSAGES[0]);
  const currentResultRef = useRef<string | null>(null);
  const hasRunRef = useRef(false);

  const run = async () => {
    setPhase('generating');
    setErrorMsg(null);
    try {
      const blob = await generateImage({
        apiKey,
        prompt: buildPrompt(opciones),
        inputImageBase64: photo.base64,
      });
      if (currentResultRef.current) URL.revokeObjectURL(currentResultRef.current);
      const url = URL.createObjectURL(blob);
      currentResultRef.current = url;
      setResultUrl(url);
      setPhase('done');
    } catch (err) {
      const msg =
        err instanceof FluxError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Error desconocido';
      setErrorMsg(msg);
      setPhase('error');
    }
  };

  const regenerate = () => {
    // Re-arm so the user-triggered "Regenerar" / "Reintentar" can run again.
    hasRunRef.current = true;
    run();
  };

  useEffect(() => {
    // Guard against React StrictMode double-invocation in dev — without this,
    // every "Generar" would submit TWO requests to fal.ai and charge twice.
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    run();
    return () => {
      if (currentResultRef.current) URL.revokeObjectURL(currentResultRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'generating') return;
    setStatusMsg(STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)]);
    const id = window.setInterval(() => {
      setStatusMsg((prev) => {
        const pool = STATUS_MESSAGES.filter((m) => m !== prev);
        return pool[Math.floor(Math.random() * pool.length)];
      });
    }, 2200);
    return () => window.clearInterval(id);
  }, [phase]);

  return (
    <div className="flex h-dvh w-dvw flex-col gap-4 overflow-hidden p-6">
      <header className="grid grid-cols-3 items-center">
        <div className="justify-self-start">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" /> Volver
          </Button>
        </div>
        <h2 className="text-center text-3xl font-bold">Resultado</h2>
        <div />
      </header>

      <div className="flex flex-1 min-h-0 items-center justify-center">
        <div className="relative aspect-[9/16] h-full max-h-full overflow-hidden rounded-lg border bg-muted">
          {phase === 'generating' && (
            <>
              <Skeleton className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-3 rounded-full bg-background/90 px-6 py-4 text-muted-foreground shadow-sm backdrop-blur-sm">
                  <Loader2 className="size-6 animate-spin" />
                  <p key={statusMsg} className="animate-in fade-in text-lg">
                    {statusMsg}
                  </p>
                </div>
              </div>
            </>
          )}

          {phase === 'done' && resultUrl && (
            <img
              src={resultUrl}
              alt="Imagen generada"
              className="h-full w-full object-cover"
            />
          )}

          {phase === 'error' && errorMsg && (
            <div className="flex h-full items-center justify-center p-6">
              <Alert variant="destructive">
                <AlertTitle>Algo salió mal</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>

      {phase === 'done' && resultUrl && (
        <div className="grid grid-cols-2 gap-3">
          <Button asChild className="h-16 text-2xl [&_svg]:size-7">
            <a href={resultUrl} download={`mundial-argentina-${Date.now()}.jpg`}>
              <Download /> Descargar
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={regenerate}
            className="h-16 text-2xl [&_svg]:size-7"
          >
            <RotateCw /> Regenerar
          </Button>
        </div>
      )}

      {phase === 'error' && (
        <Button onClick={regenerate} className="h-16 w-full text-2xl [&_svg]:size-7">
          <RotateCw /> Reintentar
        </Button>
      )}
    </div>
  );
}
