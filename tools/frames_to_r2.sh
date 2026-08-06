#!/bin/bash
#
# Schneidet den Scrollfilm in Bilder, wandelt sie in AVIF und legt sie in R2.
#
# Warum nicht mehr im Repo: 450 Bilder × 3 Zuschnitte + die Telefonfenster sind
# rund 2.000 Dateien. GitHub Pages hat daran aufgegeben – aus sechs Minuten
# Bauzeit wurden zwanzig, dann Fehlschläge. Die Seite selbst bleibt auf Pages,
# nur die schweren Sachen liegen jetzt in R2 hinter dem Worker `yby-film`
# (server/film-worker im App-Repo).
#
#   ./tools/frames_to_r2.sh <arbeitsordner>
#
# Braucht: ffmpeg mit libsvtav1, npx wrangler mit Cloudflare-Login.
set -euo pipefail

WORK="${1:?Arbeitsordner angeben}"
CH1="${CH1:-$HOME/Desktop/yby-cliff-film/the-cliff_4k_master.mp4}"
CH2="${CH2:-$HOME/Desktop/Video.mov}"
WORKER_DIR="${WORKER_DIR:-$HOME/Developer/Young by You 2.0/server/film-worker}"
BUCKET=yby-film

# 12 Bilder je Sekunde – dieselbe Dichte in beiden Kapiteln, damit die Kamera
# über den ganzen Scrollweg gleich schnell bleibt.
FPS=12
FILM_CRF=30   # 1600×900: 137 KB JPEG → 65 KB AVIF, Abweichung 1,5 von 255
UI_CRF=26     # die Telefonfenster tragen kleine Schrift – knapper schneiden

# Der Hochkant-Zuschnitt trägt in Kapitel 1 den Schwenk der FOCUS-Tabelle aus
# neu/index.html eingebacken (nachgemessen: Mittenschnitt weicht um 24 ab, die
# Schwenk-Variante um 3). Wer Kapitel 1 neu schneidet, muss ihn mitschneiden.
# In Kapitel 2 steht die Kamera mittig: crop=1080:2160:1380:0.

mkdir -p "$WORK"/{jpg,avif}

echo "── Bilder aus den Mastern ─────────────────────────────"
mkdir -p "$WORK"/jpg/{l,s,p}
ffmpeg -v error -y -i "$CH1" -vf "fps=$FPS,scale=1600:900:flags=lanczos"  -q:v 2 "$WORK/jpg/l/f_%03d.jpg"
ffmpeg -v error -y -i "$CH1" -vf "fps=$FPS,scale=960:540:flags=lanczos"   -q:v 3 "$WORK/jpg/s/f_%03d.jpg"
# (Hochkant Kapitel 1: siehe Hinweis oben – hier bewusst nicht automatisiert.)

echo "── AVIF ───────────────────────────────────────────────"
for tier in l s p; do
  mkdir -p "$WORK/avif/f/$tier"
  for f in "$WORK/jpg/$tier"/f_*.jpg; do
    out="$WORK/avif/f/$tier/$(basename "${f%.jpg}").avif"
    [ -s "$out" ] && continue
    ffmpeg -v error -y -i "$f" -c:v libsvtav1 -preset 6 -crf "$FILM_CRF" \
           -pix_fmt yuv420p -f avif "$out"
  done
done

echo "── nach R2 ────────────────────────────────────────────"
cd "$WORKER_DIR"
put() {
  local f="$1" root="$2" key ct
  key="${f#$root/}"
  case "$f" in *.avif) ct=image/avif;; *.jpg) ct=image/jpeg;; *) return 0;; esac
  for try in 1 2 3; do
    npx wrangler r2 object put "$BUCKET/$key" --file="$f" --content-type="$ct" --remote \
      >/dev/null 2>&1 && { echo "ok $key"; return 0; }
    sleep $((try * 2))
  done
  echo "FAIL $key"
}
export -f put; export BUCKET
find "$WORK/avif" -type f \( -name '*.avif' -o -name '*.jpg' \) \
  | xargs -P 12 -I{} bash -c 'put "$@"' _ {} "$WORK/avif"

echo "fertig. Prüfen:"
echo "  curl -sI https://yby-film.yby-circle-worker.workers.dev/f/l/f_001.avif | head -3"
