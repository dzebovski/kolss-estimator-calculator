# Agent Operating Guidelines: KOLSS Estimator Calculator

This document serves as the definitive source of truth and operational rules for all AI coding agents (e.g., Cursor, Copilot, CLI agents) operating within the `kolss-estimator-calculator` repository. Adhere strictly to these conventions to ensure code quality, consistency, and safe automation.

---

## 1. Project Identity & Architecture

- **Primary Goal:** Provide a dynamic pricing estimator, generate quotes, and securely capture client leads.
- **Framework:** Next.js 16 (App Router paradigm).
- **Core Stack:** TypeScript 5, React 19, Node.js >= 20.
- **Styling:** Tailwind CSS v4, integrated with Shadcn UI and Radix UI primitives.
- **State & Forms:** `react-hook-form` combined with `zod` schema validation.
- **Backend Integrations:** Next.js Server Actions (`src/actions`), Supabase (DB/Auth), Pipedrive, Slack, Telegram.
- **Package Manager:** Yarn.

---

## 2. Commands & Workflow

### Development & Build

- **Start Dev Server:** `yarn dev` (Starts Next.js on `http://localhost:3000`).
- **Production Build:** `yarn build`. _Mandatory:_ Agents must run this command after significant refactoring to catch strict TypeScript/build failures.
- **Start Production:** `yarn start`.

### Linting & Formatting

- **Linter:** `yarn lint` (ESLint).
- **Formatter:** `npx prettier --write .`
- _Note:_ A Husky pre-commit hook (`lint-staged`) is configured to auto-format and auto-lint (`eslint --fix`) staged files. Commits will fail if linting rules are violated.

### Testing Strategy

- _Current Status:_ Testing frameworks (Jest/Vitest) are not yet configured in `package.json`.
- **When tests are implemented (Vitest/Jest expected):**
  - **Run a single test:** `npx vitest run path/to/component.test.tsx` or `npx jest path/to/file.test.ts`.
  - **Run all tests:** `yarn test` (once script exists).
  - Use `*.test.ts` or `*.test.tsx` for test file naming.
  - _Agent Rule:_ When writing complex pricing algorithms (e.g., in `src/lib/estimator/`), proactively suggest or implement unit tests to verify logic edge cases.

### Tools & MCP

- **Tailwind MCP Server:** `yarn mcp:tailwind` starts the Model Context Protocol server for Tailwind CSS.
- **Shadcn MCP:** Project is configured with `.mcp.json`. Query docs through it if supported.

---

## 3. Directory Structure

- `src/app/`: Next.js App Router (Pages, Layouts, API Routes, Global Styles).
- `src/actions/`: Server Actions (Data mutations, form submissions securely running on the server).
- `src/components/ui/`: Reusable Shadcn UI primitives. _Do not heavily modify these files directly unless fixing a bug._
- `src/components/estimator/`: Feature-specific UI components forming the core calculator application.
- `src/lib/`: Core utilities, estimator pricing configs (`src/lib/estimator/`), Zod validation schemas (`src/lib/validation/`), and types.
- `src/services/`: External API and database integrations (`leads.service.ts`, `pipedrive.service.ts`, etc.).

---

## 4. Code Style & TypeScript Guidelines

### 4.1. TypeScript Rules

- **Strict Mode:** Enabled. The use of `any` is strictly prohibited. Define explicit interfaces or types.
- **Interfaces vs. Types:** Use `interface` for object shapes and React prop definitions. Use `type` only for unions, intersections, or utility types.
- **React Components:** Use standard function declarations. Let TypeScript infer the return type. Do not use `React.FC`.

  ```tsx
  interface OptionCardProps {
    title: string;
    price: number;
    isSelected?: boolean;
  }

  export function OptionCard({
    title,
    price,
    isSelected = false,
  }: OptionCardProps) {
    return (
      <div data-selected={isSelected}>
        {title} - {price}
      </div>
    );
  }
  ```

### 4.2. Naming Conventions

- **Files and Folders:** `kebab-case` strictly (e.g., `estimator-calculator.tsx`, `use-pricing.ts`).
- **Components:** `PascalCase` (e.g., `EstimatorCalculator`, `OptionCard`).
- **Functions and Variables:** `camelCase` (e.g., `calculateTotal`, `basePrice`).
- **Constants/Env Vars:** `UPPER_SNAKE_CASE` (e.g., `MAX_DISCOUNT_RATE`).

### 4.3. Imports and Modularity

- **Absolute Imports:** Use the `@/` alias for all paths within the `src/` directory (e.g., `import { Button } from "@/components/ui/button"`).
- **Import Ordering:**
  1. React/Next.js core imports.
  2. Third-party packages (e.g., `zod`, `lucide-react`).
  3. Absolute imports (`@/components/...`, `@/lib/...`).
  4. Relative imports (only for closely coupled, same-directory files).

### 4.4. UI & Styling (Tailwind + Shadcn)

- Use standard Tailwind utility classes.
- Use the `cn()` utility (from `@/lib/utils`) to conditionally merge class names.
  ```tsx
  import { cn } from "@/lib/utils";
  // Example usage:
  <div
    className={cn("base-class bg-white", isActive && "bg-blue-500", className)}
  />;
  ```
- **Adding UI Components:** Do not build basic UI elements from scratch. Use `npx shadcn@latest add <component-name>` to pull them into `src/components/ui`.

---

## 5. Next.js 16 Application Patterns

- **Server vs. Client Components:**
  - Default to **Server Components** for maximum performance and SEO.
  - Use the `"use client"` directive at the top of the file _only_ when you need React state (`useState`), lifecycle hooks (`useEffect`), DOM access, or browser-only APIs.
- **Data Fetching:** Fetch data directly in Server Components using native `fetch` or Supabase server clients. Do not use `useEffect` for primary data fetching.
- **Mutations:** Use Next.js Server Actions inside `src/actions/` to handle form submissions and database writes securely.

---

## 6. Error Handling & Validation

- **Forms:** Always integrate `react-hook-form` with `@hookform/resolvers/zod`.
- **Zod Schemas:** Define Zod schemas in `src/lib/validation/` to keep component files clean and readable.
- **Server Actions Safety:**
  - Catch errors in Server Actions and return structured objects: `{ success: boolean, error?: string, data?: T }`.
  - Never leak database connection details or raw error stacks to the client.
- **User Feedback:** Use the installed `sonner` package for toast notifications to display success or error states gracefully.

---

## 7. Deployment & CI/CD

- **Platform:** Vercel (recommended for Next.js).
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`) runs lint and build on push to `main`. Ensure local `yarn build` passes before pushing.

---

## 8. Core Mandates for AI Execution

1. **Assimilate First:** Before editing, use the `read` or `grep` tools to analyze existing patterns in the `src/` directory. Maintain the current project style.
2. **Absolute Pathing:** Always provide absolute filesystem paths when using read/write tools.
3. **No Code Slicing (Unless using an Edit Tool):** When outputting code snippets in conversation, write the complete, functioning block. When using the `write` tool, write the entire file.
4. **Self-Verification:** If you introduce complex logic, run `yarn lint` or `yarn build` using the `bash` tool to ensure you haven't broken the application build.
5. **No Hallucinated Dependencies:** Only import libraries found in `package.json`. If a new package is necessary, ask the user for permission to install it.
