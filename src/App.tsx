import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { PhotoCapture } from '@/components/PhotoCapture';
import { OptionsForm } from '@/components/OptionsForm';
import { ResultView } from '@/components/ResultView';
import { FluxError, generateImage } from '@/lib/flux';
import { buildPrompt } from '@/lib/prompt';
import type { Opciones } from '@/types';

const STATUS_MESSAGES = [
  'Calentando los pinceles…',
  'Mezclando los colores…',
  'Pensando en la escena perfecta…',
  'Ensillando el caballo…',
  'Cebando un mate para inspirarse…',
  'Puliendo cada detalle…',
  'Convocando a la musa…',
  'Ajustando la luz del atardecer…',
  'Dándole vida al lienzo…',
  'Acomodando el sombrero…',
  'Tirando magia sobre los píxeles…',
  'Casi listo, último retoque…',
];

const STORAGE_KEY = 'fal_api_key';

const DEFAULT_OPCIONES: Opciones = {
  ambiente: 'campo',
  accion: 'tractor',
  estilo: 'realista',
};

type Phase = 'idle' | 'generating' | 'done' | 'error';

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [keyDialogOpen, setKeyDialogOpen] = useState<boolean>(false);

  const [photo, setPhoto] = useState<{ base64: string; dataUrl: string } | null>(null);
  const [opciones, setOpciones] = useState<Opciones>(DEFAULT_OPCIONES);

  const [phase, setPhase] = useState<Phase>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(STATUS_MESSAGES[0]);

  useEffect(() => {
    if (!apiKey) setKeyDialogOpen(true);
  }, [apiKey]);

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

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const canGenerate = useMemo(
    () => Boolean(apiKey && photo && phase !== 'generating'),
    [apiKey, photo, phase]
  );

  const handleSaveKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setKeyDialogOpen(false);
  };

  const handleGenerate = async () => {
    if (!apiKey || !photo) return;
    setPhase('generating');
    setErrorMsg(null);
    try {
      const blob = await generateImage({
        apiKey,
        prompt: buildPrompt(opciones),
        inputImageBase64: photo.base64,
      });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
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

  const handleResetPhoto = () => {
    setPhoto(null);
    setPhase('idle');
    setResultUrl(null);
    setErrorMsg(null);
  };

  const handleChangeOptions = () => {
    setPhase('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <ApiKeyDialog
        open={keyDialogOpen}
        onSave={handleSaveKey}
        onClose={apiKey ? () => setKeyDialogOpen(false) : undefined}
        initialKey={apiKey}
      />

      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <Wand2 className="size-6 text-primary" />
          <Button variant="ghost" size="sm" onClick={() => setKeyDialogOpen(true)}>
            <KeyRound className="size-4" /> API key
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Sacate una foto</CardTitle>
              <CardDescription>
                Mirá de frente a la cámara. Cuanto mejor se vea tu cara, mejor el resultado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoCapture
                hasPhoto={Boolean(photo)}
                previewUrl={photo?.dataUrl}
                onCapture={(p) => setPhoto(p)}
                onReset={handleResetPhoto}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Elegí la escena</CardTitle>
              <CardDescription>Ambiente, acción y estilo de la imagen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <OptionsForm
                value={opciones}
                onChange={setOpciones}
                disabled={phase === 'generating'}
              />

              <Button
                size="lg"
                className="w-full"
                disabled={!canGenerate}
                onClick={handleGenerate}
              >
                {phase === 'generating' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generando (puede tardar ~20s)…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generar imagen
                  </>
                )}
              </Button>

              {!photo && (
                <p className="text-xs text-muted-foreground">
                  Primero capturá una foto en el panel de la izquierda.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {(phase === 'done' || phase === 'error' || phase === 'generating') && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              {phase === 'error' && errorMsg && (
                <Alert variant="destructive">
                  <AlertTitle>Algo salió mal</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              {phase === 'generating' && (
                <div className="relative mx-auto aspect-square w-full max-w-[80dvh]">
                  <Skeleton className="absolute inset-0 h-full w-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-3 text-muted-foreground shadow-sm backdrop-blur-sm">
                      <Loader2 className="size-4 animate-spin" />
                      <p key={statusMsg} className="animate-in fade-in text-sm">
                        {statusMsg}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {phase === 'done' && resultUrl && (
                <ResultView
                  imageUrl={resultUrl}
                  onRegenerate={handleGenerate}
                  onChangeOptions={handleChangeOptions}
                  busy={false}
                />
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
