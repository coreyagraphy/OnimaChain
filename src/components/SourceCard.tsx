import { EMPTY_PLATFORM } from '~/data/signal'

/** Social/video/forum source card. With no platform access, only the empty state exists. */
export function SourceCard({ platform }: { platform: string }) {
  return (
    <div className="panel p-4 border-dashed">
      <p className="label label-violet">{platform}</p>
      <p className="text-sm text-bone/80 mt-1">{EMPTY_PLATFORM}</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mono text-bone/45">
        <dt>Posted</dt><dd>—</dd>
        <dt>Collected</dt><dd>—</dd>
        <dt>First-hand or hearsay</dt><dd>—</dd>
        <dt>Original or copy</dt><dd>—</dd>
      </dl>
    </div>
  )
}
