/**
 * 2024/2025 Tax calculations for US (Florida - no state income tax)
 * Assumes married filing jointly
 */

// 2024 Federal Tax Brackets (Married Filing Jointly)
const FEDERAL_BRACKETS_MFJ = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
]

// FICA (Social Security + Medicare)
const SOCIAL_SECURITY_RATE = 0.062
const SOCIAL_SECURITY_WAGE_BASE = 168600 // 2024
const MEDICARE_RATE = 0.0145
const ADDITIONAL_MEDICARE_RATE = 0.009
const ADDITIONAL_MEDICARE_THRESHOLD_MFJ = 250000

// Standard deduction 2024
const STANDARD_DEDUCTION_MFJ = 29200

export interface TaxEstimate {
  grossAnnual: number
  federalTax: number
  socialSecurity: number
  medicare: number
  totalTax: number
  netAnnual: number
  netMonthly: number
  effectiveRate: number
}

/**
 * Calculate federal income tax using progressive brackets
 */
function calculateFederalTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0

  let tax = 0
  let remainingIncome = taxableIncome

  for (const bracket of FEDERAL_BRACKETS_MFJ) {
    if (remainingIncome <= 0) break

    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min)
    tax += taxableInBracket * bracket.rate
    remainingIncome -= taxableInBracket
  }

  return tax
}

/**
 * Calculate FICA taxes (Social Security + Medicare)
 */
function calculateFICA(grossIncome: number, householdIncome: number): { socialSecurity: number; medicare: number } {
  // Social Security (capped at wage base)
  const socialSecurity = Math.min(grossIncome, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE

  // Medicare (no cap, plus additional 0.9% over threshold)
  let medicare = grossIncome * MEDICARE_RATE
  if (householdIncome > ADDITIONAL_MEDICARE_THRESHOLD_MFJ) {
    // Additional Medicare applies to amount over threshold
    const additionalMedicareBase = Math.max(0, grossIncome - Math.max(0, ADDITIONAL_MEDICARE_THRESHOLD_MFJ - (householdIncome - grossIncome)))
    medicare += additionalMedicareBase * ADDITIONAL_MEDICARE_RATE
  }

  return { socialSecurity, medicare }
}

/**
 * Estimate take-home pay for a single income earner
 * Assumes married filing jointly, Florida (no state tax), standard deduction
 */
export function estimateTakeHome(
  grossAnnual: number,
  householdGrossAnnual: number,
  preRetirementContributions = 0 // 401k, HSA, etc.
): TaxEstimate {
  // Taxable income after standard deduction and pre-tax contributions
  // Note: We split the standard deduction proportionally between earners
  const incomeShare = grossAnnual / householdGrossAnnual
  const deductionShare = STANDARD_DEDUCTION_MFJ * incomeShare
  const taxableIncome = Math.max(0, grossAnnual - preRetirementContributions - deductionShare)

  // Federal tax (proportional share based on marginal contribution)
  // Simplified: calculate household tax and split by income share
  const householdTaxableIncome = Math.max(0, householdGrossAnnual - STANDARD_DEDUCTION_MFJ)
  const householdFederalTax = calculateFederalTax(householdTaxableIncome)
  const federalTax = householdFederalTax * incomeShare

  // FICA (calculated individually per earner)
  const { socialSecurity, medicare } = calculateFICA(grossAnnual, householdGrossAnnual)

  const totalTax = federalTax + socialSecurity + medicare
  const netAnnual = grossAnnual - totalTax - preRetirementContributions
  const netMonthly = netAnnual / 12

  return {
    grossAnnual,
    federalTax: Math.round(federalTax),
    socialSecurity: Math.round(socialSecurity),
    medicare: Math.round(medicare),
    totalTax: Math.round(totalTax),
    netAnnual: Math.round(netAnnual),
    netMonthly: Math.round(netMonthly),
    effectiveRate: totalTax / grossAnnual,
  }
}

/**
 * Calculate take-home for a household with two earners
 */
export function calculateHouseholdTakeHome(
  earner1Gross: number,
  earner2Gross: number,
  earner1PreTax = 0,
  earner2PreTax = 0
): {
  earner1: TaxEstimate
  earner2: TaxEstimate
  household: {
    grossAnnual: number
    totalTax: number
    netAnnual: number
    netMonthly: number
    effectiveRate: number
  }
} {
  const householdGross = earner1Gross + earner2Gross

  const earner1 = estimateTakeHome(earner1Gross, householdGross, earner1PreTax)
  const earner2 = estimateTakeHome(earner2Gross, householdGross, earner2PreTax)

  return {
    earner1,
    earner2,
    household: {
      grossAnnual: householdGross,
      totalTax: earner1.totalTax + earner2.totalTax,
      netAnnual: earner1.netAnnual + earner2.netAnnual,
      netMonthly: earner1.netMonthly + earner2.netMonthly,
      effectiveRate: (earner1.totalTax + earner2.totalTax) / householdGross,
    },
  }
}
