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
          video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } },
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
    const size = Math.min(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, (w - size) / 2, (h - size) / 2, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64 = dataUrl.split(',')[1] ?? '';
    onCapture({ base64, dataUrl });
  };

  if (hasPhoto && previewUrl) {
    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border bg-muted">
          <img src={previewUrl} alt="Foto capturada" className="aspect-square w-full object-cover" />
        </div>
        <Button variant="outline" onClick={onReset} className="w-full">
          <RefreshCw className="size-4" /> Volver a tomar la foto
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted">
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

      <Button onClick={capture} disabled={!streaming} className="w-full">
        <Camera className="size-4" /> Capturar foto
      </Button>
    </div>
  );
}
