import { useEffect, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Tunable watermark parameters. Change these to adjust position, size, or
 * intensity of the BNA logo overlay without touching compose logic below.
 */
const WATERMARK = {
  widthPct: 0.22, // logo width = 22% of image width
  marginPct: 0.03, // margin from the bottom-right edges
  padInsidePct: 0.5, // padding inside the pill, as a multiplier of logo height
  pillColor: 'hsla(200, 100%, 28.8%, 0.45)', // --primary @ 45% (matches index.css)
  logoOpacity: 0.85,
  logoSrc: '/logo-bna.png',
} as const;

function loadImage(src: string, crossOrigin?: 'anonymous'): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No pude cargar la imagen: ${src}`));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function composeWatermarked(falUrl: string): Promise<HTMLCanvasElement> {
  const [photo, logo] = await Promise.all([
    loadImage(falUrl, 'anonymous'),
    loadImage(WATERMARK.logoSrc),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = photo.naturalWidth;
  canvas.height = photo.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No pude inicializar el canvas.');

  // 1) Base photo
  ctx.drawImage(photo, 0, 0);

  // 2) Pill background
  const W = canvas.width;
  const H = canvas.height;
  const wmW = W * WATERMARK.widthPct;
  const wmH = wmW * (logo.naturalHeight / logo.naturalWidth);
  const padIn = wmH * WATERMARK.padInsidePct;
  const pillW = wmW + padIn * 2;
  const pillH = wmH + padIn * 2;
  const margin = W * WATERMARK.marginPct;
  const x = W - pillW - margin;
  const y = H - pillH - margin;

  ctx.fillStyle = WATERMARK.pillColor;
  roundRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fill();

  // 3) White logo on top
  ctx.globalAlpha = WATERMARK.logoOpacity;
  ctx.drawImage(logo, x + padIn, y + padIn, wmW, wmH);
  ctx.globalAlpha = 1;

  return canvas;
}

async function descargarCanvas(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95),
  );
  if (!blob) throw new Error('No pude generar el archivo para descargar.');

  const filename = `mundial-argentina-${Date.now()}.jpg`;
  const file = new File([blob], filename, { type: 'image/jpeg' });

  // iOS Safari: Web Share API opens the native share sheet → "Guardar en Fotos".
  // Android / desktop: fallback to <a download>.
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files: File[]; title?: string }) => Promise<void>;
  };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: 'Mi imagen Mundial' });
      return;
    } catch {
      // User cancelled the share sheet — fall through to direct download.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ImagePage() {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const u = new URLSearchParams(window.location.search).get('u');
    if (!u) {
      setErrorMsg('No se especificó la imagen.');
      return;
    }

    composeWatermarked(u)
      .then((canvas) => {
        canvasRef.current = canvas;
        setPreviewSrc(canvas.toDataURL('image/jpeg', 0.92));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setErrorMsg(msg);
      });
  }, []);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      await descargarCanvas(canvasRef.current);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No pude descargar la imagen.';
      setErrorMsg(msg);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-dvw flex-col items-center gap-4 p-4">
      {errorMsg && (
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>No pudimos preparar la imagen</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {!errorMsg && !previewSrc && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <p className="text-base">Preparando tu imagen…</p>
          </div>
        </div>
      )}

      {previewSrc && (
        <>
          <img
            src={previewSrc}
            alt="Tu imagen Mundial"
            className="max-h-[80dvh] w-auto max-w-full rounded-lg border bg-muted object-contain shadow-sm"
          />
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="h-14 w-full max-w-md text-xl [&_svg]:size-6"
          >
            {downloading ? (
              <>
                <Loader2 className="animate-spin" />
                Preparando descarga…
              </>
            ) : (
              <>
                <Download />
                Descargar
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            En iPhone, tocá <strong>Compartir</strong> → <strong>Guardar en Fotos</strong>.
          </p>
        </>
      )}
    </div>
  );
}
