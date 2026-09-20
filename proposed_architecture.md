# KisanVault — Proposed Implementation Architecture

Based on the inspection of the static Stitch-generated frontend and the Agent Master Rules, here is the proposed architecture for converting the static HTML/Tailwind design into a clean, maintainable Next.js application.

## 1. Proposed Next.js Directory Structure

We will use the modern Next.js App Router (`app/`) structure to keep routing and layout logic co-located.

```text
frontend/
├── public/
│   └── assets/           # Images and static files
├── src/
│   ├── app/              # Next.js App Router (pages and layouts)
│   ├── components/       # Reusable React components
│   │   ├── ui/           # Generic buttons, inputs, cards
│   │   ├── layout/       # Navbar, Sidebar, Footer wrappers
│   │   └── domain/       # KisanVault specific (e.g., RecordCard)
│   ├── lib/              # Utility functions, constants, formatting
│   └── services/         # API clients and data fetching logic
├── tailwind.config.js
└── package.json
```

## 2. Proposed Route Structure

The routing will directly map to the 6/7 primary screen families outlined in the rules.

```text
src/app/
├── (auth)/
│   ├── login/page.jsx       # Single responsive login
│   └── register/page.jsx    # Mobile register flow
├── (main)/
│   ├── layout.jsx           # Shared layout (Navbar, Sidebar)
│   ├── dashboard/page.jsx   # Farmer Dashboard
│   ├── add-record/page.jsx  # Add Record (with 5 modes)
│   ├── history/page.jsx     # Farm History
│   ├── search/page.jsx      # Ask KisanVault
│   └── summary/page.jsx     # Farm Summary
└── page.jsx                 # Root redirect (to /dashboard or /login)
```

## 3. Proposed Shared Component Structure

To prevent the massive duplication seen in the Stitch HTML, UI elements will be extracted into reusable, pure presentational components.

- **Layout Components:** `<Navbar />`, `<Sidebar />`, `<MobileNav />`
- **UI Components:** `<Button />`, `<Input />`, `<Select />`, `<Card />`, `<Chip />` (used for activities)
- **Domain Components:** `<RecordCard />` (for History), `<SummaryCard />`, `<Timeline />`

## 4. Proposed Add Record Component Structure

Following the rule that "Add Record must remain one screen with five form modes", the structure will be:

- **`AddRecordPage`** (Route component)
  - **`RecordTypeSelector`**: Renders the 5 top pills (Field, Crop, Activity, Expense, Harvest) and manages the `activeMode` state.
  - **`RecordFormsWrapper`**: Renders the appropriate form component based on the active mode:
    - `<FieldForm />`
    - `<CropForm />`
    - `<ActivityForm />`
    - `<ExpenseForm />`
    - `<HarvestForm />`
  - A unified submit handler orchestrates the payload based on the selected mode.

## 5. Proposed API/Service Structure

Keep backend communication isolated from UI components.

- `src/services/apiClient.js`: Configures the base HTTP client (using standard `fetch` or Axios if required, though `fetch` is built-in and simple) with auth token interception.
- `src/services/auth.js`: Login, register, and token management functions.
- `src/services/records.js`: Functions to fetch history, summaries, and post new records.
- UI components will import these service functions rather than writing `fetch()` inline.

## 6. Proposed State-Management Approach

Keeping the architecture simple and avoiding unnecessary libraries (no Redux, Zustand, etc. needed yet):
- **Local UI State:** Standard `useState` for things like dropdown toggles, modal visibility, and active tabs in Add Record.
- **Form State:** Standard controlled React inputs with `useState` within individual form components.
- **Global Auth State:** A simple React `<AuthContext>` to provide the current user session and logout functionality across the app.
- **Data Fetching:** Simple `useEffect` combined with service functions, or custom hooks (e.g., `useRecords()`) to abstract the fetching logic.

## 7. Proposed Handling of Mock/Demo Data

To prevent mock data from polluting UI components:
- Mock data arrays/objects will be stored centrally in `src/lib/mockData.js`.
- Service functions in `src/services/` will temporarily resolve promises with this mock data.
- When the real API is ready, only the service functions need to be updated; the UI components remain completely untouched as they expect standard props.

## 8. Proposed Responsive Implementation Approach

- We will strictly follow the "ONE implementation per screen" rule.
- The duplicated `kisanvault_desktop_login` and `kisanvault_mobile_login` from Stitch will be merged into a single `<LoginPage />`.
- Responsive behavior will be achieved entirely via Tailwind's mobile-first breakpoints (e.g., `flex-col md:flex-row`, `hidden lg:block`).

## 9. Proposed Authentication Boundary

- **Client-Side:** The `<AuthContext>` will check for a valid JWT in `localStorage` on initial load. If unauthenticated, users attempting to access `(main)` routes will be redirected to `/login`.
- **API Boundary:** The `apiClient.js` will automatically attach the `Authorization: Bearer <token>` header to all requests made from `(main)` routes.

## 10. Proposed Asset/Font Handling

- **Fonts:** Remove the Google Fonts CDN links from the Stitch HTML. Use `next/font/google` for `Newsreader` and `Source Sans 3` to optimize loading and prevent layout shifts.
- **Images:** Move `screen.png` and placeholder assets into `public/assets/` and serve them via the Next.js `<Image />` component or native `<img>` tags for simplicity.
- **Icons:** Use Google Material Symbols via standard CSS/font import as implemented in Stitch, or install a lightweight icon package to avoid render-blocking CDN requests.

## 11. Proposed Migration Order

1. **Scaffolding:** Initialize Next.js App Router, install Tailwind, configure fonts and color variables from the Stitch design system.
2. **Layout & Navigation:** Build the base `layout.jsx` with responsive Navbar and Sidebar.
3. **Authentication Screens:** Implement the merged responsive Login and Registration views.
4. **Dashboard & Simple Screens:** Implement Dashboard, Search, and Summary screens using mock data wrappers.
5. **Add Record:** Implement the complex Add Record screen with its mode selector and 5 sub-forms.
6. **History & Timeline:** Implement the History screen and reusable `RecordCard` components.
7. **Final Polish:** Ensure all responsive breakpoints match the Stitch mobile/desktop references perfectly.

## 12. Architectural Risks Discovered

1. **Desktop vs. Mobile Login Merge:** The Stitch reference contains drastically different layouts for mobile and desktop login. Merging these using Tailwind requires careful structural HTML planning to avoid bloated DOM trees.
2. **Add Record Form State:** Managing 5 distinct form schemas on a single screen can lead to a bloated component if not abstracted properly. State must be strictly encapsulated within each `<ModeForm />`.
3. **Tailwind Duplication:** The Stitch reference relies heavily on inline Tailwind utility classes. Extracting these into reusable `<Button>` and `<Card>` components is critical early on to prevent the final Next.js app from becoming unmaintainable.
