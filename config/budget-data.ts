import type { BudgetConfig } from "@/types/budget"

export const budgetConfig: BudgetConfig = {
  income: [
    // Jan: NY income (lower due to state/city taxes)
    {
      id: "inc-1a",
      name: "Claudio Salary (NY)",
      source: "salary",
      amount: 13760,
      month: "2025-01",
    },
    {
      id: "inc-2a",
      name: "Katya Salary (NY)",
      source: "salary",
      amount: 8250,
      month: "2025-01",
    },
    // Feb+: FL income (no state/city tax)
    {
      id: "inc-1",
      name: "Claudio Salary",
      source: "salary",
      amount: 15600,
      recurrence: "monthly",
      startDate: "2025-02",
    },
    {
      id: "inc-2",
      name: "Katya Salary",
      source: "salary",
      amount: 9400,
      recurrence: "monthly",
      startDate: "2025-02",
    },
  ],
  expenses: [
    // === HOUSING ===
    // Jan: NY rent
    {
      id: "exp-housing-ny",
      name: "Rent (NY)",
      category: "housing",
      amount: 6800,
      month: "2025-01",
    },
    // Feb+: FL rent (incl. gym & parking)
    {
      id: "exp-housing-fl",
      name: "Rent (incl. gym & parking)",
      category: "housing",
      amount: 3850,
      startDate: "2025-02",
    },

    // === TRANSPORTATION (2 Teslas) ===
    {
      id: "exp-tesla-claudio",
      name: "Tesla Lease - Claudio",
      category: "transportation",
      amount: 441.04,
    },
    {
      id: "exp-tesla-katya",
      name: "Tesla Lease - Katya",
      category: "transportation",
      amount: 441.04,
    },
    {
      id: "exp-geico-claudio",
      name: "Geico Insurance - Claudio",
      category: "transportation",
      amount: 288.79,
    },
    {
      id: "exp-geico-katya",
      name: "Geico Insurance - Katya",
      category: "transportation",
      amount: 288.79,
    },
    {
      id: "exp-supercharging",
      name: "Tesla Supercharging",
      category: "transportation",
      amount: 25,
    },
    {
      id: "exp-tesla-connectivity",
      name: "Tesla Premium Connectivity",
      category: "transportation",
      amount: 9.99,
    },

    // === UTILITIES ===
    {
      id: "exp-electric",
      name: "Electric (incl. Tesla charging)",
      category: "utilities",
      amount: 200,
      startDate: "2025-02", // FL only
    },
    {
      id: "exp-internet",
      name: "Internet",
      category: "utilities",
      amount: 70,
    },
    {
      id: "exp-phone",
      name: "Phone Plans (2 lines)",
      category: "utilities",
      amount: 120,
    },

    // === FOOD ===
    {
      id: "exp-ubereats",
      name: "Uber Eats",
      category: "food",
      amount: 1200,
    },
    {
      id: "exp-dining",
      name: "Restaurants & Dining",
      category: "food",
      amount: 150,
    },
    {
      id: "exp-coffee",
      name: "Coffee",
      category: "food",
      amount: 50,
    },
    {
      id: "exp-groceries",
      name: "Groceries (Whole Foods/Amazon Fresh)",
      category: "food",
      amount: 400,
    },

    // === SUBSCRIPTIONS (Entertainment) ===
    {
      id: "exp-spotify",
      name: "Spotify",
      category: "entertainment",
      amount: 19.99,
    },
    {
      id: "exp-playstation",
      name: "PlayStation Plus",
      category: "entertainment",
      amount: 21,
    },
    {
      id: "exp-peacock",
      name: "Peacock",
      category: "entertainment",
      amount: 10.99,
    },
    {
      id: "exp-paramount",
      name: "Paramount+",
      category: "entertainment",
      amount: 5.99,
    },
    {
      id: "exp-prime",
      name: "Amazon Prime",
      category: "entertainment",
      amount: 16.32,
    },
    {
      id: "exp-audible",
      name: "Audible",
      category: "entertainment",
      amount: 11,
    },
    {
      id: "exp-uberone",
      name: "Uber One",
      category: "entertainment",
      amount: 9.99,
    },
    {
      id: "exp-espn",
      name: "ESPN+",
      category: "entertainment",
      amount: 12.99,
    },
    {
      id: "exp-max",
      name: "Max (HBO)",
      category: "entertainment",
      amount: 17.99,
    },

    // === SUBSCRIPTIONS (Work/Productivity) ===
    {
      id: "exp-vercel",
      name: "Vercel",
      category: "other",
      amount: 62,
    },
    {
      id: "exp-cursor",
      name: "Cursor AI",
      category: "other",
      amount: 22,
    },
    {
      id: "exp-slack",
      name: "Slack",
      category: "other",
      amount: 15,
    },
    {
      id: "exp-suno",
      name: "Suno AI",
      category: "other",
      amount: 10,
    },

    // === SUBSCRIPTIONS (Personal) ===
    {
      id: "exp-oura",
      name: "Oura Ring",
      category: "personal",
      amount: 6.52,
    },

    // === DEBT ===
    {
      id: "exp-student-loans",
      name: "Student Loans (Federal)",
      category: "other",
      amount: 200,
    },
  ],
  investments: [
    // TODO: Add actual investment accounts
  ],
  savingsGoals: [
    // TODO: Define savings goals
  ],
  settings: {
    year: 2025,
    currency: "USD",
  },
}
