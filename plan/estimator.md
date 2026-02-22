# KOLSS Estimator Implementation Plan

## Goal

Implement a 7-step kitchen estimator in Next.js (App Router) using Shadcn UI primitives, matching provided designs and behavior, with clean architecture for pricing logic, currency conversion, and step navigation.

## Product Scope

- Multi-step flow (Step 1 → Step 7)
- Shared state across steps with `localStorage` persistence
- Dynamic estimate calculation
- EUR/PLN currency toggle (hardcoded exchange rate for now)
- Summary + contact submission (mock for now, API in a future phase) + thank-you state
- Responsive desktop/mobile UI close to provided mockups

## Tech/Architecture Decisions

- Framework: Next.js 16 App Router
- UI: existing Shadcn components from `src/components/ui/*`
- State (stage 1): local client state in estimator root (`useReducer` or `useState` context) with `localStorage` sync
- Form handling (step 6): `react-hook-form` + `zod`
- Submission: Mock submission in Step 6 (console.log + fake delay); real backend integration postponed to a future phase.
- Pricing logic: isolated pure functions in `src/lib/estimator/pricing.ts`
- Data config: typed constants in `src/lib/estimator/config.ts` (brackets, labels, step values, prices)
- Currency conversion: centralized helper + formatter with fixed rate

## Existing Assets in Repo

- **Primary Reference:** `plan/estimator-refference.pdf`
- Reference HTML prototypes exist at project root (use as secondary reference if PDF and HTML conflict, PDF takes priority):
  - `step1-size-layout.html`
  - `step2-fronts-handles.html`
  - `step3-worktop.html`
  - `step4-appliances-assembly.html`
  - `step5-summary.html`
  - `step6-contact-form.html`
  - `step7-thank-you.html`

## Business Rules (Locked)

Based on the PDF and user confirmation, the layout and island pricing are **fixed EUR**, not percentages.

- `Straight Layout` = `+0 EUR`
- `L-Shape Layout` = `+480 EUR`
- `U-Shape Layout` = `+960 EUR`
- `Kitchen Island` = `+1200 EUR`
- `Area base price` = `600 EUR per 0.5 sq.m` (configured dynamically)

## Proposed File Structure

- `src/app/page.tsx` (entry rendering estimator)
- `src/components/estimator/estimator-root.tsx` (state + step router)
- `src/components/estimator/estimator-header.tsx`
- `src/components/estimator/estimator-footer.tsx`
- `src/components/estimator/step-1-size-layout.tsx`
- `src/components/estimator/step-2-facade-style.tsx`
- `src/components/estimator/step-3-countertop.tsx`
- `src/components/estimator/step-4-appliances.tsx`
- `src/components/estimator/step-5-summary.tsx`
- `src/components/estimator/step-6-contact.tsx`
- `src/components/estimator/step-7-thank-you.tsx`
- `src/components/estimator/option-card.tsx` (reusable selectable card)
- `src/lib/estimator/types.ts`
- `src/lib/estimator/config.ts`
- `src/lib/estimator/pricing.ts`
- `src/lib/estimator/currency.ts`

## Shadcn Usage Plan

Use already installed components:

- `button`, `card`, `radio-group`, `slider`, `switch`, `tabs`, `input`, `textarea`, `checkbox`, `alert`, `separator`, `label`, `badge`

If needed, install missing components:

- `form` (recommended for step 6 integration with react-hook-form)
- `toggle-group` (optional, for EUR/PLN switch polish)

## Global Tasks (Cross-screen)

1. Build estimator domain model

- Define all options (size tiers, layouts, facade materials, handles, countertops, add-ons)
- Add strict TypeScript types for every selectable value
- Add defaults matching screenshots

2. Implement calculation engine

- Base total (calculated via slider value and price per sq.m multiplier) + add-ons + per-m2 multipliers
- The exact slider value is the multiplier for any per-sq.m calculations.
- Fixed EUR strategy for Layout and Island
- Island, appliances, plumbing, assembly math
- Derived values for summary and footer total

3. Implement step/navigation framework

- Step index (1..7), Back/Next logic, disabled states
- Sync state to `localStorage` to prevent data loss on refresh
- Sticky footer with current total
- Shared top header (logo, step indicator, currency switch)

4. Implement currency support

- Source currency in EUR
- PLN conversion helper + formatter (using a hardcoded exchange rate in config)
- Toggle updates all prices consistently

5. Styling/theming parity

- Light neutral look matching provided mockups
- Card selection states, muted surfaces, info banners
- Mobile-first responsive behavior

---

## Screen-by-Screen Tasks

### Screen 1 — Size & Layout (`step-1-size-layout`)

- Kitchen size tier selection cards (Small/Medium/Large) and Area slider must be synchronized and driven by `config.ts`.
  - Slider params: Min `0.5`, Max `8.0`, Step `0.5`.
  - Size Brackets:
    - Small: `0.5 - 3.5`
    - Medium: `4.0 - 5.5`
    - Large: `6.0 - 8.0`
  - Interaction: Selecting a tier card sets the slider to the maximum value of that bracket (e.g., Small -> 3.5). Moving the slider auto-selects the corresponding tier card based on the brackets.
  - Card text labels must be populated from the config.
  - Base price is calculated dynamically: `600 EUR` per `0.5` step (configurable).
- Layout selection cards (Straight/L/U)
- Kitchen island switch row
- Furniture hardware info block (Blum included)
- Hook all inputs to pricing state and live footer total

### Screen 2 — Facade & Handles (`step-2-fronts-handles`)

- Series tabs (Light / Prestige)
- Facade material card selection with EUR/sq.m
- Handle options cards (Surface / Hidden)
- Price deltas applied to estimate
- Preserve previous step selections

### Screen 3 — Countertop (`step-3-worktop`)

- Countertop material grid with descriptions and EUR/sq.m
- Single selection behavior
- Expert tip info alert block
- Update total in real-time

### Screen 4 — Appliances & Assembly (`step-4-appliances-assembly`)

- Multi-select service cards (Plumbing, Electrical)
- Kitchen assembly switch with per-m2 formula
- Warranty info alert block
- Update total with selected services

### Screen 5 — Summary (`step-5-summary`)

- Read-only grouped breakdown:
  - Kitchen configuration
  - Finishes
  - Additional services
- Total estimate row + approximate PLN row
- Important note banner
- Back/Next controls continue flow

### Screen 6 — Contact Form (`step-6-contact`)

- Fields: full name, phone (required), email, city, country, comment
- Required consent checkbox
- zod validation + error messages
- Total reminder row in form
- Submit action -> Mock API delay -> go to Step 7 (Real submission logic is deferred to a future phase)

### Screen 7 — Thank You (`step-7-thank-you`)

- Success state with icon and confirmation title
- “What’s next” 3-point list
- Final estimated total card
- CTA buttons:
  - Calculate Again (reset state to Step 1)
  - Go to kolss.eu (external link)
- Contact info footer line

---

## Phase 1 (Requested): Implement Screens 1 + 5 + 6 + 7 First

### Phase 1 Deliverables

1. Foundation (✅ Done)

- Estimator root state + routing
- Shared header/footer and currency toggle
- Pricing helpers and typed config (minimum needed for 1/5/6/7)

2. Screen 1 fully interactive (✅ Done)

- All controls wired
- Total updates in footer
- Step progression enabled
- _Refinement_: Option cards and toggles explicitly feature top-left radio/checkbox indicators for consistent UI, and entire wrapper elements are clickable areas.

3. Screen 5 summary (✅ Done)

- Pulls data from shared state
- Displays EUR and PLN totals
- Displays layout options properly with fixed EUR strings instead of percentages.

4. Screen 6 form (✅ Done)

- react-hook-form + zod validation
- Consent required
- On valid submit -> Step 7
- _Refinement_: Consent checkbox wrapper is entirely clickable using native `<label>` wrapping.

5. Screen 7 completion (✅ Done)

- Success content
- Reset flow and external navigation actions

### Phase 1 Acceptance Criteria

- ✅ User can complete Step 1 and reach Step 7 without losing data
- ✅ Footer total updates after Step 1 changes
- ✅ Summary reflects selected state correctly
- ✅ Contact form validation works (required fields + consent)
- ✅ Mobile layout is usable and visually aligned with mocks
- ✅ `yarn lint` passes
- ✅ `yarn build` passes

## Phase 2 (After Approval)

### Phase 2 Deliverables

1. **Implement Screen 2 — Facade & Handles** (✅ Done)

- Add Light / Prestige tabs logic.
- Add Facade materials calculation (+EUR/sq.m multiplied by Kitchen Size).
- Add Handle options calculation (Surface included, Hidden +300 EUR).

2. **Implement Screen 3 — Countertop** (✅ Done)

- Add selection for worktops (Laminate, Solid Wood, Composite Stone, Natural Stone, Compact HPL).
- Implement pricing logic (+EUR/sq.m multiplied by Kitchen Size).

3. **Implement Screen 4 — Appliances & Assembly** (✅ Done)

- Add multi-selection for additional services (Plumbing, Electrical).
- Add Kitchen Assembly switch and implement per-m2 logic (~100 EUR / sq.m).

4. **Integration** (✅ Done)

- Hook full 7-step flow so the user navigates linearly: Step 1 -> Step 2 -> Step 3 -> Step 4 -> Step 5 -> Step 6 -> Step 7.
- Ensure state persists when navigating backwards and forwards through all 7 steps.
- Update Summary (Screen 5) to dynamically render exact selections from Steps 2, 3, and 4 instead of hardcoded placeholders.

## QA Checklist

- Step navigation boundaries (cannot go below 1 or above 7)
- Currency toggle consistency across all labels and totals
- Form validation and error states
- Reset flow from step 7 clears all user data
- Responsive checks at mobile and desktop widths
- Verify `localStorage` persistence across page reloads
