# Operational Guidelines for Agents

This document provides essential instructions, commands, and standards for AI agents operating within the `kolss-estimator-calculator` repository.

## 1. Project Overview & Environment

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI (New York style, Neutral base color)
- **Package Manager:** Yarn
- **Node Version:** >=20

## 2. Commands

### Build & Run

- **Start Development Server:** `yarn dev`
  - Runs on `http://localhost:3000`
- **Build for Production:** `yarn build`
  - Must pass before deployment. Checks for type errors and build failures.
- **Start Production Server:** `yarn start`

### Linting & Formatting

- **Run Linter:** `yarn lint`
  - Uses ESLint with Next.js and Prettier configs.
- **Format Code:** `npx prettier --write .`
  - Standard Prettier formatting + Tailwind class sorting.
- **Pre-commit Hooks:** Husky runs `lint-staged` on commit.
  - Staged files are automatically linted (`eslint --fix`) and formatted (`prettier --write`).

### Testing

- _Note: No test runner (Jest/Vitest) is currently configured._
- To add tests, consider setting up Vitest.

### Tools

- **Tailwind MCP Server:** `yarn mcp:tailwind`
  - Starts the Model Context Protocol server for Tailwind CSS.

## 3. Code Style & Standards

### File Structure

- **Source Directory:** All application code resides in `src/`.
- **Components:**
  - UI primitives (Shadcn): `src/components/ui/`
  - Feature components: `src/components/`
- **Aliases:** Use `@/` to import from `src/`.
  - Example: `import { Button } from "@/components/ui/button"`

### Naming Conventions

- **Files:** `kebab-case.tsx` or `kebab-case.ts` (e.g., `estimator-calculator.tsx`, `utils.ts`).
- **Components:** PascalCase (e.g., `EstimatorCalculator`).
- **Functions/Variables:** camelCase.
- **Types/Interfaces:** PascalCase.

### TypeScript

- **Strict Mode:** Enabled. Avoid `any`. Define strict types for props and state.
- **FC Type:** Explicit `React.FC` is generally not required; infer return types.
- **Interfaces vs Types:** Use `interface` for object shapes, `type` for unions/intersections.

### Component Guidelines (Shadcn UI)

- **Usage:** Do not re-invent UI primitives. Use components from `@/components/ui`.
- **Installation:** If a component is missing, install it via: `npx shadcn@latest add <component-name>`
- **Customization:** Customize via `className` props using Tailwind utility classes.
- **cn Utility:** Use `cn()` from `@/lib/utils` for merging class names (combines `clsx` and `tailwind-merge`).
  - Example: `className={cn("bg-red-500", className)}`

### State Management

- **Local State:** Use `useState` or `useReducer`.
- **Form State:** Use `react-hook-form` combined with `zod` for validation.
  - See installed dependencies: `react-hook-form`, `@hookform/resolvers`, `zod`.

### Error Handling

- Use `try/catch` blocks for async operations.
- Display user-friendly error messages using Shadcn `Alert` or `Toast` (if installed) components.

## 4. MCP & Context

- **Shadcn:** The project is configured with Shadcn MCP (`.mcp.json`). You can query shadcn documentation if the environment supports it.
- **Tailwind:** Use the `mcp:tailwind` script if you need to query Tailwind class information via MCP.

## 5. Deployment

- **Platform:** Vercel (recommended for Next.js).
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`) runs lint and build on push to `main`. Ensure local `yarn build` passes before pushing.
