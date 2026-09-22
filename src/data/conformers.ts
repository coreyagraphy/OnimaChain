/** Delta-encoded C-alpha coordinates at 0.01 Å precision, sourced from the named deposited model. */
export interface DepositedConformer { count: number; source: string; data: string }

export const DEPOSITED_CONFORMERS: Record<string, DepositedConformer> = {
  semaglutide: { count: 30, source: 'RCSB PDB 7KI0 chain P', data: 'tS3iMGY6gP4RAA4Av/+B/goA5wDF/y4Bcf8qAb0Amf6R/8X/WACb/mAAowB0AEMByv7RAFUACv/d/sX/+gAS/6sAGADiADUBhf4xAAQAxP+I/uT/AQGt/xABX//7APEAn/59/7b/fQCZ/jQAqwBbAEsBuf6lAGAANP/M/rf/5gAZ/8AArf/TADgBjf7x/6P/CACB/uz/ngD//1sB4v7XAI0AD/8E/13/nADv/tkA6QCF/+z+' },
  tirzepatide: { count: 29, source: 'RCSB PDB 7FIM chain P', data: 'wTyeQLlHhv4IAEwAuP+U/nUAJAHw//4Af/9GAZQAnv50//7/cgCv/oYAvwCbACIB5v7VAI0A4P4R/7X/sADs/sEALwD9ABoBlv50AOL/Tf+8/lcAGQGd/+wAdf8DAfIApP5v/8b/gwCq/mYAsACrACUBs/6LAHoAVv+v/sP/BwFV/9cAw/8NAQYBiv62//H/SQCL/hUA4AA6AC4B+f7XAK0AD//c/tz/6wAF/6IA' },
  retatrutide: { count: 30, source: 'RCSB PDB 8YW5 chain P', data: 'wjQ2Osk+vf49/7f/RgCa/nMAPAEhAM8AY//5AO8Aqv5Y/xQAjgCp/lUA0ACdABQB0P66AIcAIf/O/uP/BgEt/7MAIQD0ACIBhv4WACUA5P9//gYAEwHz/wUBSP/wAOcAw/4y/9b/0ADS/mYAgACtADsBnP50AFkAf/+Y/t7/IgF8/88AmP/WACoBmf6S/8T/dACX/iEAtABaAEQByf6jAJQA9P4B/6L/5//D/jP/TAFz/3MA' },
  'follistatin-344': { count: 344, source: 'AlphaFold DB P19883 model v6', data: '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' },
}

export function decodeConformer(slug: string): Float32Array | null {
  const record = DEPOSITED_CONFORMERS[slug]
  if (!record) return null
  const binary = globalThis.atob(record.data)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const deltas = new Int16Array(bytes.buffer)
  const coordinates = new Float32Array(record.count * 3)
  const current = [0, 0, 0]
  for (let i = 0; i < coordinates.length; i++) {
    const axis = i % 3
    current[axis] += deltas[i]
    coordinates[i] = current[axis] / 100
  }
  return coordinates
}
