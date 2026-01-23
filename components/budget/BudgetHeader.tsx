"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

interface BudgetHeaderProps {
  year: number
  onPreviousYear?: () => void
  onNextYear?: () => void
}

export function BudgetHeader({ year, onPreviousYear, onNextYear }: BudgetHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{year} Budget</h1>
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
