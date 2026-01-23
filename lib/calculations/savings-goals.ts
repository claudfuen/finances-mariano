import type { SavingsGoal, SavingsGoalProgress } from "@/types/budget"
import { calculateMonthsBetween, addMonths, getCurrentMonth } from "./utils"

/**
 * Calculate progress and projections for a savings goal
 */
export function calculateGoalProgress(
  goal: SavingsGoal,
  currentMonth?: string
): SavingsGoalProgress {
  const month = currentMonth ?? getCurrentMonth()
  const monthsRemaining = Math.max(0, calculateMonthsBetween(month, goal.targetDate))
  const remaining = goal.targetAmount - goal.currentAmount
  const progressPercentage = goal.currentAmount / goal.targetAmount

  // Calculate required monthly contribution to reach target
  const requiredMonthly = monthsRemaining > 0 ? remaining / monthsRemaining : remaining

  // Determine if on track based on current contribution
  const actualContribution = goal.monthlyContribution ?? 0
  const isOnTrack = actualContribution >= requiredMonthly || goal.currentAmount >= goal.targetAmount

  // Project completion date if not on track
  let projectedCompletionDate: string | null = null
  if (!isOnTrack && actualContribution > 0) {
    const monthsToComplete = Math.ceil(remaining / actualContribution)
    projectedCompletionDate = addMonths(month, monthsToComplete)
  }

  return {
    goalId: goal.id,
    currentAmount: goal.currentAmount,
    targetAmount: goal.targetAmount,
    progressPercentage,
    monthsRemaining,
    requiredMonthly: Math.round(requiredMonthly * 100) / 100,
    isOnTrack,
    projectedCompletionDate,
  }
}

/**
 * Calculate total monthly contributions needed for all goals
 */
export function calculateTotalGoalContributions(goals: SavingsGoal[]): number {
  return goals.reduce((total, goal) => total + (goal.monthlyContribution ?? 0), 0)
}

/**
 * Project when a goal will be completed given a monthly contribution
 */
export function projectGoalCompletion(
  goal: SavingsGoal,
  monthlyContribution: number,
  startMonth?: string
): string | null {
  if (goal.currentAmount >= goal.targetAmount) {
    return startMonth ?? getCurrentMonth()
  }

  if (monthlyContribution <= 0) {
    return null
  }

  const remaining = goal.targetAmount - goal.currentAmount
  const monthsToComplete = Math.ceil(remaining / monthlyContribution)
  const month = startMonth ?? getCurrentMonth()

  return addMonths(month, monthsToComplete)
}

/**
 * Calculate how much more monthly contribution is needed to hit target date
 */
export function calculateRequiredIncrease(goal: SavingsGoal, currentMonth?: string): number {
  const progress = calculateGoalProgress(goal, currentMonth)

  if (progress.isOnTrack) return 0

  const currentContribution = goal.monthlyContribution ?? 0
  return Math.max(0, progress.requiredMonthly - currentContribution)
}

/**
 * Get all goals sorted by urgency (closest deadline + furthest from target)
 */
export function getGoalsByUrgency(goals: SavingsGoal[], currentMonth?: string): SavingsGoal[] {
  const month = currentMonth ?? getCurrentMonth()

  return [...goals].sort((a, b) => {
    const progressA = calculateGoalProgress(a, month)
    const progressB = calculateGoalProgress(b, month)

    // First sort by on-track status (not on track first)
    if (progressA.isOnTrack !== progressB.isOnTrack) {
      return progressA.isOnTrack ? 1 : -1
    }

    // Then by months remaining (fewer months = more urgent)
    if (progressA.monthsRemaining !== progressB.monthsRemaining) {
      return progressA.monthsRemaining - progressB.monthsRemaining
    }

    // Then by progress percentage (lower progress = more urgent)
    return progressA.progressPercentage - progressB.progressPercentage
  })
}

/**
 * Calculate aggregate progress across all goals
 */
export function calculateAggregateGoalProgress(goals: SavingsGoal[]): {
  totalTarget: number
  totalCurrent: number
  overallProgress: number
  onTrackCount: number
  offTrackCount: number
} {
  const currentMonth = getCurrentMonth()
  let onTrackCount = 0
  let offTrackCount = 0

  goals.forEach((goal) => {
    const progress = calculateGoalProgress(goal, currentMonth)
    if (progress.isOnTrack) {
      onTrackCount++
    } else {
      offTrackCount++
    }
  })

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0)

  return {
    totalTarget,
    totalCurrent,
    overallProgress: totalTarget > 0 ? totalCurrent / totalTarget : 0,
    onTrackCount,
    offTrackCount,
  }
}
