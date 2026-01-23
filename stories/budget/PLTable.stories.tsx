import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PLTable } from "@/components/budget/PLTable"
import { generatePLData } from "@/lib/calculations"
import { budgetConfig } from "@/config/budget-data"
import type { BudgetConfig } from "@/types/budget"

const meta: Meta<typeof PLTable> = {
  title: "Budget/PLTable",
  component: PLTable,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta
type Story = StoryObj<typeof PLTable>

// Full budget data
const fullPLData = generatePLData(budgetConfig)

export const Default: Story = {
  args: {
    data: fullPLData,
  },
}

// Minimal data for testing
const minimalConfig: BudgetConfig = {
  income: [
    { id: "1", name: "Salary", source: "salary", amount: 5000, recurrence: "monthly" },
  ],
  expenses: [
    { id: "1", name: "Rent", category: "housing", amount: 1500 },
    { id: "2", name: "Food", category: "food", amount: 500 },
  ],
  investments: [
    { id: "1", name: "401k", balance: 10000, monthlyContribution: 500, expectedReturn: 0.07 },
  ],
  savingsGoals: [
    { id: "1", name: "Emergency", targetAmount: 10000, currentAmount: 5000, targetDate: "2025-12", category: "emergency", monthlyContribution: 300 },
  ],
  settings: { year: 2025, currency: "USD" },
}

export const Minimal: Story = {
  args: {
    data: generatePLData(minimalConfig),
  },
}

// With one-time items only
const oneTimeOnlyConfig: BudgetConfig = {
  income: [
    { id: "1", name: "Tax Refund", source: "other", amount: 3000, month: "2025-03" },
    { id: "2", name: "Bonus", source: "salary", amount: 5000, month: "2025-12" },
  ],
  expenses: [
    { id: "1", name: "Vacation", category: "entertainment", amount: 2000, month: "2025-07" },
    { id: "2", name: "New Phone", category: "personal", amount: 1000, month: "2025-04" },
  ],
  investments: [],
  savingsGoals: [],
  settings: { year: 2025, currency: "USD" },
}

export const OneTimeOnly: Story = {
  args: {
    data: generatePLData(oneTimeOnlyConfig),
  },
}
