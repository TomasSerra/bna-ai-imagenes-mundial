import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, RotateCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FluxError, generateImage } from '@/lib/flux';
import { buildPrompt } from '@/lib/prompt';
import type { Opciones } from '@/types';

const STATUS_MESSAGES = [
  'Atando los botines…',
  'Inflando la pelota…',
  'Buscando la vuvuzela…',
  'Poniendo la camiseta',
  'Convocando a la hinchada…',
  'Ajustando la bandera…',
  'Calentando para salir a la cancha…',
  'Acomodando la cinta de capitán…',
  'Último toque antes del kickoff…',
  'Cantando el himno…',
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
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(STATUS_MESSAGES[0]);
  const currentResultRef = useRef<string | null>(null);
  const hasRunRef = useRef(false);

  const run = async () => {
    setPhase('generating');
    setErrorMsg(null);
    setPublicUrl(null);
    try {
      const { prompt, extraReferenceUrl } = buildPrompt(opciones);
      const { blob, url: falUrl } = await generateImage({
        apiKey,
        prompt,
        inputImageBase64: photo.base64,
        extraReferenceUrl,
      });
      if (currentResultRef.current) URL.revokeObjectURL(currentResultRef.current);
      const objectUrl = URL.createObjectURL(blob);
      currentResultRef.current = objectUrl;
      setResultUrl(objectUrl);
      setPublicUrl(falUrl);
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
        <div className="relative aspect-[9/16] h-full max-h-full w-auto max-w-full overflow-hidden rounded-lg border bg-muted">
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

      {phase === 'done' && publicUrl && (
        <div className="flex items-center justify-center gap-6 rounded-2xl border bg-card p-6">
          <div className="size-48 shrink-0 rounded-lg bg-white p-3">
            <QRCodeSVG
              value={`${window.location.origin}/image?u=${encodeURIComponent(publicUrl)}`}
              level="M"
              className="h-full w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold">Escaneá para llevártela</p>
            <p className="text-lg text-muted-foreground">
              Apuntá la cámara de tu celular al QR
            </p>
          </div>
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
