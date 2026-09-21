/** Suspense fallback for lazy 3D scenes: a minimal molecular fragment resolving. Not a spinner. */
export function SceneLoader() {
  return (
    <div className="frag-loader" aria-hidden>
      <svg viewBox="0 0 120 60">
        <path d="M10 40 C 30 10, 50 50, 70 22 S 105 34, 112 18" />
        {[10, 40, 70, 90, 112].map((x, i) => (
          <circle key={x} cx={x} cy={[40, 22, 22, 30, 18][i]} r={i % 2 ? 3.5 : 5} style={{ animationDelay: `${i * 0.14}s` }} />
        ))}
      </svg>
    </div>
  )
}
