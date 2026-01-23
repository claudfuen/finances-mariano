import { describe, it, expect } from "vitest"
import type { Investment } from "@/types/budget"
import {
  calculateMonthlyGrowth,
  projectInvestmentGrowth,
  yearsToReachTarget,
  getPortfolioBalanceAtMonth,
  calculatePortfolioSummary,
  getInvestmentYearlyProjections,
} from "@/lib/calculations/investments"

describe("calculateMonthlyGrowth", () => {
  it("applies monthly growth and contribution", () => {
    // $10,000 at 12% annual (1% monthly) + $100 contribution
    const result = calculateMonthlyGrowth(10000, 100, 0.12)
    expect(result).toBeCloseTo(10200, 0) // 10000 * 1.01 + 100
  })

  it("handles zero contribution", () => {
    const result = calculateMonthlyGrowth(10000, 0, 0.12)
    expect(result).toBeCloseTo(10100, 0)
  })

  it("handles zero balance", () => {
    const result = calculateMonthlyGrowth(0, 500, 0.07)
    expect(result).toBe(500)
  })

  it("handles zero return", () => {
    const result = calculateMonthlyGrowth(10000, 100, 0)
    expect(result).toBe(10100)
  })
})

describe("projectInvestmentGrowth", () => {
  const investment: Investment = {
    id: "test",
    name: "Test Fund",
    balance: 10000,
    monthlyContribution: 500,
    expectedReturn: 0.06,
  }

  it("generates correct number of projections", () => {
    const projections = projectInvestmentGrowth(investment, 12, "2025-01")
    expect(projections).toHaveLength(13) // 0 to 12 inclusive
  })

  it("starts with initial balance", () => {
    const projections = projectInvestmentGrowth(investment, 6, "2025-01")
    expect(projections[0].balance).toBe(10000)
    expect(projections[0].totalContributed).toBe(0)
    expect(projections[0].totalGains).toBe(0)
  })

  it("tracks contributions correctly", () => {
    const projections = projectInvestmentGrowth(investment, 3, "2025-01")
    expect(projections[3].totalContributed).toBe(1500) // 3 months * 500
  })

  it("increases balance over time", () => {
    const projections = projectInvestmentGrowth(investment, 12, "2025-01")
    expect(projections[12].balance).toBeGreaterThan(projections[0].balance + 6000)
  })

  it("uses correct month strings", () => {
    const projections = projectInvestmentGrowth(investment, 3, "2025-11")
    expect(projections[0].month).toBe("2025-11")
    expect(projections[1].month).toBe("2025-12")
    expect(projections[2].month).toBe("2026-01")
    expect(projections[3].month).toBe("2026-02")
  })
})

describe("yearsToReachTarget", () => {
  it("returns 0 when already at target", () => {
    expect(yearsToReachTarget(100000, 500, 0.07, 100000)).toBe(0)
  })

  it("returns 0 when above target", () => {
    expect(yearsToReachTarget(150000, 500, 0.07, 100000)).toBe(0)
  })

  it("calculates years to reach target", () => {
    const years = yearsToReachTarget(50000, 1000, 0.07, 100000)
    expect(years).toBeGreaterThanOrEqual(3)
    expect(years).toBeLessThan(6)
  })

  it("returns null when unreachable", () => {
    const result = yearsToReachTarget(0, 0, 0, 100000)
    expect(result).toBeNull()
  })

  it("handles zero return rate", () => {
    // $50k short, contributing $1k/month = 50 months = 4.2 years
    const years = yearsToReachTarget(50000, 1000, 0, 100000)
    expect(years).toBeCloseTo(4.2, 0)
  })
})

describe("getPortfolioBalanceAtMonth", () => {
  const investments: Investment[] = [
    { id: "1", name: "Fund A", balance: 10000, monthlyContribution: 500, expectedReturn: 0.06 },
    { id: "2", name: "Fund B", balance: 5000, monthlyContribution: 200, expectedReturn: 0.08 },
  ]

  it("returns current balance at month 0", () => {
    const balance = getPortfolioBalanceAtMonth(investments, 0)
    expect(balance).toBe(15000)
  })

  it("grows portfolio over time", () => {
    const balance = getPortfolioBalanceAtMonth(investments, 12)
    expect(balance).toBeGreaterThan(15000 + 12 * 700) // More than contributions alone
  })
})

describe("calculatePortfolioSummary", () => {
  const investments: Investment[] = [
    { id: "1", name: "Fund A", balance: 80000, monthlyContribution: 1000, expectedReturn: 0.06 },
    { id: "2", name: "Fund B", balance: 20000, monthlyContribution: 500, expectedReturn: 0.10 },
  ]

  it("calculates total value", () => {
    const summary = calculatePortfolioSummary(investments)
    expect(summary.totalValue).toBe(100000)
  })

  it("calculates total monthly contributions", () => {
    const summary = calculatePortfolioSummary(investments)
    expect(summary.totalMonthlyContributions).toBe(1500)
  })

  it("calculates weighted average return", () => {
    const summary = calculatePortfolioSummary(investments)
    // (80000 * 0.06 + 20000 * 0.10) / 100000 = 0.068
    expect(summary.weightedAverageReturn).toBeCloseTo(0.068, 3)
  })

  it("includes projections", () => {
    const summary = calculatePortfolioSummary(investments)
    expect(summary.projectedOneYear).toBeGreaterThan(100000)
    expect(summary.projectedFiveYear).toBeGreaterThan(summary.projectedOneYear)
    expect(summary.projectedTenYear).toBeGreaterThan(summary.projectedFiveYear)
  })

  it("handles empty portfolio", () => {
    const summary = calculatePortfolioSummary([])
    expect(summary.totalValue).toBe(0)
    expect(summary.weightedAverageReturn).toBe(0)
  })
})

describe("getInvestmentYearlyProjections", () => {
  const investment: Investment = {
    id: "test",
    name: "Test Fund",
    balance: 10000,
    monthlyContribution: 500,
    expectedReturn: 0.07,
  }

  it("returns projections for specified years", () => {
    const projections = getInvestmentYearlyProjections(investment, [1, 5, 10])
    expect(projections[1]).toBeDefined()
    expect(projections[5]).toBeDefined()
    expect(projections[10]).toBeDefined()
  })

  it("values increase with time", () => {
    const projections = getInvestmentYearlyProjections(investment, [1, 5, 10])
    expect(projections[5]).toBeGreaterThan(projections[1])
    expect(projections[10]).toBeGreaterThan(projections[5])
  })

  it("returns rounded values", () => {
    const projections = getInvestmentYearlyProjections(investment, [1])
    expect(Number.isInteger(projections[1])).toBe(true)
  })
})
