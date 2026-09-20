# KisanVault — Route Map

This document defines the final Next.js App Router route map for the KisanVault frontend. The application strictly adheres to one responsive layout per screen and avoids unnecessary nested or duplicated routes.

---

## 1. Root Route

### `/`
- **Page Responsibility**: Serves as the primary entry point. It evaluates the user's authentication state and automatically redirects them to either `/dashboard` (if authenticated) or `/login` (if unauthenticated).
- **Authentication Requirement**: Evaluates state but requires none to hit.
- **Major Components**: None (purely logical redirect layer).
- **API Dependencies**: None (Relies on local storage JWT or auth context).
- **Navigation Entry Points**: Browser URL.
- **Loading State**: Full-page blank or minimal spinner while evaluating auth state.
- **Empty State**: N/A.
- **Error State**: N/A.

---

## 2. Authentication Routes

### `/login`
- **Page Responsibility**: Captures user credentials, authenticates with the backend, stores the JWT, and redirects to the Dashboard. Must merge Stitch desktop and mobile designs into a single responsive layout.
- **Authentication Requirement**: None (Unauthenticated users only; redirects authenticated users to `/dashboard`).
- **Major Components**: `<Input>`, `<Button>`, layout wrappers.
- **API Dependencies**: `POST /api/auth/login`
- **Navigation Entry Points**: `/`, Logout action, session expiration redirect.
- **Loading State**: Inline spinner on the "Login" button.
- **Empty State**: N/A.
- **Error State**: Inline error messages under inputs or toast for invalid credentials.

### `/register`
- **Page Responsibility**: Captures new user details and creates an account.
- **Authentication Requirement**: None.
- **Major Components**: `<Input>`, `<Button>`.
- **API Dependencies**: `POST /api/auth/register`
- **Navigation Entry Points**: "Create Account" link on `/login`.
- **Loading State**: Inline spinner on the "Register" button.
- **Empty State**: N/A.
- **Error State**: Inline error messages under inputs or toast.

---

## 3. Main Application Routes

*All routes below require a valid JWT. Unauthenticated users are redirected to `/login`.*

### `/dashboard`
- **Page Responsibility**: Provides an at-a-glance overview of the farm, including quick stats and a timeline of recent activities.
- **Authentication Requirement**: Required.
- **Major Components**: `<SummaryCard>`, `<Timeline>`, `<TimelineItem>`, `<RecordCard>`, `<Button>`.
- **API Dependencies**: 
  - `GET /api/auth/me` (for welcome message)
  - `GET /api/summary/season` or `GET /api/records/timeline` (for quick stats and recent activities).
- **Navigation Entry Points**: Navbar/Sidebar, Login success, `/` redirect.
- **Loading State**: Skeleton cards replacing the summary stats and recent timeline.
- **Empty State**: "No recent activities" message guiding the user to "Add Record".
- **Error State**: Toast notification or inline error boundary if data fails to load.

### `/add-record`
- **Page Responsibility**: A single screen containing five distinct sub-forms for adding various farm records. Manages the state to display the active form mode.
- **Authentication Requirement**: Required.
- **Major Components**: `<RecordTypeSelector>`, `<FieldForm>`, `<CropForm>`, `<ActivityForm>`, `<ExpenseForm>`, `<HarvestForm>`, `<Input>`, `<Select>`.
- **API Dependencies**: 
  - `GET /api/records/fields` (to populate dropdowns)
  - `GET /api/records/crops` (to populate dropdowns)
  - `POST /api/records/field`
  - `POST /api/records/crop`
  - `POST /api/records/activity`
  - `POST /api/records/expense`
  - `POST /api/records/harvest`
- **Navigation Entry Points**: Navbar/Sidebar, "Add Record" floating/header button.
- **Loading State**: Spinner on the active form's submit button. Skeleton loaders for dropdown population.
- **Empty State**: N/A.
- **Error State**: Form validation errors, toast notifications on submission failure.

### `/history`
- **Page Responsibility**: Displays the full, chronological timeline of all farm records, with robust filtering capabilities.
- **Authentication Requirement**: Required.
- **Major Components**: `<FilterPanel>`, `<Timeline>`, `<RecordCard>`, `<RecordDetail>` (rendered conditionally inline, via modal, or drawer, NOT as a separate route).
- **API Dependencies**: 
  - `GET /api/records/timeline`
  - `GET /api/records/filter` (when applying filters)
- **Navigation Entry Points**: Navbar/Sidebar, "View All" on Dashboard.
- **Loading State**: Full-page skeleton timeline or loading spinner overlay when filters change.
- **Empty State**: "No records found" message (with a specific variation if no records match the applied filters).
- **Error State**: Inline error message offering a retry button.

### `/search`
- **Page Responsibility**: Interfaces with the AI backend to allow farmers to query their history using natural language, returning both an AI summary and exact source records.
- **Authentication Requirement**: Required.
- **Major Components**: `<SearchBar>`, `<SearchResult>`, `<EvidenceViewer>`, `<RecordCard>`.
- **API Dependencies**: `POST /api/search/query`
- **Navigation Entry Points**: Navbar/Sidebar, Dashboard quick action.
- **Loading State**: Skeleton block resembling the AI answer generation, spinner in the search bar.
- **Empty State**: Initial view before searching displays suggested questions (chips).
- **Error State**: "Unable to process query" message.

### `/summary`
- **Page Responsibility**: Provides aggregated reports, AI-generated season summaries, and charts breaking down activities and expenses.
- **Authentication Requirement**: Required.
- **Major Components**: `<Select>` (for season/field picking), `<SummaryCard>`, `<ActivityChart>`, `<ExpenseChart>`.
- **API Dependencies**: 
  - `GET /api/summary/season`
  - `GET /api/summary/field`
  - `GET /api/summary/crop`
- **Navigation Entry Points**: Navbar/Sidebar, Dashboard quick action.
- **Loading State**: Skeleton blocks replacing the charts and AI summary paragraph.
- **Empty State**: "Not enough data to generate summary" message if a new field/season is selected.
- **Error State**: Inline error message replacing the chart/summary sections.
