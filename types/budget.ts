// Income types
export type Recurrence = "weekly" | "biweekly" | "monthly" | "annual"
export type IncomeSource = "salary" | "freelance" | "investment" | "other"

export interface RecurringIncome {
  id: string
  name: string
  source: IncomeSource
  amount: number
  recurrence: Recurrence
  startDate?: string // YYYY-MM format
  endDate?: string // YYYY-MM format
}

export interface OneTimeIncome {
  id: string
  name: string
  source: IncomeSource
  amount: number
  month: string // YYYY-MM format - when this income occurs
}

export type IncomeEntry = RecurringIncome | OneTimeIncome

export function isRecurringIncome(entry: IncomeEntry): entry is RecurringIncome {
  return "recurrence" in entry
}

export function isOneTimeIncome(entry: IncomeEntry): entry is OneTimeIncome {
  return "month" in entry && !("recurrence" in entry)
}

// Expense types
export type ExpenseCategory =
  | "housing"
  | "transportation"
  | "utilities"
  | "food"
  | "healthcare"
  | "insurance"
  | "entertainment"
  | "personal"
  | "debt"
  | "other"

export interface RecurringExpense {
  id: string
  name: string
  category: ExpenseCategory
  amount: number
  startDate?: string // YYYY-MM format
  endDate?: string // YYYY-MM format
}

export interface OneTimeExpense {
  id: string
  name: string
  category: ExpenseCategory
  amount: number
  month: string // YYYY-MM format - when this expense occurs
}

export type ExpenseEntry = RecurringExpense | OneTimeExpense

export function isRecurringExpense(entry: ExpenseEntry): entry is RecurringExpense {
  return !("month" in entry)
}

export function isOneTimeExpense(entry: ExpenseEntry): entry is OneTimeExpense {
  return "month" in entry
}

// Investment types
export interface Investment {
  id: string
  name: string
  balance: number
  monthlyContribution: number
  expectedReturn: number // Annual percentage as decimal (e.g., 0.07 for 7%)
}

// Savings goal types
export type GoalCategory = "emergency" | "vacation" | "purchase" | "retirement" | "education" | "other"

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string // YYYY-MM format
  category: GoalCategory
  monthlyContribution?: number
}

// Budget configuration (aggregate type)
export interface BudgetConfig {
  income: IncomeEntry[]
  expenses: ExpenseEntry[]
  investments: Investment[]
  savingsGoals: SavingsGoal[]
  settings: {
    year: number
    currency: string
  }
}

// P&L Row types for the table
export interface PLRow {
  id: string
  name: string
  isGroup: boolean
  isSubtotal: boolean
  depth: number // 0 = top level, 1 = category, 2 = line item
  values: Record<string, number> // month -> amount, e.g. "2025-01" -> 8500
  ytd: number
}

export interface PLSection {
  title: string
  rows: PLRow[]
  total: PLRow
}

export interface PLData {
  year: number
  months: string[] // ["2025-01", "2025-02", ...]
  income: {
    recurring: PLSection
    oneTime: PLSection
    total: PLRow
  }
  expenses: {
    recurring: PLSection
    oneTime: PLSection
    total: PLRow
  }
  netCashFlow: PLRow
  allocations: {
    investments: PLSection
    savingsGoals: PLSection
    total: PLRow
  }
  unallocated: PLRow
}

// Computed types
export interface MonthlySnapshot {
  month: string // YYYY-MM format
  totalIncome: number
  recurringIncome: number
  oneTimeIncome: number
  totalExpenses: number
  recurringExpenses: number
  oneTimeExpenses: number
  netCashFlow: number
  savingsRate: number // Percentage as decimal
  incomeBySource: Record<IncomeSource, number>
  expensesByCategory: Record<ExpenseCategory, number>
}

export interface InvestmentProjection {
  month: string // YYYY-MM format
  investmentId: string
  balance: number
  totalContributed: number
  totalGains: number
}

export interface SavingsGoalProgress {
  goalId: string
  currentAmount: number
  targetAmount: number
  progressPercentage: number
  monthsRemaining: number
  requiredMonthly: number
  isOnTrack: boolean
  projectedCompletionDate: string | null // YYYY-MM format or null if unreachable
}

// Portfolio-level types
export interface PortfolioSummary {
  totalValue: number
  totalMonthlyContributions: number
  weightedAverageReturn: number
  projectedOneYear: number
  projectedFiveYear: number
  projectedTenYear: number
}

// UI State
export interface CollapsedState {
  [rowId: string]: boolean
}
