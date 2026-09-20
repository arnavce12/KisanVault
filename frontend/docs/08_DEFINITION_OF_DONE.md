# KisanVault — Definition of Done

This document establishes the strict acceptance criteria for the KisanVault frontend. The frontend implementation is considered complete **only when** every condition on this checklist is satisfied.

## Application

- [ ] Next.js development server (`npm run dev`) starts successfully and without immediate crash loops.
- [ ] Production build (`npm run build`) succeeds.
- [ ] No blocking runtime errors exist upon user interaction.

## Routes

All primary routes must be fully functional and reachable:
- [ ] `/login` works.
- [ ] `/register` works.
- [ ] `/dashboard` works.
- [ ] `/add-record` works.
- [ ] `/history` works.
- [ ] `/search` works.
- [ ] `/summary` works.

## Responsive

- [ ] Every route has **ONE** implementation that works fluidly across:
  - Mobile
  - Tablet
  - Desktop
- [ ] **No duplicate** desktop/mobile pages exist (e.g., merging the Stitch `kisanvault_mobile_login` and `kisanvault_desktop_login` into a single responsive `/login` route).

## Design

- [ ] The Stitch visual language, typography, and color palette are strictly preserved.
- [ ] No unauthorized redesign has occurred (e.g., no generic SaaS components, neon styling, or glassmorphism added).

## Add Record

The Add Record feature must remain one route containing all five distinct modes:
- [ ] **Field** mode exists with appropriate form.
- [ ] **Crop** mode exists with appropriate form.
- [ ] **Activity** mode exists with appropriate form.
- [ ] **Expense** mode exists with appropriate form.
- [ ] **Harvest** mode exists with appropriate form.
- [ ] Each mode has a clear backend service boundary in the `services/` layer.

## Navigation

- [ ] All primary navigation (Navbar, Sidebar, Mobile Nav) works.
- [ ] No placeholder `href="#"` navigation remains where a real route exists in the application.

## API Readiness

- [ ] Every API dependency used in the frontend is documented.
- [ ] No API endpoint is invented (the frontend strictly adheres to the provided `docs/04_API_CONTRACT.md`).
- [ ] Backend integration points are obvious, separated from UI components, and ready for real data flow.

## States

Important asynchronous screens and interactions provide appropriate visual feedback:
- [ ] **Loading**: Spinners or skeleton loaders are visible during asynchronous operations.
- [ ] **Success**: Toast notifications or visual confirmations appear where applicable (e.g., Add Record submission).
- [ ] **Empty**: Friendly "no data" states appear where applicable (e.g., an empty history timeline).
- [ ] **Error**: Inline error messages or toasts appear upon API or validation failure.

## Code Quality

- [ ] Shared components are effectively reused (e.g., `<Button>`, `<Input>`, `<RecordCard>`).
- [ ] Duplicated layout markup (like repeating headers and sidebars in every file) is minimized using Next.js Layouts.
- [ ] API logic is cleanly separated from UI rendering components.
- [ ] Mock data is isolated in the `lib/` or `services/` layer and not hardcoded into presentation components.
- [ ] No unnecessary state-management library (like Redux or Zustand) exists.

## Accessibility

- [ ] Form labels exist and are properly tied to inputs.
- [ ] Buttons are semantically understandable.
- [ ] Keyboard interaction works for primary flows.
- [ ] Focus states remain visible for accessibility.
- [ ] Images have appropriate and descriptive `alt` text.

## Final Verification

- [ ] **The coding agent must run the production build (`npm run build`) and explicitly report the result.**
- [ ] **Completion MUST NOT be declared if the build fails.**
