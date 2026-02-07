"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BudgetHeaderProps {
  year: number
  activeView: "pl" | "insights"
  onViewChange: (view: "pl" | "insights") => void
  onPreviousYear?: () => void
  onNextYear?: () => void
}

export function BudgetHeader({ year, activeView, onViewChange, onPreviousYear, onNextYear }: BudgetHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card px-4 py-3 h-[52px]">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{year} Budget</h1>
        <div className="flex items-center gap-1">
          <Button
            variant={activeView === "pl" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("pl")}
            className={cn(activeView !== "pl" && "text-muted-foreground")}
          >
            P&L
          </Button>
          <Button
            variant={activeView === "insights" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("insights")}
            className={cn(activeView !== "insights" && "text-muted-foreground")}
          >
            Insights
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onPreviousYear} disabled={!onPreviousYear}>
            <RiArrowLeftSLine />
          </Button>
          <span className="text-sm font-medium px-2 min-w-16 text-center">{year}</span>
          <Button variant="ghost" size="icon-sm" onClick={onNextYear} disabled={!onNextYear}>
            <RiArrowRightSLine />
          </Button>
        </div>
      </div>
    </header>
  )
}
