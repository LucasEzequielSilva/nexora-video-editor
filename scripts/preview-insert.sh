#!/usr/bin/env bash
# Uso: scripts/preview-insert.sh <insert-id> <out-dir> [frame ...]
# Renderiza el insert aislado: hojas de contacto (cada 3 frames, numeradas) + stills a 1280px en los frames pedidos.
set -euo pipefail
ID="$1"; OUT="$2"; shift 2
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENTRY="src/reserva/previews/entries/$ID.tsx"
COMP="preview-$ID"
mkdir -p "$OUT"
rm -rf "$OUT/seq" && mkdir -p "$OUT/seq"
cd "$ROOT"
npx remotion render "$ENTRY" "$COMP" "$OUT/seq" --sequence --image-format=jpeg --scale=0.25 --concurrency=2 --timeout=120000 --log=error >/dev/null
N=$(ls "$OUT/seq" | wc -l)
i=0
for f in $(ls "$OUT/seq" | sort); do
  mv "$OUT/seq/$f" "$OUT/seq/frame-$(printf '%04d' "$i").jpeg"; i=$((i+1))
done
rm -f "$OUT"/sheet-*.jpg
ffmpeg -v error -y -framerate 30 -i "$OUT/seq/frame-%04d.jpeg" \
  -vf "drawtext=fontfile='C\:/Windows/Fonts/arialbd.ttf':text='%{eif\:n\:d}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.75,select='not(mod(n\,3))',tile=6x5:padding=4:color=black" \
  -fps_mode vfr "$OUT/sheet-%02d.jpg"
echo "frames=$N sheets=$(ls "$OUT"/sheet-*.jpg | wc -l) (cada celda = 3 frames; el número amarillo es el frame local)"
for fr in "$@"; do
  npx remotion still "$ENTRY" "$COMP" "$OUT/still-$fr.png" --frame="$fr" --concurrency=2 --timeout=120000 --log=error >/dev/null
  ffmpeg -v error -y -i "$OUT/still-$fr.png" -vf scale=1280:-1 -q:v 3 "$OUT/still-$fr.jpg" && rm "$OUT/still-$fr.png"
  echo "still $OUT/still-$fr.jpg"
done
