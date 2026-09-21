import generated from './videos.generated.json'

/*
 * Per-peptide video intros (5–10 s). Written by `node tools/encode-videos.mjs` from files dropped into media/raw/.
 * A slug with no entry renders the "coming soon" placeholder. Nothing here is hand-edited.
 *
 * Spec Corey shoots to: 4:5 portrait, 1080×1350, 24–30 fps, 5–10 s, no audio needed (it autoplays muted).
 */
export interface PeptideVideo {
  /** 1080×1350 H.264 MP4 (desktop / high-density screens). */
  src1080: string
  /** 720×900 H.264 MP4 (phones). */
  src720: string
  /** First-frame JPG shown before playback and for reduced-motion visitors. */
  poster: string
  /** Seconds, rounded. */
  duration: number
}

export const VIDEO_ASPECT = '4 / 5'
const VIDEOS = generated as Record<string, PeptideVideo>

export function videoFor(slug: string): PeptideVideo | null {
  return VIDEOS[slug] ?? null
}
