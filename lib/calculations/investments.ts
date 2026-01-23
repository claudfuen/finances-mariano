import type { Investment, InvestmentProjection, PortfolioSummary } from "@/types/budget"
import { addMonths } from "./utils"

/**
 * Calculate one month of investment growth with contribution
 * Uses monthly compounding formula
 */
export function calculateMonthlyGrowth(
  balance: number,
  contribution: number,
  annualReturn: number
): number {
  const monthlyReturn = annualReturn / 12
  // Apply growth to existing balance, then add contribution
  return balance * (1 + monthlyReturn) + contribution
}

/**
 * Project investment growth over a number of months
 */
export function projectInvestmentGrowth(
  investment: Investment,
  months: number,
  startMonth: string
): InvestmentProjection[] {
  const projections: InvestmentProjection[] = []
  let balance = investment.balance
  let totalContributed = 0

  for (let i = 0; i <= months; i++) {
    const month = addMonths(startMonth, i)

    projections.push({
      month,
      investmentId: investment.id,
      balance: Math.round(balance * 100) / 100,
      totalContributed,
      totalGains: Math.round((balance - investment.balance - totalContributed) * 100) / 100,
    })

    if (i < months) {
      balance = calculateMonthlyGrowth(balance, investment.monthlyContribution, investment.expectedReturn)
      totalContributed += investment.monthlyContribution
    }
  }

  return projections
}

/**
 * Calculate portfolio projection for all investments
 */
export function calculatePortfolioProjection(
  investments: Investment[],
  months: number,
  startMonth: string
): Map<string, InvestmentProjection[]> {
  const projections = new Map<string, InvestmentProjection[]>()

  investments.forEach((investment) => {
    projections.set(investment.id, projectInvestmentGrowth(investment, months, startMonth))
  })

  return projections
}

/**
 * Calculate years needed to reach a target balance
 * Returns null if target is unreachable (negative returns outpace contributions)
 */
export function yearsToReachTarget(
  currentBalance: number,
  monthlyContribution: number,
  annualReturn: number,
  targetBalance: number,
  maxYears = 100
): number | null {
  if (currentBalance >= targetBalance) return 0

  let balance = currentBalance
  const monthlyReturn = annualReturn / 12

  for (let months = 1; months <= maxYears * 12; months++) {
    balance = balance * (1 + monthlyReturn) + monthlyContribution
    if (balance >= targetBalance) {
      return Math.round((months / 12) * 10) / 10
    }
  }

  return null
}

/**
 * Get portfolio balance at a specific month in the future
 */
export function getPortfolioBalanceAtMonth(
  investments: Investment[],
  monthsFromNow: number
): number {
  return investments.reduce((total, investment) => {
    let balance = investment.balance
    for (let i = 0; i < monthsFromNow; i++) {
      balance = calculateMonthlyGrowth(balance, investment.monthlyContribution, investment.expectedReturn)
    }
    return total + balance
  }, 0)
}

/**
 * Calculate portfolio summary with projections
 */
export function calculatePortfolioSummary(investments: Investment[]): PortfolioSummary {
  const totalValue = investments.reduce((sum, inv) => sum + inv.balance, 0)
  const totalMonthlyContributions = investments.reduce((sum, inv) => sum + inv.monthlyContribution, 0)

  // Weighted average return
  const weightedAverageReturn =
    totalValue > 0
      ? investments.reduce((sum, inv) => sum + inv.balance * inv.expectedReturn, 0) / totalValue
      : 0

  return {
    totalValue,
    totalMonthlyContributions,
    weightedAverageReturn,
    projectedOneYear: Math.round(getPortfolioBalanceAtMonth(investments, 12)),
    projectedFiveYear: Math.round(getPortfolioBalanceAtMonth(investments, 60)),
    projectedTenYear: Math.round(getPortfolioBalanceAtMonth(investments, 120)),
  }
}

/**
 * Get investment projections at specific year milestones
 */
export function getInvestmentYearlyProjections(
  investment: Investment,
  years: number[]
): Record<number, number> {
  const result: Record<number, number> = {}

  years.forEach((year) => {
    let balance = investment.balance
    for (let month = 0; month < year * 12; month++) {
      balance = calculateMonthlyGrowth(balance, investment.monthlyContribution, investment.expectedReturn)
    }
    result[year] = Math.round(balance)
  })

  return result
}
