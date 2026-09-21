// Turns raw intro clips into web-ready files and switches on each product's video.
//   1. Drop a clip into media/raw/ named by the product slug, e.g. media/raw/bpc-157.mp4 (or .mov / .webm / .mkv).
//   2. Run: node tools/encode-videos.mjs
// Output per clip in public/videos/: <slug>-1080.mp4 (1080x1350), <slug>-720.mp4 (720x900), <slug>.jpg (poster).
// Any aspect ratio is accepted; it is centre-cropped to 4:5. Audio is dropped (the site autoplays muted).
// Clips longer than 10 s are trimmed to 10 s. Requires ffmpeg (C:\ffmpeg\bin\ffmpeg.exe on Corey's PC, or on PATH).
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

const FF = existsSync('C:/ffmpeg/bin/ffmpeg.exe') ? 'C:/ffmpeg/bin/ffmpeg.exe' : 'ffmpeg'
const FP = existsSync('C:/ffmpeg/bin/ffprobe.exe') ? 'C:/ffmpeg/bin/ffprobe.exe' : 'ffprobe'
const RAW = 'media/raw', OUT = 'public/videos', MANIFEST = 'src/data/videos.generated.json'
const slugs = new Set([...readFileSync('src/data/compounds.ts', 'utf8').matchAll(/^\s+slug: '([^']+)'/gm)].map((m) => m[1]))
mkdirSync(OUT, { recursive: true })
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
const crop = (w, h) => `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},fps=30,format=yuv420p`
let done = 0
for (const file of readdirSync(RAW).filter((f) => /\.(mp4|mov|webm|mkv|m4v)$/i.test(f))) {
  const slug = basename(file, extname(file)).toLowerCase()
  if (!slugs.has(slug)) { console.warn(`skip ${file}: "${slug}" is not a product slug`); continue }
  const src = join(RAW, file)
  const dur = Math.min(10, Number(execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).toString().trim()) || 10)
  for (const [w, h, crf] of [[1080, 1350, 23], [720, 900, 25]]) {
    execFileSync(FF, ['-loglevel', 'error', '-y', '-i', src, '-t', String(dur), '-an', '-vf', crop(w, h), '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf), '-maxrate', w === 1080 ? '4M' : '2M', '-bufsize', '8M', '-movflags', '+faststart', join(OUT, `${slug}-${h === 1350 ? 1080 : 720}.mp4`)])
  }
  execFileSync(FF, ['-loglevel', 'error', '-y', '-i', src, '-frames:v', '1', '-vf', crop(1080, 1350), '-q:v', '4', join(OUT, `${slug}.jpg`)])
  manifest[slug] = { src1080: `/videos/${slug}-1080.mp4`, src720: `/videos/${slug}-720.mp4`, poster: `/videos/${slug}.jpg`, duration: Math.round(dur) }
  console.log(`ok ${slug} (${Math.round(dur)} s)`)
  done++
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`${done} clip(s) encoded · ${Object.keys(manifest).length} product(s) now have a video`)
