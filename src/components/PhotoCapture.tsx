import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotoCaptureProps {
  /** Receives base64 (no data: prefix) and a data URL for preview. */
  onCapture: (args: { base64: string; dataUrl: string }) => void;
  hasPhoto: boolean;
  previewUrl?: string;
  onReset: () => void;
}

export function PhotoCapture({ onCapture, hasPhoto, previewUrl, onReset }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasPhoto) return;
    let stream: MediaStream | null = null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setStreaming(true);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'No pudimos acceder a la cámara.';
        setError(msg);
        setStreaming(false);
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      setStreaming(false);
    };
  }, [hasPhoto]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    let cropW: number;
    let cropH: number;
    if (w / h > 3 / 4) {
      cropH = h;
      cropW = h * (3 / 4);
    } else {
      cropW = w;
      cropH = w * (4 / 3);
    }
    const sx = (w - cropW) / 2;
    const sy = (h - cropH) / 2;

    const outW = 1080;
    const outH = 1440;
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, outW, outH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64 = dataUrl.split(',')[1] ?? '';
    onCapture({ base64, dataUrl });
  };

  if (hasPhoto && previewUrl) {
    return (
      <div className="flex h-full flex-col gap-3">
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="aspect-[3/4] h-full max-h-full w-auto max-w-full overflow-hidden rounded-lg border bg-muted">
            <img src={previewUrl} alt="Foto capturada" className="h-full w-full object-cover" />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onReset}
          className="h-16 w-full text-2xl [&_svg]:size-7"
        >
          <RefreshCw /> Volver a tomar la foto
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="aspect-[3/4] h-full max-h-full w-auto max-w-full overflow-hidden rounded-lg border bg-muted">
          {error ? (
            <div className="flex h-full items-center justify-center p-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover [transform:scaleX(-1)]"
            />
          )}
        </div>
      </div>

      <Button
        onClick={capture}
        disabled={!streaming}
        className="h-16 w-full text-2xl [&_svg]:size-7"
      >
        <Camera /> Capturar foto
      </Button>
    </div>
  );
}
