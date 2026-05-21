# Generador de Imágenes AI — Vos en el Campo

SPA frontend-only que toma una foto de tu cara, una elección de ambiente / acción / estilo, y genera una imagen tuya en una escena rural usando **fal.ai** con el modelo Flux Kontext (image-to-image con preservación de identidad).

## Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- fal.ai Queue API (`fal-ai/flux-pro/kontext` / `kontext/max`)

## Cómo correr

```bash
npm install
npm run dev
```

Abrí http://localhost:5173. La primera vez te pide tu API key de fal.ai — la conseguís en https://fal.ai/dashboard/keys. Se guarda solo en `localStorage`, nunca sale de tu navegador.

## Conseguir la API key

1. Creá cuenta en https://fal.ai
2. Agregá una tarjeta de crédito en **Billing** (no pre-pagás créditos: te facturan por uso real cada mes).
3. Generá una clave en https://fal.ai/dashboard/keys → "Add key".
4. Copiala (empieza con `fal_...`) y pegala en el dialog de la app.

## Modelo

Dev y prod usan el mismo modelo: `fal-ai/flux-pro/kontext/max` (~$0.08 / imagen). Así lo que ves iterando es lo mismo que vas a ver en producción.

## Costo

Pay-per-use directo en fal.ai. La app es BYOK: no hay backend, no se cobra desde nuestro lado.

## Limitaciones

- Las URLs de las imágenes generadas por fal.ai expiran después de un tiempo. La app descarga el resultado a un Blob inmediatamente, así podés verlo y descargarlo sin riesgo.
- Si el resultado se marca como NSFW por el filtro de fal, vas a ver un mensaje y podés probar con otra foto/opciones.
