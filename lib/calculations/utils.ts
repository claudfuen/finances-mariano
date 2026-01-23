/**
 * Add months to a YYYY-MM string
 */
export function addMonths(month: string, count: number): string {
  const [year, m] = month.split("-").map(Number)
  const date = new Date(year, m - 1 + count, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

/**
 * Calculate months between two YYYY-MM strings
 */
export function calculateMonthsBetween(start: string, end: string): number {
  const [startYear, startMonth] = start.split("-").map(Number)
  const [endYear, endMonth] = end.split("-").map(Number)
  return (endYear - startYear) * 12 + (endMonth - startMonth)
}

/**
 * Generate array of months from start to end (inclusive)
 */
export function generateMonthRange(start: string, end: string): string[] {
  const months: string[] = []
  const totalMonths = calculateMonthsBetween(start, end)

  for (let i = 0; i <= totalMonths; i++) {
    months.push(addMonths(start, i))
  }

  return months
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a decimal as percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Get current month as YYYY-MM string
 */
export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

/**
 * Compare two YYYY-MM strings
 * Returns negative if a < b, 0 if equal, positive if a > b
 */
export function compareMonths(a: string, b: string): number {
  return calculateMonthsBetween(b, a)
}

/**
 * Check if a month is within a range (inclusive)
 */
export function isMonthInRange(month: string, start?: string, end?: string): boolean {
  if (start && compareMonths(month, start) < 0) return false
  if (end && compareMonths(month, end) > 0) return false
  return true
}
