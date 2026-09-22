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
  stockSufficient: boolean
}

export function calculateMouseStudy(input: StudyInputs): StudyOutputs | null {
  const values = [input.stockMassMg, input.diluentMl, input.mouseMassG, input.targetDose, input.animals, input.administrations, input.handlingLossPercent]
  if (values.some((value) => !Number.isFinite(value)) || values.slice(0, 6).some((value) => value <= 0) || input.handlingLossPercent < 0 || input.handlingLossPercent >= 100 || !Number.isInteger(input.animals) || !Number.isInteger(input.administrations)) return null
  const concentrationMgMl = input.stockMassMg / input.diluentMl
  const dosePerAnimalMg = (input.mouseMassG / 1000) * (input.doseUnit === 'µg/kg' ? input.targetDose / 1000 : input.targetDose)
  const volumePerAnimalUl = dosePerAnimalMg / concentrationMgMl * 1000
  const totalSolutionMl = volumePerAnimalUl * input.animals * input.administrations / 1000
  const totalCompoundMg = dosePerAnimalMg * input.animals * input.administrations
  const volumeWithAllowanceMl = totalSolutionMl / (1 - input.handlingLossPercent / 100)
  return { concentrationMgMl, dosePerAnimalMg, volumePerAnimalUl, totalSolutionMl, totalCompoundMg, volumeWithAllowanceMl, stockSufficient: volumeWithAllowanceMl <= input.diluentMl }
}
