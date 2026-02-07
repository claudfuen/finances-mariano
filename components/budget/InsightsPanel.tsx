"use client"

import type { InsightsData } from "@/types/budget"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatCurrency, formatPercentage } from "@/lib/calculations"

interface InsightsPanelProps {
  data: InsightsData
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatMonth(month: string): string {
  const idx = parseInt(month.split("-")[1], 10) - 1
  return MONTH_LABELS[idx]
}

function StatItem({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-semibold font-mono tabular-nums", colorClass)}>{value}</span>
    </div>
  )
}

function ProgressBar({ percent, colorClass = "bg-primary" }: { percent: number; colorClass?: string }) {
  return (
    <div className="h-2 rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", colorClass)}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

function MonthlySummaryCard({ data }: { data: InsightsData }) {
  const { monthlySummary } = data
  return (
    <Card className="sm:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
        <CardDescription>{formatMonth(data.currentMonth)} {data.year}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatItem
            label="Income"
            value={formatCurrency(monthlySummary.totalIncome)}
            colorClass="text-positive"
          />
          <StatItem
            label="Expenses"
            value={formatCurrency(monthlySummary.totalExpenses)}
            colorClass="text-destructive"
          />
          <StatItem
            label="Net Cash Flow"
            value={formatCurrency(monthlySummary.netCashFlow)}
            colorClass={monthlySummary.netCashFlow >= 0 ? "text-positive" : "text-destructive"}
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Savings Rate</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-lg font-semibold font-mono tabular-nums",
                monthlySummary.savingsRate >= 0 ? "text-positive" : "text-destructive"
              )}>
                {formatPercentage(monthlySummary.savingsRate, 1)}
              </span>
              <Badge variant={monthlySummary.savingsRate >= 0.2 ? "default" : monthlySummary.savingsRate >= 0 ? "outline" : "destructive"}>
                {monthlySummary.savingsRate >= 0.2 ? "Healthy" : monthlySummary.savingsRate >= 0 ? "Low" : "Negative"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TopExpensesCard({ data }: { data: InsightsData }) {
  const maxAmount = data.topExpenses.length > 0 ? data.topExpenses[0].amount : 1
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Expenses</CardTitle>
        <CardDescription>By category for {formatMonth(data.currentMonth)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {data.topExpenses.map(({ category, label, amount, percentOfIncome }) => (
            <div key={category} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{formatPercentage(percentOfIncome, 0)}</span>
                  <span className="font-mono tabular-nums font-medium">{formatCurrency(amount)}</span>
                </div>
              </div>
              <ProgressBar percent={(amount / maxAmount) * 100} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function FamilyBurdenCard({ data }: { data: InsightsData }) {
  const { familyBurden } = data
  return (
    <Card>
      <CardHeader>
        <CardTitle>Family (Hector)</CardTitle>
        <CardDescription>
          <span className="flex items-center gap-2">
            {formatPercentage(familyBurden.percentOfIncome, 1)} of income
            <Badge variant="destructive">{formatCurrency(familyBurden.totalMonthly)}/mo</Badge>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {familyBurden.creditCardTotal > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span>Credit Cards</span>
                <span className="font-mono tabular-nums">{formatCurrency(familyBurden.creditCardTotal)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {familyBurden.items
                  .filter((item) => ["Capital One", "Marriott", "Visa Prime", "American Express"].some((k) => item.name.includes(k)))
                  .map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs text-muted-foreground pl-2">
                      <span>{item.name.replace("Hector ", "")}</span>
                      <span className="font-mono tabular-nums">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {familyBurden.creditCardTotal > 0 && familyBurden.householdTotal > 0 && <Separator />}

          {familyBurden.householdTotal > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span>Household</span>
                <span className="font-mono tabular-nums">{formatCurrency(familyBurden.householdTotal)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {familyBurden.items
                  .filter((item) => ["Groceries", "Uber Eats", "Pharmacy", "Transit", "Misc"].some((k) => item.name.includes(k)))
                  .map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs text-muted-foreground pl-2">
                      <span>{item.name.replace("Parents ", "")}</span>
                      <span className="font-mono tabular-nums">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {familyBurden.otherTotal > 0 && (familyBurden.creditCardTotal > 0 || familyBurden.householdTotal > 0) && <Separator />}

          {familyBurden.otherTotal > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span>Car & Other</span>
                <span className="font-mono tabular-nums">{formatCurrency(familyBurden.otherTotal)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {familyBurden.items
                  .filter((item) =>
                    !["Capital One", "Marriott", "Visa Prime", "American Express", "Groceries", "Uber Eats", "Pharmacy", "Transit", "Misc"].some((k) => item.name.includes(k))
                  )
                  .map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs text-muted-foreground pl-2">
                      <span>{item.name.replace("Hector ", "").replace("Hector & Angie ", "")}</span>
                      <span className="font-mono tabular-nums">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CashReserveCard({ data }: { data: InsightsData }) {
  const { cashReserve } = data
  const progressColor = cashReserve.progressPercent >= 0.8
    ? "bg-positive"
    : cashReserve.progressPercent >= 0.5
      ? "bg-primary"
      : "bg-destructive"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Reserve</CardTitle>
        <CardDescription>
          {formatCurrency(cashReserve.current)} of {formatCurrency(cashReserve.target)} target
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <ProgressBar percent={cashReserve.progressPercent * 100} colorClass={progressColor} />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono tabular-nums font-medium">
              {formatPercentage(cashReserve.progressPercent, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-mono tabular-nums font-medium text-destructive">
              {formatCurrency(cashReserve.gap)}
            </span>
          </div>
          {cashReserve.monthsToTarget !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Estimated</span>
              <span className="font-mono tabular-nums font-medium">
                ~{cashReserve.monthsToTarget} month{cashReserve.monthsToTarget !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function YearlyProjectionCard({ data }: { data: InsightsData }) {
  const { yearlyProjection } = data
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.year} Projection</CardTitle>
        <CardDescription>Full year totals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Income</span>
            <span className="font-mono tabular-nums font-medium text-positive">
              {formatCurrency(yearlyProjection.totalIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="font-mono tabular-nums font-medium text-destructive">
              {formatCurrency(yearlyProjection.totalExpenses)}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Net Cash Flow</span>
            <span className={cn(
              "font-mono tabular-nums font-semibold",
              yearlyProjection.totalNetCashFlow >= 0 ? "text-positive" : "text-destructive"
            )}>
              {formatCurrency(yearlyProjection.totalNetCashFlow)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Avg Savings Rate</span>
            <span className="font-mono tabular-nums font-medium">
              {formatPercentage(yearlyProjection.averageMonthlySavingsRate, 1)}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Year-End Cash</span>
            <span className="font-mono tabular-nums font-medium">
              {formatCurrency(yearlyProjection.projectedYearEndCash)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Year-End Net Worth</span>
            <span className={cn(
              "font-mono tabular-nums font-semibold",
              yearlyProjection.projectedYearEndNetWorth >= 0 ? "text-positive" : "text-destructive"
            )}>
              {formatCurrency(yearlyProjection.projectedYearEndNetWorth)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MonthlyTrendCard({ data }: { data: InsightsData }) {
  return (
    <Card className="sm:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Trend</CardTitle>
        <CardDescription>Net cash flow by month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                {data.monthlyTrend.map((t) => (
                  <th key={t.month} className="py-1.5 px-2 text-center font-medium text-muted-foreground">
                    {formatMonth(t.month)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {data.monthlyTrend.map((t, i) => {
                  const prev = i > 0 ? data.monthlyTrend[i - 1].netCashFlow : null
                  const improved = prev !== null && t.netCashFlow > prev
                  const declined = prev !== null && t.netCashFlow < prev
                  return (
                    <td
                      key={t.month}
                      className={cn(
                        "py-2 px-1 text-center font-mono tabular-nums font-medium",
                        t.netCashFlow >= 0 ? "text-positive" : "text-destructive"
                      )}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{formatCurrency(t.netCashFlow).replace("$", "")}</span>
                        {prev !== null && (
                          <span className={cn(
                            "text-[10px]",
                            improved && "text-positive",
                            declined && "text-destructive",
                            !improved && !declined && "text-muted-foreground"
                          )}>
                            {improved ? "\u25B2" : declined ? "\u25BC" : "\u2013"}
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function InsightsPanel({ data }: InsightsPanelProps) {
  return (
    <div className="p-4 grid gap-4 sm:grid-cols-2">
      <MonthlySummaryCard data={data} />
      <TopExpensesCard data={data} />
      <FamilyBurdenCard data={data} />
      <CashReserveCard data={data} />
      <YearlyProjectionCard data={data} />
      <MonthlyTrendCard data={data} />
    </div>
  )
}
