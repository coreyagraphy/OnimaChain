export interface StudyInputs {
  stockMassMg: number
  diluentMl: number
  mouseMassG: number
  targetDose: number
  doseUnit: 'mg/kg' | 'µg/kg'
  animals: number
  administrations: number
  handlingLossPercent: number
}

export interface StudyOutputs {
  concentrationMgMl: number
  dosePerAnimalMg: number
  volumePerAnimalUl: number
  totalSolutionMl: number
  totalCompoundMg: number
  volumeWithAllowanceMl: number
  compoundWithAllowanceMg: number
  stockSufficient: boolean
}

export interface ReconstitutionInputs {
  vialMassMg: number
  diluentMl: number
  amountPerDoseMcg: number
}

export interface ReconstitutionOutputs {
  concentrationMgMl: number
  concentrationMcgMl: number
  drawVolumeMl: number
  drawVolumeUl: number
  u100Mark: number
  fullDoses: number
  remainderMcg: number
  remainderMl: number
}

export const mgToMcg = (mg: number) => mg * 1000
export const mcgToMg = (mcg: number) => mcg / 1000
export const mlToUl = (ml: number) => ml * 1000
export const ulToMl = (ul: number) => ul / 1000

/**
 * Converts vial mass, final solution volume, and a user-supplied amount into
 * measurement outputs. U-100 marks are a volume conversion (100 marks/mL),
 * not international units of the compound.
 */
export function calculateReconstitution(input: ReconstitutionInputs): ReconstitutionOutputs | null {
  const values = [input.vialMassMg, input.diluentMl, input.amountPerDoseMcg]
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) return null

  const totalMcg = mgToMcg(input.vialMassMg)
  if (input.amountPerDoseMcg > totalMcg) return null

  const concentrationMgMl = input.vialMassMg / input.diluentMl
  const concentrationMcgMl = mgToMcg(concentrationMgMl)
  const drawVolumeMl = input.amountPerDoseMcg / concentrationMcgMl
  const drawVolumeUl = mlToUl(drawVolumeMl)
  const u100Mark = drawVolumeMl * 100
  const fullDoses = Math.floor((totalMcg + Number.EPSILON) / input.amountPerDoseMcg)
  const remainderMcg = Math.max(0, totalMcg - fullDoses * input.amountPerDoseMcg)
  const remainderMl = remainderMcg / concentrationMcgMl
  const outputs = [concentrationMgMl, concentrationMcgMl, drawVolumeMl, drawVolumeUl, u100Mark, fullDoses, remainderMcg, remainderMl]

  if (!outputs.every((value) => Number.isFinite(value) && value >= 0) || drawVolumeMl <= 0 || fullDoses < 1) return null
  return { concentrationMgMl, concentrationMcgMl, drawVolumeMl, drawVolumeUl, u100Mark, fullDoses, remainderMcg, remainderMl }
}

/** Six significant digits, with scientific notation instead of displaying a nonzero value as zero. */
export function formatStudyNumber(value: number): string {
  if (!Number.isFinite(value)) return 'Invalid value'
  if (value !== 0 && (Math.abs(value) < 0.000001 || Math.abs(value) >= 1e9)) return value.toExponential(5)
  return Number(value.toPrecision(6)).toLocaleString('en-US', { maximumFractionDigits: 12 })
}

export function calculateMouseStudy(input: StudyInputs): StudyOutputs | null {
  const values = [input.stockMassMg, input.diluentMl, input.mouseMassG, input.targetDose, input.animals, input.administrations, input.handlingLossPercent]
  if (values.some((value) => !Number.isFinite(value)) || values.slice(0, 6).some((value) => value <= 0) || input.handlingLossPercent < 0 || input.handlingLossPercent >= 100 || !Number.isInteger(input.animals) || !Number.isInteger(input.administrations) || !['mg/kg', 'µg/kg'].includes(input.doseUnit)) return null
  const concentrationMgMl = input.stockMassMg / input.diluentMl
  const dosePerAnimalMg = (input.mouseMassG / 1000) * (input.doseUnit === 'µg/kg' ? mcgToMg(input.targetDose) : input.targetDose)
  const volumePerAnimalUl = mlToUl(dosePerAnimalMg / concentrationMgMl)
  const totalSolutionMl = ulToMl(volumePerAnimalUl * input.animals * input.administrations)
  const totalCompoundMg = dosePerAnimalMg * input.animals * input.administrations
  const volumeWithAllowanceMl = totalSolutionMl / (1 - input.handlingLossPercent / 100)
  const compoundWithAllowanceMg = totalCompoundMg / (1 - input.handlingLossPercent / 100)
  if (![concentrationMgMl, dosePerAnimalMg, volumePerAnimalUl, totalSolutionMl, totalCompoundMg, volumeWithAllowanceMl, compoundWithAllowanceMg].every((value) => Number.isFinite(value) && value > 0)) return null
  return { concentrationMgMl, dosePerAnimalMg, volumePerAnimalUl, totalSolutionMl, totalCompoundMg, volumeWithAllowanceMl, compoundWithAllowanceMg, stockSufficient: volumeWithAllowanceMl <= input.diluentMl }
}
