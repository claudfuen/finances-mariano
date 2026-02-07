import type { BudgetConfig } from "@/types/budget"

export const budgetConfig: BudgetConfig = {
  income: [
    // Jan: NY income (10% less due to state taxes: $13,858 × 0.90 = $12,472)
    {
      id: "inc-1a",
      name: "Mariano Salary (NY)",
      source: "salary",
      amount: 12472,
      month: "2026-01",
    },
    // Feb+: FL income (bi-weekly $6,928.92 net after taxes)
    {
      id: "inc-1",
      name: "Mariano Salary",
      source: "salary",
      amount: 6929,
      recurrence: "biweekly",
      startDate: "2026-02",
    },
    // Claudio contribution
    {
      id: "inc-claudio",
      name: "Claudio",
      source: "other",
      amount: 1800,
      recurrence: "monthly",
    },
  ],
  expenses: [
    // === HOUSING ===
    // Rent: NY in Jan ($7,850), FL from Feb ($5,500)
    {
      id: "exp-rent",
      name: "Rent",
      category: "housing",
      amount: 5600,
      monthlyOverrides: {
        "2026-01": 7850, // NY rent before FL move
      },
    },

    // === MOVING COSTS (Feb 2026) ===
    {
      id: "exp-move-extra-rent",
      name: "Extra Month Rent (first & last)",
      category: "housing",
      amount: 11200,
      month: "2026-02",
    },
    {
      id: "exp-move-nyc-prorated",
      name: "Pro-rated NYC Rent",
      category: "housing",
      amount: 4152,
      month: "2026-02",
    },
    {
      id: "exp-move-movers",
      name: "Movers",
      category: "housing",
      amount: 3000,
      month: "2026-02",
    },

    // === UTILITIES ===
    {
      id: "exp-electric-ny",
      name: "Electric (NY)",
      category: "utilities",
      amount: 325,
      month: "2026-01",
    },
    {
      id: "exp-electric-fl",
      name: "Electric",
      category: "utilities",
      amount: 150,
      startDate: "2026-02",
    },
    {
      id: "exp-phone",
      name: "Verizon Wireless",
      category: "utilities",
      amount: 150,
    },

    // === INSURANCE ===
    {
      id: "exp-lemonade",
      name: "Lemonade (Renters)",
      category: "other",
      amount: 31,
    },
    {
      id: "exp-msi",
      name: "MSI Insurance",
      category: "other",
      amount: 22,
    },

    // === TRANSPORTATION ===
    {
      id: "exp-transit-ny",
      name: "MTA Transit",
      category: "transportation",
      amount: 30,
      month: "2026-01",
    },
    {
      id: "exp-uber",
      name: "Uber",
      category: "transportation",
      amount: 75,
    },

    // === FOOD ===
    {
      id: "exp-groceries",
      name: "Groceries",
      category: "food",
      amount: 100,
    },
    {
      id: "exp-dining",
      name: "Dining & Entertainment",
      category: "food",
      amount: 200,
    },
    {
      id: "exp-amazon-grocery",
      name: "Amazon Grocery Subscription",
      category: "food",
      amount: 11,
    },

    // === SUBSCRIPTIONS (Streaming) ===
    {
      id: "exp-netflix",
      name: "Netflix",
      category: "entertainment",
      amount: 25,
    },
    {
      id: "exp-hbomax",
      name: "HBO Max",
      category: "entertainment",
      amount: 18,
    },
    {
      id: "exp-audible",
      name: "Audible",
      category: "entertainment",
      amount: 15,
    },
    {
      id: "exp-discord",
      name: "Discord Nitro",
      category: "entertainment",
      amount: 10,
    },

    // === SUBSCRIPTIONS (Gaming) ===
    {
      id: "exp-playstation",
      name: "PlayStation Network",
      category: "entertainment",
      amount: 21,
    },
    {
      id: "exp-steam",
      name: "Steam Games",
      category: "entertainment",
      amount: 75,
    },
    {
      id: "exp-apex-hosting",
      name: "Apex Minecraft Hosting",
      category: "entertainment",
      amount: 72,
    },
    {
      id: "exp-faceit",
      name: "Faceit",
      category: "entertainment",
      amount: 7,
    },
    {
      id: "exp-ea",
      name: "EA Origin",
      category: "entertainment",
      amount: 6,
    },
    {
      id: "exp-raidbots",
      name: "Raidbots",
      category: "entertainment",
      amount: 10,
    },

    // === SUBSCRIPTIONS (Dev Tools) ===
    {
      id: "exp-chatgpt",
      name: "ChatGPT Plus",
      category: "other",
      amount: 20,
    },
    {
      id: "exp-cursor",
      name: "Cursor AI",
      category: "other",
      amount: 20,
    },
    {
      id: "exp-github",
      name: "GitHub",
      category: "other",
      amount: 4,
    },
    {
      id: "exp-supabase",
      name: "Supabase",
      category: "other",
      amount: 25,
    },
    {
      id: "exp-adobe",
      name: "Adobe Creative Cloud",
      category: "other",
      amount: 34,
    },
    {
      id: "exp-excalidraw",
      name: "Excalidraw Plus",
      category: "other",
      amount: 7,
    },
    {
      id: "exp-playcode",
      name: "Playcode",
      category: "other",
      amount: 15,
    },
    {
      id: "exp-nvidia",
      name: "Nvidia",
      category: "other",
      amount: 22,
    },

    // === SUBSCRIPTIONS (Work/Professional) ===
    {
      id: "exp-medium",
      name: "Medium",
      category: "other",
      amount: 5,
    },
    {
      id: "exp-legalzoom",
      name: "LegalZoom",
      category: "other",
      amount: 40,
    },

    // === SUBSCRIPTIONS (Apple Services) ===
    {
      id: "exp-apple",
      name: "Apple Services",
      category: "other",
      amount: 150,
    },

    // === SUBSCRIPTIONS (Health) ===
    {
      id: "exp-hims",
      name: "Hims / Ro Health",
      category: "personal",
      amount: 160,
    },
    {
      id: "exp-oura",
      name: "Oura Ring",
      category: "personal",
      amount: 7,
    },

    // === SUBSCRIPTIONS (Other) ===
    {
      id: "exp-uberone",
      name: "Uber One",
      category: "other",
      amount: 10,
    },
    {
      id: "exp-chess",
      name: "Chess.com",
      category: "entertainment",
      amount: 19,
    },
    {
      id: "exp-hinge",
      name: "Hinge",
      category: "personal",
      amount: 30,
    },
    {
      id: "exp-rocketmoney",
      name: "Rocket Money",
      category: "other",
      amount: 4,
    },
    {
      id: "exp-stash",
      name: "Stash",
      category: "other",
      amount: 3,
    },

    // === DEBT ===
    {
      id: "exp-student-loans",
      name: "Student Loans (Federal)",
      category: "other",
      amount: 186,
    },
    {
      id: "exp-irs",
      name: "IRS Tax Payment",
      category: "other",
      amount: 251,
    },

    // NY only - free parking in Miami
    {
      id: "exp-parking-ny",
      name: "Parking (2 spots @ $350)",
      category: "transportation",
      amount: 700,
      month: "2026-01",
    },

    // === FAMILY (HECTOR) ===
    {
      id: "exp-hector-car",
      name: "Hector Car Payment",
      category: "family",
      amount: 320,
      endDate: "2027-08", // 19 payments left from Feb 2026
    },
    {
      id: "exp-hector-car-insurance",
      name: "Hector Car Insurance",
      category: "family",
      amount: 160,
    },
    {
      id: "exp-hector-phones",
      name: "Hector & Angie Phones",
      category: "family",
      amount: 95,
    },
    {
      id: "exp-hector-capital-one",
      name: "Hector Capital One QuickSilver",
      category: "family",
      amount: 136,
      startDate: "2026-02",
      endDate: "2028-07", // $4,020 remaining
    },
    {
      id: "exp-hector-marriott-chase",
      name: "Hector Marriott Bonvoy Chase",
      category: "family",
      amount: 124,
      startDate: "2026-02",
      endDate: "2028-11", // $4,121 remaining
    },
    {
      id: "exp-hector-visa-chase",
      name: "Hector Visa Prime Chase",
      category: "family",
      amount: 261,
      startDate: "2026-02",
      endDate: "2028-11", // $8,793 remaining
    },
    {
      id: "exp-hector-amex",
      name: "Hector American Express",
      category: "family",
      amount: 127,
      startDate: "2026-02",
      endDate: "2028-11", // $4,209 remaining
    },
    // Parents household expenses (Apple Card)
    {
      id: "exp-parents-groceries",
      name: "Parents Groceries (Costco, Key Food)",
      category: "family",
      amount: 1400,
    },
    {
      id: "exp-parents-ubereats",
      name: "Parents Uber Eats",
      category: "family",
      amount: 150,
    },
    {
      id: "exp-parents-pharmacy",
      name: "Parents Pharmacy (CVS)",
      category: "family",
      amount: 75,
    },
    {
      id: "exp-parents-transit",
      name: "Parents Transit (MTA)",
      category: "family",
      amount: 50,
    },
    {
      id: "exp-parents-misc",
      name: "Parents Misc (coffee, Amazon)",
      category: "family",
      amount: 200,
    },

    // === APPLE INSTALLMENTS ===
    {
      id: "exp-apple-installments",
      name: "Apple Card Installments",
      category: "other",
      amount: 58,
    },

    // === OTHER CREDIT CARDS ===
    {
      id: "exp-synchrony",
      name: "Synchrony Bank Payment",
      category: "other",
      amount: 110,
    },
    {
      id: "exp-tdbank",
      name: "TD Bank Payment",
      category: "other",
      amount: 133,
    },
  ],
  investments: [
    // TODO: Add Mariano's investment accounts if any
  ],
  cashReserve: {
    target: 10000,
    current: 24755, // Chase ($19,537) + new bank ($5,218)
  },
  savingsGoals: [
    // TODO: Define savings goals
  ],
  settings: {
    year: 2026,
    currency: "USD",
  },
}
