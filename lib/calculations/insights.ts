import type { BudgetConfig, InsightsData, ExpenseCategory } from "@/types/budget"
import { isRecurringExpense } from "@/types/budget"
import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  getTopExpenseCategories,
  getYearlyIncomeByMonth,
  getYearlyExpensesByMonth,
  getCurrentMonth,
  getExpenseAmountForMonth,
} from "@/lib/calculations"

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
  family: "Family (Hector)",
  other: "Other",
}

const CREDIT_CARD_KEYWORDS = ["Capital One", "Marriott", "Visa Prime", "American Express"]
const HOUSEHOLD_KEYWORDS = ["Groceries", "Uber Eats", "Pharmacy", "Transit", "Misc"]
const DEBT_NAME_KEYWORDS = ["Loan", "IRS Tax", "Installment", "Synchrony", "TD Bank"]

/**
 * Compute financial insights from budget config for a specific month
 */
export function computeInsights(config: BudgetConfig, month?: string): InsightsData {
  const { year } = config.settings
  const currentMonth = getCurrentMonth()
  const referenceMonth = month ?? (currentMonth.startsWith(`${year}`) ? currentMonth : `${year}-02`)

  // Monthly summary
  const totalIncome = calculateMonthlyIncome(config.income, referenceMonth)
  const totalExpenses = calculateMonthlyExpenses(config.expenses, referenceMonth)
  const netCashFlow = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? netCashFlow / totalIncome : 0

  // Top expenses by category
  const topCategories = getTopExpenseCategories(config.expenses, referenceMonth, 11)
  const topExpenses = topCategories.map(({ category, amount }) => ({
    category,
    label: CATEGORY_LABELS[category],
    amount,
    percentOfIncome: totalIncome > 0 ? amount / totalIncome : 0,
  }))

  // Family burden
  const familyExpenses = config.expenses.filter((e) => e.category === "family")
  const familyItems = familyExpenses
    .filter((e) => getExpenseAmountForMonth(e, referenceMonth) > 0)
    .map((e) => ({
      name: e.name,
      amount: getExpenseAmountForMonth(e, referenceMonth),
    }))

  const familyTotal = familyItems.reduce((sum, item) => sum + item.amount, 0)

  let creditCardTotal = 0
  let householdTotal = 0
  let otherTotal = 0
  familyItems.forEach((item) => {
    if (CREDIT_CARD_KEYWORDS.some((k) => item.name.includes(k))) {
      creditCardTotal += item.amount
    } else if (HOUSEHOLD_KEYWORDS.some((k) => item.name.includes(k))) {
      householdTotal += item.amount
    } else {
      otherTotal += item.amount
    }
  })

  // Cash reserve
  const cashCurrent = config.cashReserve?.current ?? 0
  const cashTarget = config.cashReserve?.target ?? 0
  const cashGap = Math.max(0, cashTarget - cashCurrent)
  const monthsToTarget = netCashFlow > 0 && cashGap > 0 ? Math.ceil(cashGap / netCashFlow) : null

  // Monthly trend
  const yearlyIncome = getYearlyIncomeByMonth(config.income, year)
  const yearlyExpenses = getYearlyExpensesByMonth(config.expenses, year)
  const months = Object.keys(yearlyIncome).sort()

  const monthlyTrend = months.map((month) => {
    const inc = yearlyIncome[month]
    const exp = yearlyExpenses[month]
    const net = inc - exp
    return {
      month,
      income: inc,
      expenses: exp,
      netCashFlow: net,
      savingsRate: inc > 0 ? net / inc : 0,
    }
  })

  // Yearly projection
  const totalYearIncome = Object.values(yearlyIncome).reduce((s, v) => s + v, 0)
  const totalYearExpenses = Object.values(yearlyExpenses).reduce((s, v) => s + v, 0)
  const totalYearNet = totalYearIncome - totalYearExpenses
  const avgSavingsRate = totalYearIncome > 0 ? totalYearNet / totalYearIncome : 0

  const projectedYearEndCash = cashCurrent + totalYearNet
  const investmentBalance = config.investments.reduce((sum, inv) => sum + inv.balance, 0)
  const projectedYearEndNetWorth = projectedYearEndCash + investmentBalance

  // Debt-free projection: what if all debt payments vanished from this month onward?
  const debtExpenses = config.expenses.filter((e) => {
    if (!isRecurringExpense(e)) return false
    if (e.name.includes("Car Payment") || e.name.includes("Car Insurance")) return false
    if (e.endDate) return true
    return DEBT_NAME_KEYWORDS.some((k) => e.name.includes(k))
  })

  const remainingMonths = months.filter((m) => m >= referenceMonth)
  let debtSavings = 0
  const debtItems: Array<{ name: string; monthlyAmount: number }> = []

  debtExpenses.forEach((expense) => {
    const monthlyAmount = getExpenseAmountForMonth(expense, referenceMonth)
    if (monthlyAmount === 0) return

    let saved = 0
    remainingMonths.forEach((m) => {
      saved += getExpenseAmountForMonth(expense, m)
    })
    debtSavings += saved
    debtItems.push({ name: expense.name, monthlyAmount })
  })

  const debtFreeYearEndCash = projectedYearEndCash + debtSavings
  const totalMonthlyDebt = debtItems.reduce((sum, d) => sum + d.monthlyAmount, 0)

  return {
    year,
    currentMonth: referenceMonth,
    monthlySummary: { totalIncome, totalExpenses, netCashFlow, savingsRate },
    topExpenses,
    familyBurden: {
      totalMonthly: familyTotal,
      percentOfIncome: totalIncome > 0 ? familyTotal / totalIncome : 0,
      items: familyItems,
      creditCardTotal,
      householdTotal,
      otherTotal,
    },
    cashReserve: {
      current: cashCurrent,
      target: cashTarget,
      gap: cashGap,
      progressPercent: cashTarget > 0 ? Math.min(1, cashCurrent / cashTarget) : 0,
      monthsToTarget,
    },
    monthlyTrend,
    yearlyProjection: {
      totalIncome: totalYearIncome,
      totalExpenses: totalYearExpenses,
      totalNetCashFlow: totalYearNet,
      averageMonthlySavingsRate: avgSavingsRate,
      projectedYearEndCash,
      projectedYearEndNetWorth,
    },
    debtFreeProjection: {
      totalMonthlyDebt,
      debtSavings,
      debtFreeYearEndCash,
      items: debtItems,
    },
  }
}

/**
 * Pre-compute insights for all 12 months of the budget year
 */
export function computeAllMonthlyInsights(config: BudgetConfig): Record<string, InsightsData> {
  const { year } = config.settings
  const result: Record<string, InsightsData> = {}

  for (let m = 1; m <= 12; m++) {
    const month = `${year}-${String(m).padStart(2, "0")}`
    result[month] = computeInsights(config, month)
  }

  return result
}
