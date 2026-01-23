import { budgetConfig } from "@/config/budget-data"
import { generatePLData } from "@/lib/calculations"
import { PLTable } from "@/components/budget/PLTable"
import { BudgetHeader } from "@/components/budget/BudgetHeader"

export default function Page() {
  const plData = generatePLData(budgetConfig)

  return (
    <div className="min-h-screen bg-background">
      <BudgetHeader year={plData.year} />
      <main className="p-4">
        <PLTable data={plData} />
      </main>
    </div>
  )
}
