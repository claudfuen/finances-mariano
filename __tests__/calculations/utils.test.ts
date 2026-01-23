import { describe, it, expect } from "vitest"
import {
  addMonths,
  calculateMonthsBetween,
  generateMonthRange,
  formatCurrency,
  formatPercentage,
  compareMonths,
  isMonthInRange,
} from "@/lib/calculations/utils"

describe("addMonths", () => {
  it("adds months within same year", () => {
    expect(addMonths("2025-01", 3)).toBe("2025-04")
  })

  it("handles year rollover", () => {
    expect(addMonths("2025-11", 3)).toBe("2026-02")
  })

  it("handles negative months", () => {
    expect(addMonths("2025-03", -2)).toBe("2025-01")
  })

  it("handles year rollback", () => {
    expect(addMonths("2025-02", -3)).toBe("2024-11")
  })

  it("returns same month for zero", () => {
    expect(addMonths("2025-06", 0)).toBe("2025-06")
  })

  it("handles large month additions", () => {
    expect(addMonths("2025-01", 24)).toBe("2027-01")
  })
})

describe("calculateMonthsBetween", () => {
  it("calculates months in same year", () => {
    expect(calculateMonthsBetween("2025-01", "2025-06")).toBe(5)
  })

  it("calculates months across years", () => {
    expect(calculateMonthsBetween("2024-10", "2025-03")).toBe(5)
  })

  it("returns zero for same month", () => {
    expect(calculateMonthsBetween("2025-05", "2025-05")).toBe(0)
  })

  it("returns negative for reversed dates", () => {
    expect(calculateMonthsBetween("2025-06", "2025-01")).toBe(-5)
  })
})

describe("generateMonthRange", () => {
  it("generates correct range", () => {
    const range = generateMonthRange("2025-01", "2025-04")
    expect(range).toEqual(["2025-01", "2025-02", "2025-03", "2025-04"])
  })

  it("handles single month", () => {
    const range = generateMonthRange("2025-03", "2025-03")
    expect(range).toEqual(["2025-03"])
  })

  it("handles year boundary", () => {
    const range = generateMonthRange("2024-11", "2025-02")
    expect(range).toEqual(["2024-11", "2024-12", "2025-01", "2025-02"])
  })
})

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    expect(formatCurrency(1234)).toBe("$1,234")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0")
  })

  it("formats negative amounts", () => {
    expect(formatCurrency(-500)).toBe("-$500")
  })

  it("rounds decimal amounts", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235")
  })

  it("formats large amounts with commas", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000")
  })
})

describe("formatPercentage", () => {
  it("formats decimal as percentage", () => {
    expect(formatPercentage(0.15)).toBe("15.0%")
  })

  it("handles zero", () => {
    expect(formatPercentage(0)).toBe("0.0%")
  })

  it("respects decimal places parameter", () => {
    expect(formatPercentage(0.1567, 2)).toBe("15.67%")
  })

  it("handles values over 100%", () => {
    expect(formatPercentage(1.5)).toBe("150.0%")
  })
})

describe("compareMonths", () => {
  it("returns negative when a < b", () => {
    expect(compareMonths("2025-01", "2025-06")).toBeLessThan(0)
  })

  it("returns positive when a > b", () => {
    expect(compareMonths("2025-06", "2025-01")).toBeGreaterThan(0)
  })

  it("returns zero when equal", () => {
    expect(compareMonths("2025-03", "2025-03")).toBe(0)
  })
})

describe("isMonthInRange", () => {
  it("returns true when in range", () => {
    expect(isMonthInRange("2025-06", "2025-01", "2025-12")).toBe(true)
  })

  it("returns true at start boundary", () => {
    expect(isMonthInRange("2025-01", "2025-01", "2025-12")).toBe(true)
  })

  it("returns true at end boundary", () => {
    expect(isMonthInRange("2025-12", "2025-01", "2025-12")).toBe(true)
  })

  it("returns false before start", () => {
    expect(isMonthInRange("2024-12", "2025-01", "2025-12")).toBe(false)
  })

  it("returns false after end", () => {
    expect(isMonthInRange("2026-01", "2025-01", "2025-12")).toBe(false)
  })

  it("handles undefined start", () => {
    expect(isMonthInRange("2020-01", undefined, "2025-12")).toBe(true)
  })

  it("handles undefined end", () => {
    expect(isMonthInRange("2030-01", "2025-01", undefined)).toBe(true)
  })

  it("handles both undefined", () => {
    expect(isMonthInRange("2025-06", undefined, undefined)).toBe(true)
  })
})
