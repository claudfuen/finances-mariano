"use client"

import { useState } from "react"
import type { PLData, InsightsData } from "@/types/budget"
import { BudgetHeader } from "./BudgetHeader"
import { PLTable } from "./PLTable"
import { InsightsPanel } from "./InsightsPanel"

interface BudgetDashboardProps {
  plData: PLData
  insightsData: InsightsData
}

export function BudgetDashboard({ plData, insightsData }: BudgetDashboardProps) {
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
          <InsightsPanel data={insightsData} />
        )}
      </main>
    </>
  )
}
