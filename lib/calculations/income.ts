import type { IncomeEntry, RecurringIncome, OneTimeIncome, IncomeSource } from "@/types/budget"
import { isRecurringIncome, isOneTimeIncome } from "@/types/budget"
import { isMonthInRange } from "./utils"

/**
 * Convert any recurrence to monthly amount
 */
export function normalizeToMonthly(amount: number, recurrence: RecurringIncome["recurrence"]): number {
  switch (recurrence) {
    case "weekly":
      return (amount * 52) / 12
    case "biweekly":
      return (amount * 26) / 12
    case "monthly":
      return amount
    case "annual":
      return amount / 12
  }
}

/**
 * Check if a recurring income entry is active in a given month
 */
export function isRecurringActiveInMonth(entry: RecurringIncome, month: string): boolean {
  return isMonthInRange(month, entry.startDate, entry.endDate)
}

/**
 * Check if an income entry is active in a given month
 */
export function isActiveInMonth(entry: IncomeEntry, month: string): boolean {
  if (isRecurringIncome(entry)) {
    return isRecurringActiveInMonth(entry, month)
  }
  // One-time income is only active in its specific month
  return entry.month === month
}

/**
 * Get the amount for an income entry in a given month
 */
export function getIncomeAmountForMonth(entry: IncomeEntry, month: string): number {
  if (!isActiveInMonth(entry, month)) return 0

  if (isRecurringIncome(entry)) {
    return normalizeToMonthly(entry.amount, entry.recurrence)
  }
  return entry.amount
}

/**
 * Calculate total monthly income for a given month
 */
export function calculateMonthlyIncome(entries: IncomeEntry[], month: string): number {
  return entries.reduce((total, entry) => total + getIncomeAmountForMonth(entry, month), 0)
}

/**
 * Calculate recurring income for a given month
 */
export function calculateRecurringIncome(entries: IncomeEntry[], month: string): number {
  return entries
    .filter(isRecurringIncome)
    .filter((entry) => isRecurringActiveInMonth(entry, month))
    .reduce((total, entry) => total + normalizeToMonthly(entry.amount, entry.recurrence), 0)
}

/**
 * Calculate one-time income for a given month
 */
export function calculateOneTimeIncome(entries: IncomeEntry[], month: string): number {
  return entries
    .filter(isOneTimeIncome)
    .filter((entry) => entry.month === month)
    .reduce((total, entry) => total + entry.amount, 0)
}

/**
 * Get all recurring income entries
 */
export function getRecurringIncomeEntries(entries: IncomeEntry[]): RecurringIncome[] {
  return entries.filter(isRecurringIncome)
}

/**
 * Get all one-time income entries
 */
export function getOneTimeIncomeEntries(entries: IncomeEntry[]): OneTimeIncome[] {
  return entries.filter(isOneTimeIncome)
}

/**
 * Group income by source and calculate totals for a given month
 */
export function groupIncomeBySource(
  entries: IncomeEntry[],
  month: string
): Record<IncomeSource, number> {
  const grouped: Record<IncomeSource, number> = {
    salary: 0,
    freelance: 0,
    investment: 0,
    other: 0,
  }

  entries.forEach((entry) => {
    const amount = getIncomeAmountForMonth(entry, month)
    grouped[entry.source] += amount
  })

  return grouped
}

/**
 * Get income for a full year, month by month
 */
export function getYearlyIncomeByMonth(
  entries: IncomeEntry[],
  year: number
): Record<string, number> {
  const result: Record<string, number> = {}

  for (let month = 1; month <= 12; month++) {
    const monthStr = `${year}-${String(month).padStart(2, "0")}`
    result[monthStr] = calculateMonthlyIncome(entries, monthStr)
  }

  return result
}
