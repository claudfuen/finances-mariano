# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Budgeting application built with Next.js 16, TypeScript, Tailwind CSS v4, and shadcn/ui.

## Development Commands

Use `bun` as the preferred package manager and runner.

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Start production server
bun start

# Run ESLint
bun lint

# Run tests
bun test

# Run tests with UI
bun test:ui

# Run Storybook
bun storybook

# Add new shadcn component
bunx shadcn@latest add <component-name>
```

## Architecture

### Directory Structure

- **`app/`**: Next.js App Router - routes, layouts, pages
- **`components/ui/`**: shadcn UI components (button, card, input, select, etc.)
- **`components/`**: Application-specific components
- **`lib/`**: Utilities including `cn()` function for class merging
- **`public/`**: Static assets

### shadcn/ui Setup

Configuration in `components.json`:
- Style preset: `base-mira`
- Base color: `neutral`
- Icon library: `remixicon` (`@remixicon/react`)
- Components built on `@base-ui/react` primitives

### Component Patterns

**Class Merging**: Use `cn()` from `@/lib/utils` for all className concatenation:
```typescript
import { cn } from "@/lib/utils"
cn("base-class", conditional && "conditional-class", className)
```

**Variants**: Components use `class-variance-authority` (cva) for variant management:
```typescript
const buttonVariants = cva("base-styles", {
  variants: { variant: { default: "...", destructive: "..." } },
  defaultVariants: { variant: "default" }
})
```

**Data Attributes**: Components use `data-slot` for styling hooks (e.g., `data-slot="button"`)

**Client Components**: Interactive components require `"use client"` directive

### Styling

- CSS variables defined in `app/globals.css` using OKLch color space
- Dark mode via `.dark` class with CSS variable overrides
- Theme tokens: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, etc.
- Sidebar-specific tokens available: `--sidebar`, `--sidebar-foreground`, etc.

## Code Style

- TypeScript strict mode enabled
- Path alias: `@/*` maps to project root
- ESLint with Next.js recommended rules (core-web-vitals + TypeScript)
- Remix Icons for iconography

## Design System Rules

**CRITICAL: Do not bypass the design system.**

1. **Never use `className` overrides on UI components** - Use component variants and props instead
2. **Never use inline `style` attributes** - All styling must go through Tailwind classes or CSS variables
3. **Never use arbitrary Tailwind values** (e.g., `w-[347px]`, `text-[#ff0000]`) - Use design tokens
4. **Always use existing component variants** - If a variant doesn't exist, add it to the component definition
5. **Always use theme CSS variables for colors** - Use `bg-primary`, `text-muted-foreground`, etc., not raw colors
6. **Always use the spacing/sizing scale** - Use `p-4`, `gap-2`, `w-full`, not arbitrary values

When a design need isn't met by existing components:
1. First, check if an existing variant or prop combination works
2. If not, extend the component with a new variant in `components/ui/`
3. Never patch around the design system with one-off styles
