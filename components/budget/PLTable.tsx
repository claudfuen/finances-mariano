"use client"

import { useState, useMemo } from "react"
import { RiArrowDownSLine, RiArrowRightSLine } from "@remixicon/react"
import type { PLData, PLRow, CollapsedState } from "@/types/budget"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/calculations"

interface PLTableProps {
  data: PLData
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatMonthHeader(month: string): string {
  const monthIndex = parseInt(month.split("-")[1], 10) - 1
  return MONTH_LABELS[monthIndex]
}

function formatValue(value: number, showZero = false): string {
  if (value === 0 && !showZero) return "-"
  return formatCurrency(value).replace("$", "")
}

interface RowProps {
  row: PLRow
  months: string[]
  isCollapsed?: boolean
  isHidden?: boolean
  onToggle?: () => void
  variant?: "header" | "section" | "group" | "item" | "subtotal" | "total" | "grand-total"
}

function TableRow({ row, months, isCollapsed, isHidden, onToggle, variant = "item" }: RowProps) {
  if (isHidden) return null

  const isClickable = row.isGroup && onToggle

  return (
    <tr
      className={cn(
        "border-b border-border/50",
        variant === "header" && "bg-muted/50 font-semibold",
        variant === "section" && "bg-muted/30 font-medium",
        variant === "group" && "cursor-pointer hover:bg-muted/20",
        variant === "subtotal" && "bg-muted/20 font-medium text-muted-foreground",
        variant === "total" && "bg-muted/40 font-semibold",
        variant === "grand-total" && "bg-primary/10 font-bold"
      )}
      onClick={isClickable ? onToggle : undefined}
    >
      <td
        className={cn(
          "py-1 px-2 text-xs whitespace-nowrap",
          row.depth === 0 && "font-semibold",
          row.depth === 1 && "pl-4",
          row.depth === 2 && "pl-8 text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-1">
          {row.isGroup && (
            <span className="w-4 h-4 flex items-center justify-center">
              {isCollapsed ? (
                <RiArrowRightSLine className="size-3" />
              ) : (
                <RiArrowDownSLine className="size-3" />
              )}
            </span>
          )}
          {row.name}
        </span>
      </td>
      {months.map((month) => (
        <td
          key={month}
          className={cn(
            "py-1 px-2 text-xs text-right font-mono tabular-nums",
            row.values[month] < 0 && "text-destructive"
          )}
        >
          {formatValue(row.values[month])}
        </td>
      ))}
      <td
        className={cn(
          "py-1 px-2 text-xs text-right font-mono tabular-nums font-medium border-l border-border",
          row.ytd < 0 && "text-destructive"
        )}
      >
        {formatValue(row.ytd, true)}
      </td>
    </tr>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <tr className="bg-muted/60">
      <td colSpan={14} className="py-1.5 px-2 text-xs font-bold uppercase tracking-wide">
        {title}
      </td>
    </tr>
  )
}

function Separator() {
  return (
    <tr>
      <td colSpan={14} className="h-2" />
    </tr>
  )
}

export function PLTable({ data }: PLTableProps) {
  const [collapsed, setCollapsed] = useState<CollapsedState>({})

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Determine which rows are hidden based on collapsed state
  const hiddenRows = useMemo(() => {
    const hidden = new Set<string>()

    // For expense categories, hide children when parent is collapsed
    data.expenses.recurring.rows.forEach((row, index, rows) => {
      if (row.isGroup && collapsed[row.id]) {
        // Find all following rows until next group or end
        for (let i = index + 1; i < rows.length; i++) {
          if (rows[i].isGroup) break
          hidden.add(rows[i].id)
        }
      }
    })

    return hidden
  }, [collapsed, data.expenses.recurring.rows])

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-[52px] z-10 bg-background">
          <tr className="border-b-2 border-border">
            <th className="py-2 px-2 text-left text-xs font-semibold w-48 bg-background" />
            {data.months.map((month) => (
              <th key={month} className="py-2 px-2 text-right text-xs font-semibold w-20 bg-background">
                {formatMonthHeader(month)}
              </th>
            ))}
            <th className="py-2 px-2 text-right text-xs font-semibold w-24 border-l border-border bg-background">
              YTD
            </th>
          </tr>
        </thead>
        <tbody>
          {/* INCOME */}
          <SectionHeader title="Income" />

          {/* Recurring Income */}
          <tr className="bg-muted/20">
            <td colSpan={14} className="py-1 px-4 text-xs font-medium text-muted-foreground">
              Recurring
            </td>
          </tr>
          {data.income.recurring.rows.map((row) => (
            <TableRow key={row.id} row={row} months={data.months} variant="item" />
          ))}
          <TableRow row={data.income.recurring.total} months={data.months} variant="subtotal" />

          {/* One-Time Income */}
          {data.income.oneTime.rows.length > 0 && (
            <>
              <tr className="bg-muted/20">
                <td colSpan={14} className="py-1 px-4 text-xs font-medium text-muted-foreground">
                  One-Time
                </td>
              </tr>
              {data.income.oneTime.rows.map((row) => (
                <TableRow key={row.id} row={row} months={data.months} variant="item" />
              ))}
              <TableRow row={data.income.oneTime.total} months={data.months} variant="subtotal" />
            </>
          )}

          <TableRow row={data.income.total} months={data.months} variant="total" />

          <Separator />

          {/* EXPENSES */}
          <SectionHeader title="Expenses" />

          {/* Recurring Expenses */}
          <tr className="bg-muted/20">
            <td colSpan={14} className="py-1 px-4 text-xs font-medium text-muted-foreground">
              Recurring
            </td>
          </tr>
          {data.expenses.recurring.rows.map((row) => (
            <TableRow
              key={row.id}
              row={row}
              months={data.months}
              variant={row.isGroup ? "group" : "item"}
              isCollapsed={collapsed[row.id]}
              isHidden={hiddenRows.has(row.id)}
              onToggle={row.isGroup ? () => toggleCollapse(row.id) : undefined}
            />
          ))}
          <TableRow row={data.expenses.recurring.total} months={data.months} variant="subtotal" />

          {/* One-Time Expenses */}
          {data.expenses.oneTime.rows.length > 0 && (
            <>
              <tr className="bg-muted/20">
                <td colSpan={14} className="py-1 px-4 text-xs font-medium text-muted-foreground">
                  One-Time
                </td>
              </tr>
              {data.expenses.oneTime.rows.map((row) => (
                <TableRow key={row.id} row={row} months={data.months} variant="item" />
              ))}
              <TableRow row={data.expenses.oneTime.total} months={data.months} variant="subtotal" />
            </>
          )}

          <TableRow row={data.expenses.total} months={data.months} variant="total" />

          <Separator />

          {/* NET CASH FLOW */}
          <TableRow row={data.netCashFlow} months={data.months} variant="grand-total" />

          {/* Only show allocations if there are fixed monthly contributions */}
          {data.allocations.total.ytd > 0 && (
            <>
              <Separator />

              {/* ALLOCATIONS */}
              <SectionHeader title="Allocations" />

              {/* Investments */}
              <tr className="bg-muted/20">
                <td colSpan={14} className="py-1 px-4 text-xs font-medium text-muted-foreground">
                  Investments
                </td>
              </tr>
              {data.allocations.investments.rows.map((row) => (
                <TableRow key={row.id} row={row} months={data.months} variant="item" />
              ))}
              <TableRow row={data.allocations.investments.total} months={data.months} variant="subtotal" />

              {/* Savings Goals */}
              <tr className="bg-muted/20">
                <td colSpan={14} className="py-1 px-4 text-xs font-medium text-muted-foreground">
                  Savings Goals
                </td>
              </tr>
              {data.allocations.savingsGoals.rows.map((row) => (
                <TableRow key={row.id} row={row} months={data.months} variant="item" />
              ))}
              <TableRow row={data.allocations.savingsGoals.total} months={data.months} variant="subtotal" />

              <TableRow row={data.allocations.total} months={data.months} variant="total" />

              <Separator />

              {/* UNALLOCATED */}
              <TableRow row={data.unallocated} months={data.months} variant="grand-total" />
            </>
          )}

          {/* BALANCES */}
          {data.balances && (
            <>
              <Separator />
              <SectionHeader title="Balances" />
              <TableRow row={data.balances.cash} months={data.months} variant="item" />
              <TableRow row={data.balances.investments} months={data.months} variant="item" />
              <TableRow row={data.balances.netWorth} months={data.months} variant="grand-total" />
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
