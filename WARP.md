# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Database Recovery Concepts Game** - an educational interactive web application built with Next.js that teaches database recovery concepts (commit/rollback) through scenario-based gameplay. Players navigate through 10 university-themed scenarios, making decisions about whether to commit or rollback database transactions based on different contexts.

## Architecture

### Framework & Structure
- **Next.js** (Pages Router) application
- **React** components with hooks for state management
- **Radix UI** components for accessible UI primitives
- **Tailwind CSS** with shadcn/ui component system for styling
- **Class Variance Authority** for component variant styling

### Key Components
- `pages/DatabaseRecoveryGame.jsx`: Main game component containing all 10 scenarios, scoring logic, and game state management
- `pages/index.js`: Home page that renders the game
- `components/ui/`: Reusable UI components (Card, Button, AlertDialog) following shadcn/ui patterns
- `lib/utils.js`: Utility functions for className merging

### Game Logic Architecture
The game uses a sophisticated scenario system where:
- Each scenario has branching outcomes based on player choices
- Previous decisions affect subsequent scenario descriptions through `nextScenarioModifiers`
- Dynamic performance summaries are injected into future scenarios
- Score ranges from 0 to 10 (1 point for correct answers, 0 points for incorrect)

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

- `pages/DatabaseRecoveryGame.jsx`: Contains all game scenarios (392 lines) - this is the core game logic
- `tailwind.config.js`: Tailwind configuration with custom color system
- `jsconfig.json`: Path aliases configuration for `@/` imports

## Working with Game Content

When modifying game scenarios:
- Each scenario object includes `title`, `description`, `options`, and `nextScenarioModifiers`
- Options have `text`, `outcome`, `score`, and `feedback` properties  
- The `nextScenarioModifiers` system affects how future scenarios are presented
- Scenarios are shuffled on game start for replayability

## Linting Notes

**Apostrophe Handling**: ESLint requires apostrophes in JSX text to be escaped to avoid React warnings. Replace `'` with `&apos;` in all text content:
- ❌ `"You've completed all scenarios"`
- ✅ `"You&apos;ve completed all scenarios"`
- ❌ `"transactions aren't lost"`  
- ✅ `"transactions aren&apos;t lost"`

This applies to all text in scenario descriptions, feedback messages, outcomes, and UI labels.
