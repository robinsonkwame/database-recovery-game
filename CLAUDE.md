# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

This is a **Database Recovery Concepts Game** - an educational interactive web application built with Next.js that teaches database recovery concepts through scenario-based gameplay. It is used in a business-school course (submissions go to a Wayne State Canvas assignment). Players work through 15 business scenarios (university operations plus Detroit and news-inspired events) and choose **Rollback (undo)** or **Commit recovery (redo)** after a system failure.

## Architecture

### Framework & Structure
- **Next.js** (Pages Router) application
- **React** components with hooks for state management
- **Radix UI** components for accessible UI primitives
- **Tailwind CSS** with shadcn/ui component system for styling
- **Class Variance Authority** for component variant styling

### Key Components
- `pages/DatabaseRecoveryGame.jsx`: Main game component containing all 15 scenarios, scoring logic, and game state management
- `pages/index.js`: Home page that renders the game
- `components/ui/`: Reusable UI components (Card, Button, AlertDialog) following shadcn/ui patterns
- `lib/utils.js`: Utility functions for className merging

### Game Logic Architecture
- Scenarios and options are shuffled on game start (`shuffleScenarios`)
- Score ranges from 0 to the number of scenarios (1 point per correct answer). The completion code's first letter encodes the score (A=0, B=1, ... P=15)
- The end screen shows a completion code and links to the Canvas assignment (update this link each semester)

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Component System

The project uses shadcn/ui components configured in `components.json`:
- **Style**: "new-york" variant
- **Path aliases**: `@/` points to project root
- **No RSC/TSX**: Uses JSX with React hooks
- UI components are in `components/ui/` and follow Radix UI + CVA patterns

## Styling

- **Tailwind CSS** with custom CSS variables for theming
- **Dark mode** support via CSS custom properties
- Custom styles in `styles/globals.css` override component defaults
- Game-specific styling includes blue color scheme and card-based layouts

## Key Files

- `pages/DatabaseRecoveryGame.jsx`: Contains all game scenarios and game logic
- `tailwind.config.js`: Tailwind configuration with custom color system
- `jsconfig.json`: Path aliases configuration for `@/` imports

## Working with Game Content

Scenario design rules (these are what make rollback vs. commit recovery clear):
- **Timing decides the answer.** Every scenario must say, in business terms, whether the transaction committed before the failure. Examples of committed: receipt or confirmation number issued, card charged, money transferred. Examples of not committed: batch partway done, order not yet submitted, half of a transfer posted.
  - Committed before failure → **Commit recovery (redo)**
  - Failed mid-transaction → **Rollback (undo)**
- **Wrap it in a real business decision.** This is a business-school class. Add stakeholder pressure (a dean, a CFO, a donor) that sometimes pushes toward the wrong answer, so students have to reason from the timing.
- **Don't give the answer away** with timelines or labels on the scenario card.
- **Feedback names the timing clue** and the business consequence.
- Keep the answers balanced: currently 8 rollback and 7 commit recovery, including two contrast pairs (Bookstore #1/#2 and Financial Aid #3/#4).
- News-inspired scenarios (#11-15) have an optional `newsLink: { label, url }` shown under the description as "Based on a real-life story". The business details are fictional; only the background event is real. Check that links still load each semester.
- Each scenario has `title`, `description`, `question`, and `options`. Each option has `text` (`ROLLBACK` or `COMMIT`), `outcome`, `score`, and `feedback`.

## Linting Notes

**Apostrophe Handling**: ESLint requires apostrophes in JSX text to be escaped to avoid React warnings. Replace `'` with `&apos;` in all text content:
- ❌ `"You've completed all scenarios"`
- ✅ `"You&apos;ve completed all scenarios"`
- ❌ `"transactions aren't lost"`  
- ✅ `"transactions aren&apos;t lost"`

This applies to literal JSX text only. Scenario strings in the JS array can use normal apostrophes.
