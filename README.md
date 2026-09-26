# Editor de video de Nexora

Editor de reels verticales (1080x1920) hecho con [Remotion](https://www.remotion.dev/) (React + TypeScript) y un
pipeline de scripts (ffmpeg, Whisper, detección de cara). A partir de las tomas crudas de una grabación arma la pieza
terminada: montaje, recorte de silencios, subtítulos, cámara que sigue la cara, zooms, escenas de motion graphics,
b-rolls, SFX, música y master de audio.

La fuente de verdad del proyecto es **[CLAUDE.md](CLAUDE.md)**: pipeline, reglas que salieron de errores (§7) y las
notas de dirección creativa de Lucas (§8). Leelo antes de editar una pieza.

---

## 1. Qué necesitás instalado (Windows)

| Herramienta | Versión probada | Para qué |
|---|---|---|
| [Node.js](https://nodejs.org/) | 24 | Remotion y los scripts `.mjs` |
| [Python](https://www.python.org/) | 3.11 | Whisper, cara, recorte sin fondo |
| [ffmpeg](https://www.gyan.dev/ffmpeg/builds/) (full build) | 8.1 | todo el procesamiento de video y audio. Tiene que estar en el `PATH` |
| [Git](https://git-scm.com/) | — | clonar el repo |
| [Claude Code](https://claude.com/claude-code) | — | editar piezas con la skill `/formato-ganador` (recomendado) |

Chequeo rápido en una terminal: `node --version`, `python --version`, `ffmpeg -version`.

## 2. Clonar e instalar

```bash
git clone https://github.com/LucasEzequielSilva/nexora-video-editor.git
cd nexora-video-editor
npm install
pip install -r requirements.txt
```

## 3. Lo que no está en el repo (bajarlo del Drive)

Hay cosas que no entran en GitHub, por peso o porque son contenido comprado. Lucas te pasa un Drive con estas carpetas.
Copialas **tal cual, en la misma ruta**, dentro de la carpeta del repo:

| Carpeta | Qué es | ¿Obligatoria? |
|---|---|---|
| `PACKS/` | Recursos comprados: b-rolls, música, SFX, objetos 3D, íconos, fuentes. **No renombrar ni mover nada adentro**: `assets/biblioteca.json` los busca por ruta | Sí |
| `models/large-v3/` | Modelo de Whisper para transcribir (~3 GB) | Sí |
| `models/yunet/` | Detector de caras | Sí |
| `models/mediapipe/face_landmarker.task` | Iris y ojos, para saber si mira a cámara. Se baja con `curl -L -o models/mediapipe/face_landmarker.task https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task` | Sí |
| `public/recursos/` | Recursos ya copiados de `PACKS/` que usan las piezas existentes | Para abrir las piezas existentes |
| `public/piezas/<pieza>/*.mp4` | Videos de las piezas ya editadas | Para abrir las piezas existentes |
| `public/reserva/video/` | Video del sistema viejo `reserva` | No |

Los otros modelos se bajan solos la primera vez: Whisper `small` (para explorar tomas) y el de recorte sin fondo
(Robust Video Matting, por `torch.hub`).

## 4. Abrir el editor

```bash
npm start
```

Abre Remotion Studio en http://localhost:3000. En la carpeta **piezas** están las piezas (`estructura-nexora`,
`cuenta-juntos`, `empieza-a-romperse`) y en **piezas/escenas** las escenas de motion graphics sueltas para
previsualizar.

## 5. Hacer una pieza nueva

La forma recomendada: abrir Claude Code en la carpeta del repo y pedirle la pieza con la skill `/formato-ganador`,
pasándole la carpeta con las tomas crudas. La skill sigue el procedimiento de `formatos/ganador-talking-head/README.md`.

El pipeline, a mano (`<slug>` = nombre de la pieza en kebab-case):

1. **Explorar las tomas** del clip crudo:
   `node scripts/turno.mjs python scripts/explorar-tomas.py <clip.MOV> out/transcripciones/<clip>-explorar.json`
2. **Elegir tomas** con la herramienta de tomas: `npm run tomas -- <slug> --clips <carpeta con los crudos>` →
   http://localhost:3101. Muestra el clip, la transcripción por frases y **si en cada tramo mira a cámara o está
   leyendo** (tiene que estar arriba de 70 % a cámara). Agregás, ajustás y ordenás las tomas; se guardan en
   `cortes/<slug>.json`. La primera vez prepara el proxy, la transcripción y la mirada de cada clip (unos minutos).
3. **Montar y sacar silencios**:
   `node scripts/montar.mjs cortes/<slug>.json out/<slug>-bruto.mp4`, y después
   `node scripts/jumpcut.mjs out/<slug>-bruto.mp4 public/piezas/<slug>/video-jc.mp4 --uniones cortes/<slug>-uniones.json`
   (primero con `--dry`).
4. **Transcribir y corregir**:
   `node scripts/turno.mjs python scripts/transcribir.py public/piezas/<slug>/video-jc.mp4 public/piezas/<slug>/words.raw.json`,
   después `node scripts/corregir.mjs public/piezas/<slug>`. Leer la transcripción entera y corregir en el
   `correcciones.json` de la pieza.
5. **Recorte de trabas** (opcional, a mano): `npm run recortador -- <slug>` → http://localhost:3100.
6. **Generar el video final de la pieza**, en este orden:
   - `node scripts/recortar.mjs public/piezas/<slug>`: aplica los recortes, el negro del hook y los respiros;
   - `python scripts/cara.py public/piezas/<slug>`;
   - `node scripts/nivelar-voz.mjs public/piezas/<slug>`: empareja el volumen de la voz entre tomas.
7. **Armar `public/piezas/<slug>/props.json`** partiendo de `formatos/ganador-talking-head/props.template.json`, y
   registrar el slug en `PIEZAS` de `src/pieza/pieza-root.tsx`.
8. **Chequear**:
   - `node formatos/ganador-talking-head/chequeo-formato.mjs public/piezas/<slug>` tiene que dar 0 ✖;
   - `npm run verificar -- <slug>` tiene que salir sin ❌.
9. **Exportar**:
   - render: `node scripts/turno.mjs npx remotion render src/index.ts <slug> out/<slug>.mp4 --concurrency=1 --offthreadvideo-cache-size-in-bytes=300000000 --timeout=120000`;
   - master de audio: `node scripts/master.mjs out/<slug>.mp4 out/<slug>-master.mp4` (−14 LUFS). El master es el
     archivo que se publica.

## 6. Reglas que conviene saber desde el día uno

- Los trabajos pesados (Whisper, renders, recorte sin fondo) van **siempre** con `node scripts/turno.mjs <comando>`:
  corren de a uno para no ahogar la máquina.
- Todo en `props.json` se ancla a **palabras** de `words.json` (`{ "palabra": "día", "n": 2 }`), nunca a milisegundos
  sueltos. Así sobrevive a los recortes.
- Ningún texto en pantalla se inventa: sale de la transcripción.
- Antes de elegir un b-roll, SFX o tema musical, leer los catálogos de `assets/catalogo/` (qué es cada recurso, desde
  qué segundo sirve, qué evitar). No repetir b-rolls que ya salieron en piezas publicadas.
- Las notas de Lucas (§8 de CLAUDE.md) mandan sobre cualquier default.

## 7. Estructura

```
CLAUDE.md                  contrato del proyecto (pipeline, reglas, dirección creativa)
formatos/ganador-talking-head/   el formato replicable: README, plantilla de props, chequeo
.claude/skills/formato-ganador/  skill de Claude Code para hacer una pieza nueva
scripts/                   pipeline (montar, jumpcut, transcribir, recortar, cara, nivelar-voz, verificar, master...)
cortes/                    tomas elegidas y recortes de cada pieza
assets/                    biblioteca.json (catálogo de PACKS), catálogos legibles y referencias de estilo
public/piezas/<slug>/      datos de cada pieza (words.json, props.json, cara.json, correcciones.json)
src/pieza/                 la composición vertical: cámara, subtítulos, overlays, escenas, 3D
src/reserva/               sistema horizontal viejo (un solo video)
```
