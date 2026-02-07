import type { ExpenseEntry, RecurringExpense, OneTimeExpense, ExpenseCategory } from "@/types/budget"
import { isRecurringExpense, isOneTimeExpense } from "@/types/budget"
import { isMonthInRange } from "./utils"

/**
 * Check if a recurring expense entry is active in a given month
 */
export function isRecurringExpenseActiveInMonth(entry: RecurringExpense, month: string): boolean {
  return isMonthInRange(month, entry.startDate, entry.endDate)
}

/**
 * Check if an expense entry is active in a given month
 */
export function isExpenseActiveInMonth(entry: ExpenseEntry, month: string): boolean {
  if (isRecurringExpense(entry)) {
    return isRecurringExpenseActiveInMonth(entry, month)
  }
  // One-time expense is only active in its specific month
  return entry.month === month
}

/**
 * Get the amount for an expense entry in a given month
 */
export function getExpenseAmountForMonth(entry: ExpenseEntry, month: string): number {
  if (!isExpenseActiveInMonth(entry, month)) return 0
  if (isRecurringExpense(entry)) {
    return entry.monthlyOverrides?.[month] ?? entry.amount
  }
  return entry.amount
}

/**
 * Calculate total monthly expenses for a given month
 */
export function calculateMonthlyExpenses(entries: ExpenseEntry[], month: string): number {
  return entries.reduce((total, entry) => total + getExpenseAmountForMonth(entry, month), 0)
}

/**
 * Calculate recurring expenses for a given month
 */
export function calculateRecurringExpenses(entries: ExpenseEntry[], month: string): number {
  return entries
    .filter(isRecurringExpense)
    .filter((entry) => isRecurringExpenseActiveInMonth(entry, month))
    .reduce((total, entry) => total + entry.amount, 0)
}

/**
 * Calculate one-time expenses for a given month
 */
export function calculateOneTimeExpenses(entries: ExpenseEntry[], month: string): number {
  return entries
    .filter(isOneTimeExpense)
    .filter((entry) => entry.month === month)
    .reduce((total, entry) => total + entry.amount, 0)
}

/**
 * Get all recurring expense entries
 */
export function getRecurringExpenseEntries(entries: ExpenseEntry[]): RecurringExpense[] {
  return entries.filter(isRecurringExpense)
}

/**
 * Get all one-time expense entries
 */
export function getOneTimeExpenseEntries(entries: ExpenseEntry[]): OneTimeExpense[] {
  return entries.filter(isOneTimeExpense)
}

/**
 * Group expenses by category and calculate totals for a given month
 */
export function groupExpensesByCategory(
  entries: ExpenseEntry[],
  month: string
): Record<ExpenseCategory, number> {
  const grouped: Record<ExpenseCategory, number> = {
    housing: 0,
    transportation: 0,
    utilities: 0,
    food: 0,
    healthcare: 0,
    insurance: 0,
    entertainment: 0,
    personal: 0,
    debt: 0,
    family: 0,
    other: 0,
  }

  entries.forEach((entry) => {
    const amount = getExpenseAmountForMonth(entry, month)
    grouped[entry.category] += amount
  })

  return grouped
}

/**
 * Group recurring expenses by category
 */
export function groupRecurringExpensesByCategory(
  entries: ExpenseEntry[],
  month: string
): Record<ExpenseCategory, RecurringExpense[]> {
  const grouped: Record<ExpenseCategory, RecurringExpense[]> = {
    housing: [],
    transportation: [],
    utilities: [],
    food: [],
    healthcare: [],
    insurance: [],
    entertainment: [],
    personal: [],
    debt: [],
    family: [],
    other: [],
  }

  entries
    .filter(isRecurringExpense)
    .filter((entry) => isRecurringExpenseActiveInMonth(entry, month))
    .forEach((entry) => {
      grouped[entry.category].push(entry)
    })

  return grouped
}

/**
 * Get expenses for a full year, month by month
 */
export function getYearlyExpensesByMonth(
  entries: ExpenseEntry[],
  year: number
): Record<string, number> {
  const result: Record<string, number> = {}

  for (let month = 1; month <= 12; month++) {
    const monthStr = `${year}-${String(month).padStart(2, "0")}`
    result[monthStr] = calculateMonthlyExpenses(entries, monthStr)
  }

  return result
}

/**
 * Get top expense categories sorted by amount
 */
export function getTopExpenseCategories(
  entries: ExpenseEntry[],
  month: string,
  limit = 5
): Array<{ category: ExpenseCategory; amount: number }> {
  const grouped = groupExpensesByCategory(entries, month)

  return Object.entries(grouped)
    .map(([category, amount]) => ({ category: category as ExpenseCategory, amount }))
    .filter(({ amount }) => amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}
