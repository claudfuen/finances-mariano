import { describe, it, expect } from "vitest"
import type { IncomeEntry, RecurringIncome, OneTimeIncome } from "@/types/budget"
import {
  normalizeToMonthly,
  isActiveInMonth,
  calculateMonthlyIncome,
  calculateRecurringIncome,
  calculateOneTimeIncome,
  groupIncomeBySource,
  getRecurringIncomeEntries,
  getOneTimeIncomeEntries,
} from "@/lib/calculations/income"

describe("normalizeToMonthly", () => {
  it("converts weekly to monthly", () => {
    const result = normalizeToMonthly(1000, "weekly")
    expect(result).toBeCloseTo(4333.33, 1)
  })

  it("converts biweekly to monthly", () => {
    const result = normalizeToMonthly(2000, "biweekly")
    expect(result).toBeCloseTo(4333.33, 1)
  })

  it("keeps monthly as is", () => {
    expect(normalizeToMonthly(5000, "monthly")).toBe(5000)
  })

  it("converts annual to monthly", () => {
    expect(normalizeToMonthly(60000, "annual")).toBe(5000)
  })
})

describe("isActiveInMonth", () => {
  const recurringEntry: RecurringIncome = {
    id: "1",
    name: "Test",
    source: "salary",
    amount: 5000,
    recurrence: "monthly",
  }

  const oneTimeEntry: OneTimeIncome = {
    id: "2",
    name: "Bonus",
    source: "salary",
    amount: 3000,
    month: "2025-06",
  }

  it("returns true for recurring with no date bounds", () => {
    expect(isActiveInMonth(recurringEntry, "2025-06")).toBe(true)
  })

  it("returns true for recurring within bounds", () => {
    const entry: RecurringIncome = { ...recurringEntry, startDate: "2025-01", endDate: "2025-12" }
    expect(isActiveInMonth(entry, "2025-06")).toBe(true)
  })

  it("returns false for recurring before start", () => {
    const entry: RecurringIncome = { ...recurringEntry, startDate: "2025-06" }
    expect(isActiveInMonth(entry, "2025-05")).toBe(false)
  })

  it("returns false for recurring after end", () => {
    const entry: RecurringIncome = { ...recurringEntry, endDate: "2025-06" }
    expect(isActiveInMonth(entry, "2025-07")).toBe(false)
  })

  it("returns true for one-time in correct month", () => {
    expect(isActiveInMonth(oneTimeEntry, "2025-06")).toBe(true)
  })

  it("returns false for one-time in wrong month", () => {
    expect(isActiveInMonth(oneTimeEntry, "2025-05")).toBe(false)
  })
})

describe("calculateMonthlyIncome", () => {
  const entries: IncomeEntry[] = [
    { id: "1", name: "Salary", source: "salary", amount: 5000, recurrence: "monthly" },
    { id: "2", name: "Freelance", source: "freelance", amount: 1000, recurrence: "monthly" },
    { id: "3", name: "Bonus", source: "other", amount: 2000, month: "2025-06" },
  ]

  it("calculates total income for month without one-time", () => {
    expect(calculateMonthlyIncome(entries, "2025-01")).toBe(6000)
  })

  it("includes one-time income in correct month", () => {
    expect(calculateMonthlyIncome(entries, "2025-06")).toBe(8000)
  })

  it("handles empty array", () => {
    expect(calculateMonthlyIncome([], "2025-01")).toBe(0)
  })
})

describe("calculateRecurringIncome", () => {
  const entries: IncomeEntry[] = [
    { id: "1", name: "Salary", source: "salary", amount: 5000, recurrence: "monthly" },
    { id: "2", name: "Bonus", source: "other", amount: 2000, month: "2025-06" },
  ]

  it("only includes recurring income", () => {
    expect(calculateRecurringIncome(entries, "2025-01")).toBe(5000)
    expect(calculateRecurringIncome(entries, "2025-06")).toBe(5000)
  })
})

describe("calculateOneTimeIncome", () => {
  const entries: IncomeEntry[] = [
    { id: "1", name: "Salary", source: "salary", amount: 5000, recurrence: "monthly" },
    { id: "2", name: "Bonus", source: "other", amount: 2000, month: "2025-06" },
  ]

  it("only includes one-time income in correct month", () => {
    expect(calculateOneTimeIncome(entries, "2025-01")).toBe(0)
    expect(calculateOneTimeIncome(entries, "2025-06")).toBe(2000)
  })
})

describe("groupIncomeBySource", () => {
  const entries: IncomeEntry[] = [
    { id: "1", name: "Job 1", source: "salary", amount: 5000, recurrence: "monthly" },
    { id: "2", name: "Job 2", source: "salary", amount: 3000, recurrence: "monthly" },
    { id: "3", name: "Consulting", source: "freelance", amount: 2000, recurrence: "monthly" },
    { id: "4", name: "Dividends", source: "investment", amount: 500, recurrence: "monthly" },
    { id: "5", name: "Bonus", source: "salary", amount: 1000, month: "2025-06" },
  ]

  it("groups income by source", () => {
    const grouped = groupIncomeBySource(entries, "2025-01")
    expect(grouped.salary).toBe(8000)
    expect(grouped.freelance).toBe(2000)
    expect(grouped.investment).toBe(500)
    expect(grouped.other).toBe(0)
  })

  it("includes one-time in correct month", () => {
    const grouped = groupIncomeBySource(entries, "2025-06")
    expect(grouped.salary).toBe(9000) // 8000 + 1000 bonus
  })
})

describe("getRecurringIncomeEntries", () => {
  const entries: IncomeEntry[] = [
    { id: "1", name: "Salary", source: "salary", amount: 5000, recurrence: "monthly" },
    { id: "2", name: "Bonus", source: "other", amount: 2000, month: "2025-06" },
  ]

  it("returns only recurring entries", () => {
    const recurring = getRecurringIncomeEntries(entries)
    expect(recurring).toHaveLength(1)
    expect(recurring[0].id).toBe("1")
  })
})

describe("getOneTimeIncomeEntries", () => {
  const entries: IncomeEntry[] = [
    { id: "1", name: "Salary", source: "salary", amount: 5000, recurrence: "monthly" },
    { id: "2", name: "Bonus", source: "other", amount: 2000, month: "2025-06" },
  ]

  it("returns only one-time entries", () => {
    const oneTime = getOneTimeIncomeEntries(entries)
    expect(oneTime).toHaveLength(1)
    expect(oneTime[0].id).toBe("2")
  })
})
