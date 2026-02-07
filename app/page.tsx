import { budgetConfig } from "@/config/budget-data"
import { generatePLData, computeInsights } from "@/lib/calculations"
import { BudgetDashboard } from "@/components/budget/BudgetDashboard"

export default function Page() {
  const plData = generatePLData(budgetConfig)
  const insightsData = computeInsights(budgetConfig)

  return (
    <div className="min-h-screen bg-background">
      <BudgetDashboard plData={plData} insightsData={insightsData} />
    </div>
  )
}
