import type {
  BudgetConfig,
  PLData,
  PLRow,
  ExpenseCategory,
  RecurringExpense,
} from "@/types/budget"
import { isRecurringIncome, isOneTimeIncome, isRecurringExpense, isOneTimeExpense } from "@/types/budget"
import { normalizeToMonthly, isRecurringActiveInMonth } from "./income"
import { isRecurringExpenseActiveInMonth } from "./expenses"

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: "Housing",
  transportation: "Transportation",
  utilities: "Utilities",
  food: "Food",
  healthcare: "Healthcare",
  insurance: "Insurance",
  entertainment: "Entertainment",
  personal: "Personal",
  debt: "Debt",
  other: "Other",
}

/**
 * Generate array of month strings for a year
 */
function generateMonthsForYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`)
}

/**
 * Create a PLRow with values for each month
 */
function createRow(
  id: string,
  name: string,
  depth: number,
  months: string[],
  getValueForMonth: (month: string) => number,
  options: { isGroup?: boolean; isSubtotal?: boolean } = {}
): PLRow {
  const values: Record<string, number> = {}
  let ytd = 0

  months.forEach((month) => {
    const value = getValueForMonth(month)
    values[month] = value
    ytd += value
  })

  return {
    id,
    name,
    isGroup: options.isGroup ?? false,
    isSubtotal: options.isSubtotal ?? false,
    depth,
    values,
    ytd,
  }
}

/**
 * Sum multiple PLRows into a single row
 */
function sumRows(
  id: string,
  name: string,
  depth: number,
  rows: PLRow[],
  options: { isSubtotal?: boolean } = {},
  months?: string[]
): PLRow {
  const values: Record<string, number> = {}
  let ytd = 0

  if (rows.length > 0) {
    Object.keys(rows[0].values).forEach((month) => {
      values[month] = rows.reduce((sum, row) => sum + (row.values[month] || 0), 0)
    })
    ytd = rows.reduce((sum, row) => sum + row.ytd, 0)
  } else if (months) {
    // Initialize with zeros for empty rows
    months.forEach((month) => {
      values[month] = 0
    })
  }

  return {
    id,
    name,
    isGroup: false,
    isSubtotal: options.isSubtotal ?? false,
    depth,
    values,
    ytd,
  }
}

/**
 * Generate the full P&L data structure from budget config
 */
export function generatePLData(config: BudgetConfig): PLData {
  const { year } = config.settings
  const months = generateMonthsForYear(year)

  // === INCOME ===
  const recurringIncomeRows: PLRow[] = config.income
    .filter(isRecurringIncome)
    .map((entry) =>
      createRow(entry.id, entry.name, 2, months, (month) =>
        isRecurringActiveInMonth(entry, month) ? normalizeToMonthly(entry.amount, entry.recurrence) : 0
      )
    )

  const recurringIncomeTotal = sumRows("income-recurring-total", "Subtotal Recurring", 1, recurringIncomeRows, {
    isSubtotal: true,
  })

  const oneTimeIncomeRows: PLRow[] = config.income
    .filter(isOneTimeIncome)
    .map((entry) =>
      createRow(entry.id, entry.name, 2, months, (month) => (entry.month === month ? entry.amount : 0))
    )

  const oneTimeIncomeTotal = sumRows("income-onetime-total", "Subtotal One-Time", 1, oneTimeIncomeRows, {
    isSubtotal: true,
  })

  const totalIncomeRow = sumRows("income-total", "TOTAL INCOME", 0, [recurringIncomeTotal, oneTimeIncomeTotal])

  // === EXPENSES ===
  // Group recurring expenses by category
  const recurringExpenses = config.expenses.filter(isRecurringExpense)
  const oneTimeExpenses = config.expenses.filter(isOneTimeExpense)

  const expensesByCategory = new Map<ExpenseCategory, RecurringExpense[]>()
  recurringExpenses.forEach((expense) => {
    const list = expensesByCategory.get(expense.category) || []
    list.push(expense)
    expensesByCategory.set(expense.category, list)
  })

  const recurringExpenseRows: PLRow[] = []

  // Add category groups and their items
  const categories = Object.keys(CATEGORY_LABELS) as ExpenseCategory[]
  categories.forEach((category) => {
    const categoryExpenses = expensesByCategory.get(category) || []
    if (categoryExpenses.length === 0) return

    // Add line items for this category
    const itemRows = categoryExpenses.map((expense) =>
      createRow(expense.id, expense.name, 2, months, (month) => {
        if (!isRecurringExpenseActiveInMonth(expense, month)) return 0
        // Use monthly override if available, otherwise default amount
        return expense.monthlyOverrides?.[month] ?? expense.amount
      })
    )

    // Add category group row (collapsible)
    const categoryTotal = sumRows(`expense-${category}`, CATEGORY_LABELS[category], 1, itemRows, { isSubtotal: false })
    const categoryGroupRow: PLRow = {
      ...categoryTotal,
      isGroup: true,
    }

    recurringExpenseRows.push(categoryGroupRow)
    recurringExpenseRows.push(...itemRows)
  })

  // Calculate recurring subtotal from category totals only
  const categoryTotalRows = recurringExpenseRows.filter((row) => row.isGroup)
  const recurringExpenseTotal = sumRows("expense-recurring-total", "Subtotal Recurring", 1, categoryTotalRows, {
    isSubtotal: true,
  })

  // One-time expenses
  const oneTimeExpenseRows: PLRow[] = oneTimeExpenses.map((expense) =>
    createRow(expense.id, expense.name, 2, months, (month) => (expense.month === month ? expense.amount : 0))
  )

  const oneTimeExpenseTotal = sumRows("expense-onetime-total", "Subtotal One-Time", 1, oneTimeExpenseRows, {
    isSubtotal: true,
  })

  const totalExpenseRow = sumRows("expense-total", "TOTAL EXPENSES", 0, [recurringExpenseTotal, oneTimeExpenseTotal])

  // === NET CASH FLOW ===
  const netCashFlowRow = createRow("net-cash-flow", "NET CASH FLOW", 0, months, (month) => {
    return (totalIncomeRow.values[month] || 0) - (totalExpenseRow.values[month] || 0)
  })

  // === ALLOCATIONS ===
  const investmentRows: PLRow[] = config.investments.map((inv) =>
    createRow(inv.id, inv.name, 2, months, () => inv.monthlyContribution)
  )
  const investmentTotal = sumRows(
    "allocation-investments-total",
    "Total Investments",
    1,
    investmentRows,
    { isSubtotal: true },
    months
  )

  const savingsGoalRows: PLRow[] = config.savingsGoals
    .filter((goal) => goal.monthlyContribution && goal.monthlyContribution > 0)
    .map((goal) => createRow(goal.id, goal.name, 2, months, () => goal.monthlyContribution || 0))
  const savingsGoalTotal = sumRows(
    "allocation-goals-total",
    "Total Savings Goals",
    1,
    savingsGoalRows,
    { isSubtotal: true },
    months
  )

  const totalAllocationRow = sumRows(
    "allocation-total",
    "TOTAL ALLOCATED",
    0,
    [investmentTotal, savingsGoalTotal],
    {},
    months
  )

  // === UNALLOCATED ===
  const unallocatedRow = createRow("unallocated", "UNALLOCATED SURPLUS", 0, months, (month) => {
    return (netCashFlowRow.values[month] || 0) - (totalAllocationRow.values[month] || 0)
  })

  // === ACCRUING BALANCES ===
  const cashReserveTarget = config.cashReserve?.target || 0
  const startingCash = config.cashReserve?.current || 0
  const startingInvestments = config.investments.reduce((sum, inv) => sum + inv.balance, 0)
  const monthlyReturn = config.investments.length > 0
    ? config.investments.reduce((sum, inv) => sum + inv.expectedReturn, 0) / config.investments.length / 12
    : 0

  // Track running balances
  let runningCash = startingCash
  let runningInvestments = startingInvestments

  const cashValues: Record<string, number> = {}
  const investmentValues: Record<string, number> = {}
  const netWorthValues: Record<string, number> = {}

  months.forEach((month) => {
    const monthlyNetCashFlow = netCashFlowRow.values[month] || 0

    // First, top up cash to target if below
    const cashNeeded = Math.max(0, cashReserveTarget - runningCash)
    const cashContribution = Math.min(cashNeeded, Math.max(0, monthlyNetCashFlow))
    runningCash += cashContribution

    // Rest goes to investments
    const investmentContribution = Math.max(0, monthlyNetCashFlow - cashContribution)

    // Apply investment returns then add contribution
    runningInvestments = runningInvestments * (1 + monthlyReturn) + investmentContribution

    cashValues[month] = Math.round(runningCash)
    investmentValues[month] = Math.round(runningInvestments)
    netWorthValues[month] = Math.round(runningCash + runningInvestments)
  })

  const cashRow: PLRow = {
    id: "balance-cash",
    name: "Cash Reserve",
    isGroup: false,
    isSubtotal: false,
    depth: 1,
    values: cashValues,
    ytd: cashValues[months[months.length - 1]] || 0,
  }

  const investmentsBalanceRow: PLRow = {
    id: "balance-investments",
    name: "Investments",
    isGroup: false,
    isSubtotal: false,
    depth: 1,
    values: investmentValues,
    ytd: investmentValues[months[months.length - 1]] || 0,
  }

  const netWorthRow: PLRow = {
    id: "balance-net-worth",
    name: "NET WORTH",
    isGroup: false,
    isSubtotal: false,
    depth: 0,
    values: netWorthValues,
    ytd: netWorthValues[months[months.length - 1]] || 0,
  }

  return {
    year,
    months,
    income: {
      recurring: {
        title: "Recurring",
        rows: recurringIncomeRows,
        total: recurringIncomeTotal,
      },
      oneTime: {
        title: "One-Time",
        rows: oneTimeIncomeRows,
        total: oneTimeIncomeTotal,
      },
      total: totalIncomeRow,
    },
    expenses: {
      recurring: {
        title: "Recurring",
        rows: recurringExpenseRows,
        total: recurringExpenseTotal,
      },
      oneTime: {
        title: "One-Time",
        rows: oneTimeExpenseRows,
        total: oneTimeExpenseTotal,
      },
      total: totalExpenseRow,
    },
    netCashFlow: netCashFlowRow,
    allocations: {
      investments: {
        title: "Investments",
        rows: investmentRows,
        total: investmentTotal,
      },
      savingsGoals: {
        title: "Savings Goals",
        rows: savingsGoalRows,
        total: savingsGoalTotal,
      },
      total: totalAllocationRow,
    },
    unallocated: unallocatedRow,
    balances: {
      cash: cashRow,
      investments: investmentsBalanceRow,
      netWorth: netWorthRow,
    },
  }
}
