import { budgetConfig } from "@/config/budget-data"
import { generatePLData, computeAllMonthlyInsights, getCurrentMonth } from "@/lib/calculations"
import { BudgetDashboard } from "@/components/budget/BudgetDashboard"

export default function Page() {
  const plData = generatePLData(budgetConfig)
  const allInsights = computeAllMonthlyInsights(budgetConfig)
  const year = budgetConfig.settings.year
  const currentMonth = getCurrentMonth()
  const defaultMonth = currentMonth.startsWith(`${year}`) ? currentMonth : `${year}-02`

  return (
    <div className="min-h-screen bg-background">
      <BudgetDashboard plData={plData} allInsights={allInsights} defaultMonth={defaultMonth} />
    </div>
  )
}
