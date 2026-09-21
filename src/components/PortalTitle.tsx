export function PortalTitle({ className = '' }: { className?: string }) {
  return (
    <h1 className={`portal-title ${className}`} aria-label="Portal of Tides">
      <span className="portal-word" data-word="Portal">Portal</span>
      <span className="portal-title-small">of</span>
      <span className="portal-word" data-word="Tides">Tides</span>
    </h1>
  )
}
