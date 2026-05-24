// Cliente para fal.ai (Flux Kontext Multi: face photo + jersey reference).
//
// Usamos el endpoint `kontext/max/multi` que acepta varias imágenes de
// referencia, así pasamos foto-de-cara + referencia-de-camiseta y el modelo
// copia el patrón de rayas sin alucinar logos.
// Costo similar al single-image (~$0.08 / imagen).

const APP_NAMESPACE = 'fal-ai/flux-pro';
const MODEL_PATH = 'kontext/max/multi';
const JERSEY_REFERENCE_URL = '/jersey-arg.png';

const SUBMIT_URL = `https://queue.fal.run/${APP_NAMESPACE}/${MODEL_PATH}`;
const REQUESTS_BASE = `https://queue.fal.run/${APP_NAMESPACE}/requests`;

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 120_000;

export const FLUX_MODEL = `${APP_NAMESPACE}/${MODEL_PATH}`;

export class FluxError extends Error {
  constructor(message: string, public readonly status?: string) {
    super(message);
    this.name = 'FluxError';
  }
}

interface SubmitResponse {
  request_id: string;
  status_url?: string;
  response_url?: string;
}

type FalStatus = 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

interface StatusResponse {
  status: FalStatus;
  queue_position?: number;
  logs?: unknown[];
}

interface ResultImage {
  url: string;
  width?: number;
  height?: number;
  content_type?: string;
}

interface ResultResponse {
  images?: ResultImage[];
  has_nsfw_concepts?: boolean[];
  detail?: string;
  error?: string;
}

interface GenerateArgs {
  apiKey: string;
  prompt: string;
  /** Base64-encoded JPEG/PNG, no `data:` prefix. */
  inputImageBase64: string;
  signal?: AbortSignal;
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Key ${apiKey}`,
    Accept: 'application/json',
  };
}

export interface GenerateResult {
  /** JPEG bytes — used for the in-page <img> preview via createObjectURL. */
  blob: Blob;
  /** Public fal.media URL — encode this into the phone-scannable QR. */
  url: string;
}

// Cache the jersey reference data URL across generations — same file every time,
// no point re-fetching/re-encoding it.
let jerseyDataUrlPromise: Promise<string> | null = null;

function getJerseyDataUrl(): Promise<string> {
  if (!jerseyDataUrlPromise) {
    jerseyDataUrlPromise = (async () => {
      const resp = await fetch(JERSEY_REFERENCE_URL);
      if (!resp.ok) {
        throw new FluxError(
          `No pude cargar la referencia de la camiseta (${resp.status}) — verificá public/jersey-arg.png.`,
        );
      }
      const blob = await resp.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('No pude leer la imagen de referencia.'));
        reader.readAsDataURL(blob);
      });
    })();
  }
  return jerseyDataUrlPromise;
}

export async function generateImage({
  apiKey,
  prompt,
  inputImageBase64,
  signal,
}: GenerateArgs): Promise<GenerateResult> {
  const jerseyDataUrl = await getJerseyDataUrl();

  const submit = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: {
      ...authHeaders(apiKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_urls: [`data:image/jpeg;base64,${inputImageBase64}`, jerseyDataUrl],
      output_format: 'jpeg',
      safety_tolerance: '2',
      aspect_ratio: '9:16',
    }),
    signal,
  });

  if (!submit.ok) {
    const text = await submit.text().catch(() => '');
    if (submit.status === 401 || submit.status === 403) {
      throw new FluxError('API key inválida o sin permisos. Revisá tu clave en fal.ai/dashboard/keys.');
    }
    throw new FluxError(
      `Falló el envío a fal.ai (${submit.status}): ${text || submit.statusText}`
    );
  }

  const { request_id } = (await submit.json()) as SubmitResponse;
  if (!request_id) {
    throw new FluxError('Respuesta inesperada de fal.ai: falta request_id.');
  }

  await waitUntilDone(request_id, apiKey, signal);

  const resultUrl = await fetchResultSampleUrl(request_id, apiKey, signal);

  const imgResp = await fetch(resultUrl, { signal });
  if (!imgResp.ok) {
    throw new FluxError(`No pude descargar la imagen generada (${imgResp.status}).`);
  }
  const blob = await imgResp.blob();
  return { blob, url: resultUrl };
}

async function waitUntilDone(
  requestId: string,
  apiKey: string,
  signal: AbortSignal | undefined
): Promise<void> {
  const statusUrl = `${REQUESTS_BASE}/${requestId}/status`;
  const start = Date.now();

  while (Date.now() - start < POLL_TIMEOUT_MS) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const resp = await fetch(statusUrl, { headers: authHeaders(apiKey), signal });
    if (!resp.ok) {
      throw new FluxError(`Polling de estado falló (${resp.status}): ${resp.statusText}`);
    }
    const body = (await resp.json()) as StatusResponse;

    switch (body.status) {
      case 'COMPLETED':
        return;
      case 'FAILED':
        throw new FluxError('fal.ai reportó FAILED al generar la imagen.', body.status);
      case 'IN_QUEUE':
      case 'IN_PROGRESS':
      default:
        await sleep(POLL_INTERVAL_MS, signal);
        break;
    }
  }

  throw new FluxError('Timeout esperando la imagen (más de 120s).');
}

async function fetchResultSampleUrl(
  requestId: string,
  apiKey: string,
  signal: AbortSignal | undefined
): Promise<string> {
  const resp = await fetch(`${REQUESTS_BASE}/${requestId}`, {
    headers: authHeaders(apiKey),
    signal,
  });
  if (!resp.ok) {
    throw new FluxError(`No pude leer el resultado (${resp.status}): ${resp.statusText}`);
  }
  const body = (await resp.json()) as ResultResponse;

  if (body.has_nsfw_concepts?.some(Boolean)) {
    throw new FluxError('La imagen fue marcada como NSFW por el filtro. Probá con otra foto u opciones.');
  }
  const first = body.images?.[0]?.url;
  if (!first) {
    throw new FluxError(
      body.error || body.detail || 'Resultado sin imagen — probá de nuevo.'
    );
  }
  return first;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort);
  });
}
