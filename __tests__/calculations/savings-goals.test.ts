import { describe, it, expect } from "vitest"
import type { SavingsGoal } from "@/types/budget"
import {
  calculateGoalProgress,
  calculateTotalGoalContributions,
  projectGoalCompletion,
  calculateRequiredIncrease,
  getGoalsByUrgency,
  calculateAggregateGoalProgress,
} from "@/lib/calculations/savings-goals"

describe("calculateGoalProgress", () => {
  const baseGoal: SavingsGoal = {
    id: "1",
    name: "Test Goal",
    targetAmount: 10000,
    currentAmount: 5000,
    targetDate: "2025-12",
    category: "emergency",
    monthlyContribution: 500,
  }

  it("calculates progress percentage", () => {
    const progress = calculateGoalProgress(baseGoal, "2025-01")
    expect(progress.progressPercentage).toBe(0.5)
  })

  it("calculates months remaining", () => {
    const progress = calculateGoalProgress(baseGoal, "2025-01")
    expect(progress.monthsRemaining).toBe(11)
  })

  it("calculates required monthly contribution", () => {
    const progress = calculateGoalProgress(baseGoal, "2025-01")
    // $5000 remaining / 11 months = ~$454.54
    expect(progress.requiredMonthly).toBeCloseTo(454.54, 0)
  })

  it("marks as on track when contribution sufficient", () => {
    const progress = calculateGoalProgress(baseGoal, "2025-01")
    // Contributing $500/mo, need ~$455/mo
    expect(progress.isOnTrack).toBe(true)
  })

  it("marks as not on track when contribution insufficient", () => {
    const lowContribution = { ...baseGoal, monthlyContribution: 100 }
    const progress = calculateGoalProgress(lowContribution, "2025-01")
    expect(progress.isOnTrack).toBe(false)
  })

  it("marks as on track when already achieved", () => {
    const achieved = { ...baseGoal, currentAmount: 10000 }
    const progress = calculateGoalProgress(achieved, "2025-01")
    expect(progress.isOnTrack).toBe(true)
  })

  it("handles zero months remaining", () => {
    const progress = calculateGoalProgress(baseGoal, "2025-12")
    expect(progress.monthsRemaining).toBe(0)
  })

  it("projects completion date when not on track", () => {
    const goal: SavingsGoal = {
      id: "1",
      name: "Test",
      targetAmount: 10000,
      currentAmount: 2000,
      targetDate: "2025-06",
      category: "emergency",
      monthlyContribution: 200,
    }
    const progress = calculateGoalProgress(goal, "2025-01")
    expect(progress.projectedCompletionDate).not.toBeNull()
    // $8000 remaining / $200/mo = 40 months from 2025-01
    expect(progress.projectedCompletionDate).toBe("2028-05")
  })
})

describe("calculateTotalGoalContributions", () => {
  it("sums all contributions", () => {
    const goals: SavingsGoal[] = [
      { id: "1", name: "A", targetAmount: 10000, currentAmount: 0, targetDate: "2025-12", category: "emergency", monthlyContribution: 500 },
      { id: "2", name: "B", targetAmount: 5000, currentAmount: 0, targetDate: "2025-12", category: "vacation", monthlyContribution: 300 },
    ]
    expect(calculateTotalGoalContributions(goals)).toBe(800)
  })

  it("handles undefined contributions", () => {
    const goals: SavingsGoal[] = [
      { id: "1", name: "A", targetAmount: 10000, currentAmount: 0, targetDate: "2025-12", category: "emergency", monthlyContribution: 500 },
      { id: "2", name: "B", targetAmount: 5000, currentAmount: 0, targetDate: "2025-12", category: "vacation" },
    ]
    expect(calculateTotalGoalContributions(goals)).toBe(500)
  })

  it("returns zero for empty array", () => {
    expect(calculateTotalGoalContributions([])).toBe(0)
  })
})

describe("projectGoalCompletion", () => {
  const goal: SavingsGoal = {
    id: "1",
    name: "Test",
    targetAmount: 10000,
    currentAmount: 4000,
    targetDate: "2025-12",
    category: "emergency",
  }

  it("returns current month when already achieved", () => {
    const achieved = { ...goal, currentAmount: 10000 }
    expect(projectGoalCompletion(achieved, 500, "2025-01")).toBe("2025-01")
  })

  it("returns null when no contribution", () => {
    expect(projectGoalCompletion(goal, 0, "2025-01")).toBeNull()
  })

  it("calculates completion month", () => {
    // $6000 remaining / $500/mo = 12 months
    expect(projectGoalCompletion(goal, 500, "2025-01")).toBe("2026-01")
  })

  it("rounds up to full month", () => {
    // $6000 remaining / $700/mo = 8.57 months -> rounds to 9
    expect(projectGoalCompletion(goal, 700, "2025-01")).toBe("2025-10")
  })
})

describe("calculateRequiredIncrease", () => {
  it("returns zero when on track", () => {
    const goal: SavingsGoal = {
      id: "1",
      name: "Test",
      targetAmount: 10000,
      currentAmount: 8000,
      targetDate: "2025-06",
      category: "emergency",
      monthlyContribution: 500,
    }
    expect(calculateRequiredIncrease(goal, "2025-01")).toBe(0)
  })

  it("calculates increase needed", () => {
    const goal: SavingsGoal = {
      id: "1",
      name: "Test",
      targetAmount: 10000,
      currentAmount: 4000,
      targetDate: "2025-06",
      category: "emergency",
      monthlyContribution: 500,
    }
    // $6000 remaining / 5 months = $1200/mo needed, contributing $500 = $700 increase
    const increase = calculateRequiredIncrease(goal, "2025-01")
    expect(increase).toBeCloseTo(700, 0)
  })
})

describe("getGoalsByUrgency", () => {
  const goals: SavingsGoal[] = [
    { id: "1", name: "On Track", targetAmount: 1000, currentAmount: 900, targetDate: "2025-06", category: "vacation", monthlyContribution: 100 },
    { id: "2", name: "Off Track Soon", targetAmount: 5000, currentAmount: 1000, targetDate: "2025-03", category: "purchase", monthlyContribution: 100 },
    { id: "3", name: "Off Track Later", targetAmount: 10000, currentAmount: 2000, targetDate: "2025-12", category: "emergency", monthlyContribution: 200 },
  ]

  it("puts off-track goals first", () => {
    const sorted = getGoalsByUrgency(goals, "2025-01")
    expect(sorted[0].name).toBe("Off Track Soon")
  })

  it("sorts by deadline when both off track", () => {
    const sorted = getGoalsByUrgency(goals, "2025-01")
    // Off Track Soon has closer deadline
    expect(sorted[0].name).toBe("Off Track Soon")
    expect(sorted[1].name).toBe("Off Track Later")
  })

  it("puts on-track goals last", () => {
    const sorted = getGoalsByUrgency(goals, "2025-01")
    expect(sorted[2].name).toBe("On Track")
  })
})

describe("calculateAggregateGoalProgress", () => {
  const goals: SavingsGoal[] = [
    { id: "1", name: "A", targetAmount: 10000, currentAmount: 8000, targetDate: "2025-12", category: "emergency", monthlyContribution: 500 },
    { id: "2", name: "B", targetAmount: 5000, currentAmount: 2000, targetDate: "2025-06", category: "vacation", monthlyContribution: 100 },
  ]

  it("calculates totals", () => {
    const aggregate = calculateAggregateGoalProgress(goals)
    expect(aggregate.totalTarget).toBe(15000)
    expect(aggregate.totalCurrent).toBe(10000)
  })

  it("calculates overall progress", () => {
    const aggregate = calculateAggregateGoalProgress(goals)
    expect(aggregate.overallProgress).toBeCloseTo(0.667, 2)
  })

  it("counts on/off track", () => {
    const aggregate = calculateAggregateGoalProgress(goals)
    expect(aggregate.onTrackCount + aggregate.offTrackCount).toBe(2)
  })

  it("handles empty array", () => {
    const aggregate = calculateAggregateGoalProgress([])
    expect(aggregate.totalTarget).toBe(0)
    expect(aggregate.overallProgress).toBe(0)
  })
})
