"use client"

import { useState } from "react"
import type { PLData, InsightsData } from "@/types/budget"
import { BudgetHeader } from "./BudgetHeader"
import { PLTable } from "./PLTable"
import { InsightsPanel } from "./InsightsPanel"

interface BudgetDashboardProps {
  plData: PLData
  allInsights: Record<string, InsightsData>
  defaultMonth: string
}

export function BudgetDashboard({ plData, allInsights, defaultMonth }: BudgetDashboardProps) {
  const [activeView, setActiveView] = useState<"pl" | "insights">("pl")

  return (
    <>
      <BudgetHeader
        year={plData.year}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <main>
        {activeView === "pl" ? (
          <PLTable data={plData} />
        ) : (
          <InsightsPanel
            allInsights={allInsights}
            months={plData.months}
            defaultMonth={defaultMonth}
          />
        )}
      </main>
    </>
  )
}
