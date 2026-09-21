import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { VIDEO_ASPECT, videoFor } from '~/data/videos'
import { environmentFor } from '~/data/environments'

interface Props { slug: string; name: string; className?: string }

/**
 * Short intro video for one peptide (4:5). Autoplays muted and loops only while on screen.
 * Reduced-motion visitors see the poster and a play button instead of autoplay.
 * With no video yet, renders a designed "coming soon" frame in the peptide's own environment colours.
 */
export function PeptideVideo({ slug, name, className = '' }: Props) {
  const v = videoFor(slug)
  const env = environmentFor(slug)
  const box = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const [reduced, setReduced] = useState(false)
  const [playing, setPlaying] = useState(false)
  useEffect(() => { setReduced(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false) }, [])
  useEffect(() => {
    const el = box.current, video = vid.current
    if (!el || !video || reduced) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      else { video.pause(); setPlaying(false) }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, v])
  const style = { aspectRatio: VIDEO_ASPECT, '--env': env.neon, '--env-2': env.support, '--env-deep': env.deep } as CSSProperties

  if (!v) {
    return (
      <div ref={box} className={`peptide-video peptide-video-empty ${className}`} style={style} role="img" aria-label={`${name} video intro, coming soon`}>
        <span className="pv-orb" aria-hidden />
        <span className="pv-orb pv-orb-2" aria-hidden />
        <div className="relative z-[2] mt-auto p-6">
          <span className="pv-play" aria-hidden><svg width="18" height="18" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6z" fill="currentColor" /></svg></span>
          <p className="label mt-4" style={{ color: env.neon }}>Video intro</p>
          <p className="display-md text-2xl mt-1">{name} in ten seconds.</p>
          <p className="text-sm text-bone/65 mt-1">Coming soon.</p>
        </div>
      </div>
    )
  }
  return (
    <div ref={box} className={`peptide-video ${className}`} style={style}>
      <video
        ref={vid}
        className="absolute inset-0 w-full h-full object-cover"
        poster={v.poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${name} video intro, ${v.duration} seconds, no sound`}
      >
        <source src={v.src720} type="video/mp4" media="(max-width: 767px)" />
        <source src={v.src1080} type="video/mp4" />
      </video>
      {reduced && !playing && (
        <button className="pv-play pv-play-btn" onClick={() => { vid.current?.play(); setPlaying(true) }} aria-label={`Play ${name} intro`}>
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M6 4l10 6-10 6z" fill="currentColor" /></svg>
        </button>
      )}
    </div>
  )
}
