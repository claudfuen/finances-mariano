import { describe, it, expect } from "vitest"
import type { ExpenseEntry, RecurringExpense, OneTimeExpense } from "@/types/budget"
import {
  isExpenseActiveInMonth,
  calculateMonthlyExpenses,
  calculateRecurringExpenses,
  calculateOneTimeExpenses,
  groupExpensesByCategory,
  getRecurringExpenseEntries,
  getOneTimeExpenseEntries,
  getTopExpenseCategories,
} from "@/lib/calculations/expenses"

describe("isExpenseActiveInMonth", () => {
  const recurringExpense: RecurringExpense = {
    id: "1",
    name: "Rent",
    category: "housing",
    amount: 2000,
  }

  const oneTimeExpense: OneTimeExpense = {
    id: "2",
    name: "Car Repair",
    category: "transportation",
    amount: 1000,
    month: "2025-03",
  }

  it("returns true for recurring with no date bounds", () => {
    expect(isExpenseActiveInMonth(recurringExpense, "2025-06")).toBe(true)
  })

  it("returns true for recurring within bounds", () => {
    const expense: RecurringExpense = { ...recurringExpense, startDate: "2025-01", endDate: "2025-12" }
    expect(isExpenseActiveInMonth(expense, "2025-06")).toBe(true)
  })

  it("returns false for recurring before start", () => {
    const expense: RecurringExpense = { ...recurringExpense, startDate: "2025-06" }
    expect(isExpenseActiveInMonth(expense, "2025-05")).toBe(false)
  })

  it("returns true for one-time in correct month", () => {
    expect(isExpenseActiveInMonth(oneTimeExpense, "2025-03")).toBe(true)
  })

  it("returns false for one-time in wrong month", () => {
    expect(isExpenseActiveInMonth(oneTimeExpense, "2025-04")).toBe(false)
  })
})

describe("calculateMonthlyExpenses", () => {
  const expenses: ExpenseEntry[] = [
    { id: "1", name: "Rent", category: "housing", amount: 2000 },
    { id: "2", name: "Utilities", category: "utilities", amount: 150 },
    { id: "3", name: "Car Repair", category: "transportation", amount: 500, month: "2025-06" },
  ]

  it("calculates total expenses without one-time", () => {
    expect(calculateMonthlyExpenses(expenses, "2025-01")).toBe(2150)
  })

  it("includes one-time in correct month", () => {
    expect(calculateMonthlyExpenses(expenses, "2025-06")).toBe(2650)
  })

  it("handles empty array", () => {
    expect(calculateMonthlyExpenses([], "2025-01")).toBe(0)
  })
})

describe("calculateRecurringExpenses", () => {
  const expenses: ExpenseEntry[] = [
    { id: "1", name: "Rent", category: "housing", amount: 2000 },
    { id: "2", name: "Car Repair", category: "transportation", amount: 500, month: "2025-06" },
  ]

  it("only includes recurring expenses", () => {
    expect(calculateRecurringExpenses(expenses, "2025-01")).toBe(2000)
    expect(calculateRecurringExpenses(expenses, "2025-06")).toBe(2000)
  })
})

describe("calculateOneTimeExpenses", () => {
  const expenses: ExpenseEntry[] = [
    { id: "1", name: "Rent", category: "housing", amount: 2000 },
    { id: "2", name: "Car Repair", category: "transportation", amount: 500, month: "2025-06" },
  ]

  it("only includes one-time in correct month", () => {
    expect(calculateOneTimeExpenses(expenses, "2025-01")).toBe(0)
    expect(calculateOneTimeExpenses(expenses, "2025-06")).toBe(500)
  })
})

describe("groupExpensesByCategory", () => {
  const expenses: ExpenseEntry[] = [
    { id: "1", name: "Mortgage", category: "housing", amount: 2000 },
    { id: "2", name: "HOA", category: "housing", amount: 200 },
    { id: "3", name: "Electric", category: "utilities", amount: 150 },
    { id: "4", name: "Groceries", category: "food", amount: 800 },
    { id: "5", name: "Car Repair", category: "transportation", amount: 500, month: "2025-03" },
  ]

  it("groups expenses by category", () => {
    const grouped = groupExpensesByCategory(expenses, "2025-01")
    expect(grouped.housing).toBe(2200)
    expect(grouped.utilities).toBe(150)
    expect(grouped.food).toBe(800)
    expect(grouped.transportation).toBe(0) // one-time not in this month
  })

  it("includes one-time in correct month", () => {
    const grouped = groupExpensesByCategory(expenses, "2025-03")
    expect(grouped.transportation).toBe(500)
  })

  it("returns zeros for all categories when empty", () => {
    const grouped = groupExpensesByCategory([], "2025-01")
    expect(grouped.housing).toBe(0)
    expect(grouped.utilities).toBe(0)
  })
})

describe("getRecurringExpenseEntries", () => {
  const expenses: ExpenseEntry[] = [
    { id: "1", name: "Rent", category: "housing", amount: 2000 },
    { id: "2", name: "Car Repair", category: "transportation", amount: 500, month: "2025-06" },
  ]

  it("returns only recurring entries", () => {
    const recurring = getRecurringExpenseEntries(expenses)
    expect(recurring).toHaveLength(1)
    expect(recurring[0].id).toBe("1")
  })
})

describe("getOneTimeExpenseEntries", () => {
  const expenses: ExpenseEntry[] = [
    { id: "1", name: "Rent", category: "housing", amount: 2000 },
    { id: "2", name: "Car Repair", category: "transportation", amount: 500, month: "2025-06" },
  ]

  it("returns only one-time entries", () => {
    const oneTime = getOneTimeExpenseEntries(expenses)
    expect(oneTime).toHaveLength(1)
    expect(oneTime[0].id).toBe("2")
  })
})

describe("getTopExpenseCategories", () => {
  const expenses: ExpenseEntry[] = [
    { id: "1", name: "Rent", category: "housing", amount: 2000 },
    { id: "2", name: "Car", category: "transportation", amount: 500 },
    { id: "3", name: "Food", category: "food", amount: 800 },
    { id: "4", name: "Health", category: "healthcare", amount: 300 },
    { id: "5", name: "Fun", category: "entertainment", amount: 200 },
  ]

  it("returns top categories sorted by amount", () => {
    const top = getTopExpenseCategories(expenses, "2025-01", 3)
    expect(top).toHaveLength(3)
    expect(top[0].category).toBe("housing")
    expect(top[0].amount).toBe(2000)
    expect(top[1].category).toBe("food")
    expect(top[2].category).toBe("transportation")
  })

  it("respects limit parameter", () => {
    const top = getTopExpenseCategories(expenses, "2025-01", 2)
    expect(top).toHaveLength(2)
  })

  it("excludes zero categories", () => {
    const singleExpense: ExpenseEntry[] = [{ id: "1", name: "Rent", category: "housing", amount: 2000 }]
    const top = getTopExpenseCategories(singleExpense, "2025-01", 5)
    expect(top).toHaveLength(1)
  })
})
