import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { CapturePage } from '@/pages/CapturePage';
import { GeneratePage } from '@/pages/GeneratePage';
import { HomePage } from '@/pages/HomePage';
import { ImagePage } from '@/pages/ImagePage';
import type { Opciones } from '@/types';

const STORAGE_KEY = 'fal_api_key';

const DEFAULT_OPCIONES: Opciones = {
  ambiente: 'obelisco',
  accion: 'pelota',
  estilo: 'ghibli',
};

type Page = 'home' | 'capture' | 'generate';

/** Public watermarked-download page shown when a visitor opens the QR link
 *  on their phone. Sits outside the kiosk state machine entirely. */
const IMAGE_PATH = '/image';

export default function App() {
  if (typeof window !== 'undefined' && window.location.pathname === IMAGE_PATH) {
    return <ImagePage />;
  }

  return <KioskApp />;
}

function KioskApp() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [keyDialogOpen, setKeyDialogOpen] = useState<boolean>(false);

  const [photo, setPhoto] = useState<{ base64: string; dataUrl: string } | null>(null);
  const [opciones, setOpciones] = useState<Opciones>(DEFAULT_OPCIONES);
  const [page, setPage] = useState<Page>('home');

  const resetAndGoHome = () => {
    setPhoto(null);
    setOpciones(DEFAULT_OPCIONES);
    setPage('home');
  };

  const lastSecretTapRef = useRef<number>(0);

  useEffect(() => {
    if (!apiKey) setKeyDialogOpen(true);
  }, [apiKey]);

  const canGenerate = useMemo(() => Boolean(apiKey && photo), [apiKey, photo]);

  const handleSaveKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setKeyDialogOpen(false);
  };

  const handleSecretTap = () => {
    const now = Date.now();
    if (now - lastSecretTapRef.current < 600) {
      setKeyDialogOpen(true);
      lastSecretTapRef.current = 0;
    } else {
      lastSecretTapRef.current = now;
    }
  };

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-[url('/bg-game.png')] bg-cover bg-center bg-no-repeat">
      <ApiKeyDialog
        open={keyDialogOpen}
        onSave={handleSaveKey}
        onClose={apiKey ? () => setKeyDialogOpen(false) : undefined}
        initialKey={apiKey}
      />

      {/* Hidden hot-corner: double-tap the top-right corner to open the API key dialog. */}
      <button
        type="button"
        aria-label="Configuración"
        onClick={handleSecretTap}
        className="absolute right-0 top-0 z-10 size-24 cursor-default bg-transparent opacity-0"
      />

      {page === 'home' && <HomePage onStart={() => setPage('capture')} />}

      {page === 'capture' && (
        <CapturePage
          photo={photo}
          setPhoto={setPhoto}
          opciones={opciones}
          setOpciones={setOpciones}
          canGenerate={canGenerate}
          onGenerate={() => setPage('generate')}
        />
      )}

      {page === 'generate' && photo && (
        <GeneratePage
          apiKey={apiKey}
          photo={photo}
          opciones={opciones}
          onBack={() => setPage('capture')}
          onDone={resetAndGoHome}
        />
      )}
    </div>
  );
}
