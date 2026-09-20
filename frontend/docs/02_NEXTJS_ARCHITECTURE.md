# KisanVault — Next.js Architecture Specification

This document provides a concise and concrete architecture specification for the KisanVault frontend. It is designed to be implemented within a 24-hour hackathon timeline while maintaining high code quality and strict adherence to the Stitch-generated design.

## 1. Next.js App Router Structure

The application uses the Next.js App Router (`app/`).

```text
frontend/
├── public/
│   └── assets/           # Images, SVGs, static files
├── src/
│   ├── app/              # Next.js App Router (pages, layouts, route groups)
│   ├── components/       # Reusable React components
│   │   ├── ui/           # Generic buttons, inputs, cards, pills
│   │   ├── layout/       # Navbar, Sidebar, Footer, wrappers
│   │   └── domain/       # KisanVault specific (e.g., RecordCard, SummaryCard)
│   ├── lib/              # Utility functions, constants, formatting helpers, mock data
│   └── services/         # API clients and data fetching abstraction
├── tailwind.config.js    # Tailwind configuration (colors, fonts, spacing from Stitch)
└── package.json          # Dependencies
```

## 2. Route Groups

The application is divided into two primary route groups to isolate layouts and authentication boundaries.

```text
src/app/
├── (auth)/                  # No sidebar/navbar, unauthenticated access allowed
│   ├── login/page.jsx       # Single responsive login (merging mobile/desktop designs)
│   └── register/page.jsx    # Registration flow
├── (main)/                  # Requires authentication, includes main app layout
│   ├── layout.jsx           # Shared layout (Navbar, Sidebar)
│   ├── dashboard/page.jsx   # Dashboard screen
│   ├── add-record/page.jsx  # Add Record screen
│   ├── history/page.jsx     # Farm History screen
│   ├── search/page.jsx      # Ask KisanVault / Search screen
│   └── summary/page.jsx     # Farm Summary screen
└── page.jsx                 # Root route (redirects to /dashboard or /login based on auth)
```

## 3. Page Responsibilities

A Next.js `page.jsx` component is responsible for:
- Reading URL parameters or search params if necessary.
- Fetching initial data required for the page using the `services/` layer (or triggering a client-side fetch on mount).
- Managing top-level page state.
- Orchestrating the layout of domain components.
- **Pages must NOT:** Contain complex reusable UI markup, direct `fetch()` calls, or business logic.

## 4. Shared Layout Responsibilities

The `(main)/layout.jsx` component is responsible for:
- Rendering the persistent global `<Navbar />` and `<Sidebar />` components.
- Providing consistent padding and structural constraints for the main content area across all primary screens.
- Wrapping the main content in authentication context providers if needed globally.

## 5. Component Hierarchy

Components must be highly reusable to prevent the duplication seen in the Stitch reference.

- **UI Components (`components/ui/`)**: Pure presentational components. Completely decoupled from KisanVault logic. Examples: `<Button>`, `<Input>`, `<Select>`, `<Card>`, `<Modal>`.
- **Layout Components (`components/layout/`)**: Application shell components. Examples: `<Navbar>`, `<Sidebar>`, `<MobileNav>`.
- **Domain Components (`components/domain/`)**: Reusable components specific to KisanVault's business logic. Examples: `<RecordCard>`, `<SummaryWidget>`, `<TimelineEvent>`.

## 6. Add Record Component Hierarchy

The Add Record feature is ONE screen containing five distinct form modes. 

- **`AddRecordPage`** (`app/(main)/add-record/page.jsx`)
  - **`RecordTypeSelector`**: Renders the 5 tabs/pills (Field, Crop, Activity, Expense, Harvest) and manages the `activeMode` state.
  - **`RecordFormsWrapper`**: Renders the corresponding form component based on `activeMode`:
    - `<FieldForm />`
    - `<CropForm />`
    - `<ActivityForm />`
    - `<ExpenseForm />`
    - `<HarvestForm />`

*State Management*: Each `<___Form />` component manages its own local state (controlled inputs). When a form is submitted, it calls a unified handler passed down from `AddRecordPage` or interacts directly with the `services/` layer.

## 7. API/Service Layer Structure

All backend communication must be abstracted into the `src/services/` directory.

- `src/services/apiClient.js`: A base wrapper around standard `fetch` that automatically injects the `Authorization: Bearer <token>` header and handles basic error parsing.
- `src/services/auth.js`: Functions for `login()`, `register()`, and token management.
- `src/services/records.js`: Functions for `getRecords()`, `addRecord()`, etc.
- `src/services/summary.js`: Functions for dashboard and summary data.

## 8. Authentication Boundary

- **Client-Side Verification**: A top-level `<AuthProvider>` or standard layout effect will check `localStorage` (or cookies) for a JWT. 
- **Protected Routes**: If a user attempts to access any route under `(main)` without a valid token, they are immediately redirected to `/(auth)/login`.
- **API Boundary**: The `apiClient.js` attaches the JWT to every outgoing request. If an API responds with `401 Unauthorized`, the client intercepts this, clears local state, and forces a redirect to login.

## 9. State Management Approach

- **Core philosophy**: Keep it simple. **Do not introduce Redux, Zustand, or React Query.**
- **UI State**: Managed via standard React `useState` (e.g., dropdown open/close, active tabs, modal visibility).
- **Form State**: Managed via standard controlled inputs using `useState` or lightweight refs.
- **Global Auth State**: Managed via a React `<AuthContext>` for providing user profile and token status globally.
- **Server Data**: Fetched inside `useEffect` blocks at the page or high-level component tier and stored in local `useState`.

## 10. Asset/Font Handling

- **Fonts**: Do NOT use CDN `<link>` tags. Use `next/font/google` in the root layout to load **Newsreader** and **Source Sans 3**. This prevents layout shifts and improves performance.
- **Icons**: Implement Material Symbols securely.
- **Images**: All static assets (e.g., `screen.png`) must reside in `public/assets/`. Use the Next.js `<Image />` component or standard `<img>` tags for rendering.

## 11. Responsive Strategy

- **ONE Responsive Implementation**: Do not create separate Desktop and Mobile pages. The Stitch reference files `kisanvault_desktop_login` and `kisanvault_mobile_login` MUST be merged into a single `<LoginPage />`.
- **Tailwind Utility Classes**: Rely exclusively on Tailwind breakpoints (`sm:`, `md:`, `lg:`) to alter layout structures (e.g., switching from stacked column blocks to side-by-side flex grids).
- **Navigation**: The sidebar converts to a bottom-nav or hamburger menu on smaller breakpoints, handled entirely through responsive CSS classes.

## 12. Data Flow: UI → Service → Backend

1. **User Action**: User submits a form (e.g., Add Record Activity).
2. **Component Execution**: The `<ActivityForm />` collects its local state and constructs a payload object.
3. **Service Call**: The component calls `await addRecord(payload)` from `services/records.js`.
4. **API Client**: `services/records.js` utilizes `apiClient.js`, which attaches the auth token and sends a POST request to the backend endpoint.

## 13. Data Flow: Backend → Service → UI

1. **API Response**: The backend returns JSON data.
2. **Service Resolution**: `apiClient.js` parses the JSON. `services/records.js` returns the clean data object.
3. **Component Update**: The page component receives the data, updates its `useState` hook.
4. **Render**: React triggers a re-render, passing the new data down as props to the `<RecordCard>` components.

## 14. Loading / Error / Empty / Success States

These states must be handled explicitly and gracefully in the UI.

- **Loading States**: Displayed where the content will appear (e.g., a skeleton loader in place of a list, or a spinner inside a submit button). Controlled by a `const [isLoading, setIsLoading] = useState(false)`.
- **Error States**: Displayed via toast notifications, inline alert banners, or error boundaries. Controlled by a `const [error, setError] = useState(null)`.
- **Empty States**: Specifically designed placeholder UI when lists (like Farm History) return 0 items. 
- **Success States**: Toasts or visual confirmation indicators (e.g., after successfully submitting an Add Record form).

## 15. Division of Responsibilities

- **Components**: Responsible ONLY for rendering DOM, mapping over data arrays, tracking local UI state, and handling DOM events.
- **Services (`services/`)**: Responsible ONLY for constructing API endpoints, serializing payloads, executing HTTP requests, and handling network-level errors.
- **Lib (`lib/`)**: Responsible ONLY for pure utility functions (e.g., `formatDate(dateString)`, `calculateCurrency(amount)`).

## 16. What the Frontend Must NOT Own

To enforce clear client/server boundaries, the frontend architecture explicitly does NOT own:
- **Business Logic Enforcement**: The frontend validates forms for UX purposes, but the backend is the source of truth for business rules.
- **Complex Data Mutations**: The frontend does not process or aggregate raw data streams. The backend must provide data shaped appropriately for display.
- **Permanent Mock Data**: The frontend should not embed fake API logic. During initial development, mock data can be temporarily injected at the `services/` layer, but it must be removed upon API integration.
- **Database Access**: The frontend never connects directly to the database. All operations flow through the REST API.
