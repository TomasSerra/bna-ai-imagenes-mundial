import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import Lottie from 'lottie-react';
import { ArrowLeft, RotateCw, ThumbsUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FluxError, generateImage } from '@/lib/flux';
import { buildPrompt } from '@/lib/prompt';
import type { Opciones } from '@/types';
import loadingAnimation from '@/assets/loading-animation.json';

const STATUS_MESSAGES = [
  'Atando los botines…',
  'Inflando la pelota…',
  'Buscando la vuvuzela…',
  'Poniendo la camiseta…',
  'Convocando a la hinchada…',
  'Ajustando la bandera celeste y blanca…',
  'Calentando para salir a la cancha…',
  'Acomodando la cinta de capitán…',
  'Último toque antes del kickoff…',
  'Cantando el himno…',
  'Llamando al técnico…',
  'Pintando el Obelisco…',
  'Encendiendo los reflectores del estadio…',
  'Acomodando a la hinchada en la tribuna…',
  'Soplando la vuvuzela…',
  'Pidiéndole un pase al 10…',
  'Buscando la del 10…',
  'Tocando el bombo de la previa…',
  'Encendiendo las bengalas…',
  'Renderizando estilo Ghibli…',
  'Dándole magia de Pixar…',
  'Dibujando la caricatura…',
  'Anotando la formación titular…',
  'Esperando que termine el VAR…',
  'Cebando un mate para la previa…',
  'Repasando la táctica con el técnico…',
  'Bordando el escudo en la camiseta…',
  'Levantando polvo en el área…',
  'Pegándole un grito de gol…',
];

type Phase = 'generating' | 'done' | 'error';

interface GeneratePageProps {
  apiKey: string;
  photo: { base64: string; dataUrl: string };
  opciones: Opciones;
  onBack: () => void;
  onDone: () => void;
}

export function GeneratePage({ apiKey, photo, opciones, onBack, onDone }: GeneratePageProps) {
  const [phase, setPhase] = useState<Phase>('generating');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(STATUS_MESSAGES[0]);
  const [showConfetti, setShowConfetti] = useState(false);
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
    if (phase !== 'done') return;
    setShowConfetti(true);
  }, [phase]);

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
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={['#22c4e4', '#ffffff', '#2080bf', '#e3eef3']}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          tweenDuration={3000}
          onConfettiComplete={(instance) => {
            instance?.reset();
            setShowConfetti(false);
          }}
          className="pointer-events-none fixed inset-0 z-50"
        />
      )}
      <header className="grid grid-cols-3 items-center">
        <div className="justify-self-start">
          {phase === 'error' && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="size-4" /> Volver
            </Button>
          )}
        </div>
        <h2 className="whitespace-nowrap text-center text-3xl font-kievit-black tracking-wide text-white drop-shadow-md">
          {phase === 'generating' ? 'Generando Imagen' : 'Resultado'}
        </h2>
        <div />
      </header>

      <div className="flex flex-1 min-h-0 items-center justify-center">
        <div className="relative aspect-[9/16] h-full max-h-full w-auto max-w-full overflow-hidden rounded-lg border bg-muted">
          {phase === 'generating' && (
            <>
              <img
                src={photo.dataUrl}
                alt=""
                aria-hidden
                className="h-full w-full scale-110 object-cover blur-2xl"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                <Lottie
                  animationData={loadingAnimation}
                  loop
                  className="w-2/3 max-w-[70%]"
                />
                <p
                  key={statusMsg}
                  className="animate-in fade-in rounded-full bg-primary px-8 py-4 text-center text-3xl text-white shadow-md"
                >
                  {statusMsg}
                </p>
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

      {phase === 'generating' && (
        <>
          <Skeleton className="h-16 w-full" />
          <div className="flex items-center justify-center gap-6 rounded-2xl border bg-card p-6">
            <Skeleton className="size-48 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </>
      )}

      {phase === 'done' && (
        <Button
          onClick={onDone}
          className="h-16 w-full bg-primary text-2xl text-primary-foreground hover:bg-primary/90 [&_svg]:size-7"
        >
          <ThumbsUp /> Listo
        </Button>
      )}

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
            <p className="text-2xl font-kievit-black tracking-wide text-black">Escaneá para llevártela</p>
            <p className="text-lg text-black">
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
