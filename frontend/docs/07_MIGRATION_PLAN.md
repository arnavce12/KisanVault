# KisanVault — Migration Plan

This document outlines a practical, hackathon-optimized implementation plan for converting the static Stitch frontend into a production-ready Next.js application. It is aggressively focused on shipping functional software within a 24-hour deadline while strictly preserving the established design system.

---

## Phase 0 — Project Setup

- **Objective**: Establish the technical foundation of the Next.js App Router application.
- **Tasks**:
  - Initialize the Next.js project inside the `frontend/` directory (clearing existing 0-byte placeholders).
  - Configure Tailwind CSS exactly matching the extracted `DESIGN.md` tokens.
  - Configure `next/font/google` for `Newsreader` and `Source Sans 3`.
  - Move Stitch images (`screen.png` files) into `public/assets/`.
  - Establish `globals.css` with the core background/surface colors.
- **Completion Criteria**: The development server runs locally at `localhost:3000` with the correct font families rendering and Tailwind classes functioning.
- **Dependencies**: None.
- **What MUST NOT be done**: Do not install unnecessary state management libraries (Redux, Zustand) or UI component libraries (MUI, Chakra).

---

## Phase 1 — Shared Foundation

- **Objective**: Build the application shell and highly reusable UI primitives to prevent duplicated markup.
- **Tasks**:
  - Build `app/layout.jsx` and `app/(main)/layout.jsx`.
  - Build `<Navbar />`, `<Sidebar />`, and `<Footer />`.
  - Implement responsive mobile navigation (hamburger menu or bottom nav).
  - Extract core UI primitives from Stitch HTML: `<Button>`, `<Input>`, `<Select>`, `<Card>`, `<Badge>`.
- **Completion Criteria**: The layout structure wraps an empty page. All layout components adapt correctly on mobile and desktop breakpoints.
- **Dependencies**: Phase 0.
- **What MUST NOT be done**: Do not create complex internal state for the Layouts beyond what is necessary to toggle the mobile menu.

---

## Phase 2 — Authentication

- **Objective**: Implement the Login and Registration flows and establish the authentication boundary.
- **Tasks**:
  - Merge the Stitch desktop and mobile login HTML into ONE responsive `<LoginPage />` at `app/(auth)/login/page.jsx`.
  - Create `<RegisterPage />` at `app/(auth)/register/page.jsx`.
  - Implement `AuthContext` to manage the JWT token in `localStorage`.
  - Implement route protection (redirecting unauthenticated users attempting to access `/(main)` routes).
  - Implement inline loading and error states for authentication forms.
- **Completion Criteria**: A user can submit the login form, store a mock/real JWT, and successfully be redirected to the protected dashboard.
- **Dependencies**: Phase 1.
- **What MUST NOT be done**: Do not build a fake backend authentication system. If the backend API is not ready, temporarily resolve the auth service with a hardcoded mock token.

---

## Phase 3 — Core Application Screens

- **Objective**: Convert the remaining static Stitch screens into Next.js React components.
- **Tasks**:
  - Implement **Dashboard** (`/dashboard`): Stats cards, timeline view.
  - Implement **Add Record** (`/add-record`): Type selector and 5 sub-forms (Field, Crop, Activity, Expense, Harvest).
  - Implement **History** (`/history`): Timeline, filtering panel, `<RecordCard>`.
  - Implement **Search** (`/search`): Natural language `<SearchBar>`, `<SearchResult>`, `<EvidenceViewer>`.
  - Implement **Summary** (`/summary`): Charts and AI summary layout.
- **Completion Criteria**: All screens are navigable and visually match the Stitch references. Forms hold local React state.
- **Dependencies**: Phase 2.
- **What MUST NOT be done**: Do not fetch actual data yet. Use hardcoded mock data (stored in `src/lib/mockData.js`) passed as props to domain components.

---

## Phase 4 — API Integration Boundary

- **Objective**: Connect the frontend UI components to the backend REST API.
- **Tasks**:
  - Create `src/services/apiClient.js` to handle `fetch` requests with the JWT `Authorization` header.
  - Implement `src/services/records.js`, `history.js`, `search.js`, and `summary.js`.
  - Replace mock data imports in the Page components with `useEffect` data fetching logic.
  - Implement loading spinners/skeletons while data fetches.
  - Implement toast notifications or error boundaries for failed API requests.
- **Completion Criteria**: UI components populate dynamically using data requested from `localhost:8000` (or wherever the FastAPI backend runs).
- **Dependencies**: Phase 3, Backend API Readiness.
- **What MUST NOT be done**: UI components (`components/ui/`, `components/domain/`) must not contain raw `fetch()` calls.

---

## Phase 5 — Responsive Verification

- **Objective**: Ensure absolute visual consistency across devices.
- **Tasks**:
  - Check every configured route (`/login`, `/dashboard`, `/add-record`, `/history`, `/search`, `/summary`).
  - Verify layout at **Mobile** (< 640px).
  - Verify layout at **Tablet** (640px - 1024px).
  - Verify layout at **Desktop** (> 1024px).
- **Completion Criteria**: No horizontal scrolling issues. Tap targets are sufficiently large on mobile. All layout shifts happen via responsive Tailwind classes.
- **Dependencies**: Phase 3.
- **What MUST NOT be done**: Do not create separate `.jsx` files for mobile and desktop views under any circumstances.

---

## Phase 6 — Integration Readiness

- **Objective**: Finalize the frontend/backend contract handshake.
- **Tasks**:
  - Verify that every backend dependency listed in `docs/04_API_CONTRACT.md` has been successfully called by the frontend.
  - Test CORS configurations.
  - Test JWT token expiration handling (e.g., forcing a logout if a 401 is received).
- **Completion Criteria**: End-to-end flow works seamlessly from frontend input to database persistence and back to frontend display.
- **Dependencies**: Phase 4.
- **What MUST NOT be done**: Do not change backend API contracts on the fly without documenting the changes in the `04_API_CONTRACT.md` file.

---

## Phase 7 — Production Verification

- **Objective**: Ensure the application is stable and ready to ship.
- **Tasks**:
  - Run `npm run build` to verify there are no Next.js build errors or static generation failures.
  - Verify all routing navigation.
  - Open browser dev tools and resolve all Console Errors (e.g., missing `key` props, invalid DOM nesting).
  - Check for broken image links or missing fonts.
  - Conduct a final pass of form validation behavior and API error handling.
- **Completion Criteria**: `npm start` serves a production bundle with 0 console errors and fully functional core features.
- **Dependencies**: Phase 6.
- **What MUST NOT be done**: Do not introduce speculative "nice-to-have" features or refactor working architecture this close to the deadline. Focus only on shipping.
