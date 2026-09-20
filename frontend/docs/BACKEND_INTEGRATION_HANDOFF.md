# KisanVault Frontend — Backend Integration Handoff

## 1. Purpose
The frontend implementation of KisanVault is complete. The next step is backend integration. This handoff document is designed to allow the backend/integration teammate to connect the existing frontend UI to the FastAPI backend **without** breaking the frontend architecture, UI, authentication integrity, or responsive behavior. 

Integration should happen exclusively through the existing API/service boundary (`src/services/`). You should not need to rewrite or redesign React pages to connect data.

## 2. Current Frontend Architecture
The frontend is built with Next.js (App Router) and Tailwind CSS v4.

- **Next.js App Router**: `src/app/` handles all routing.
- **Route Structure**: Split into `(auth)` for public login/register flows and `(main)` for authenticated dashboard flows.
- **Protected Routes**: Handled by `src/app/(main)/layout.jsx` checking for a valid session.
- **AuthContext**: `src/context/AuthContext.jsx` manages the global user session, JWT storage, and demo-mode overrides.
- **apiClient**: `src/services/apiClient.js` is the central fetch wrapper that attaches JWT headers and catches network errors.
- **Services**: `src/services/` (auth, records, search, summary) contains mapping functions for all API endpoints.
- **Components**: `src/components/ui/` (primitives) and `src/components/domain/` (feature-specific logic like Timeline and RecordCard).
- **Mock Data**: `src/lib/mockData.js` provides visual fallback data while the backend is unavailable.
- **Navigation**: Desktop uses `Sidebar.jsx`, mobile uses a fixed bottom `MobileNav.jsx`.

## 3. Frontend Routes
- `/login` (Public)
- `/register` (Public)
- `/dashboard` (Protected)
- `/add-record` (Protected)
- `/history` (Protected)
- `/search` (Protected)
- `/summary` (Protected)

## 4. Backend API Endpoints

### AUTH:
- **POST /api/auth/register**
  - **Service**: `authService.register`
  - **Component**: `RegisterPage`
  - **Request**: `{ name, mobile, location, password }`
  - **Response**: `{ token, user: {...} }`
  - **Auth Required**: No

- **POST /api/auth/login**
  - **Service**: `authService.login`
  - **Component**: `LoginPage`
  - **Request**: `{ identifier, password }`
  - **Response**: `{ token, user: {...} }`
  - **Auth Required**: No

- **GET /api/auth/me**
  - **Service**: `authService.getMe`
  - **Component**: `AuthContext` (initial load)
  - **Request**: None
  - **Response**: User object
  - **Auth Required**: Yes

### RECORDS:
- **POST /api/records/field** (Service: `createField`, Component: `FieldForm`)
- **GET /api/records/fields** (Service: `getFields`, Component: `AddRecordPage`, `HistoryPage`)
- **POST /api/records/crop** (Service: `createCrop`, Component: `CropForm`)
- **GET /api/records/crops** (Service: `getCrops`, Component: `AddRecordPage`, `HistoryPage`)
- **POST /api/records/activity** (Service: `createActivity`, Component: `ActivityForm`)
- **POST /api/records/expense** (Service: `createExpense`, Component: `ExpenseForm`)
- **POST /api/records/harvest** (Service: `createHarvest`, Component: `HarvestForm`)
- **GET /api/records/timeline** (Service: `getTimeline`, Component: `DashboardPage`, `HistoryPage`)
- **GET /api/records/filter** (Service: `getFilter`, Component: `HistoryPage`)
  - **Request**: URL search params (`field_id`, `crop_id`, `activity_type`, `season`)

### SEARCH:
- **POST /api/search/query**
  - **Service**: `searchService.query`
  - **Component**: `SearchPage`
  - **Request**: `{ query: string }`
  - **Response**: `TBD — backend/frontend contract must be confirmed.` (Expects `{ answer, sources }`)

### SUMMARY:
- **GET /api/summary/season**
- **GET /api/summary/field**
- **GET /api/summary/crop**
  - **Response**: `TBD — backend/frontend contract must be confirmed.` (Expects `{ season, totalExpenses, totalRevenue, activityCount, aiSummary }`)

*Note: All data endpoints require Authentication and propagate errors directly to UI state.*

## 5. Frontend ↔ Backend Data Mapping
React state uses `camelCase` (e.g., `fieldId`, `sowingDate`), while the FastAPI backend likely uses `snake_case` (e.g., `field_id`, `sowing_date`).

**You must implement this mapping boundary strictly within the `src/services/` layer.**
Do NOT scatter backend-specific snake_case keys throughout the React components. Update the service payload objects (e.g., `records.js`) to transform the data before sending it to the backend, and map it back before returning it to the UI.

## 6. Authentication Contract
- **Storage**: JWT is saved in `localStorage` under `kisanvault_jwt`.
- **Injection**: `apiClient.js` automatically attaches `Authorization: Bearer <token>` to every request if the token exists.
- **Handling**: If the backend returns `401 Unauthorized`, `apiClient.js` emits a global `unauthorized` event, which `AuthContext` catches to forcefully log the user out and clear the token.
- **Integrity**: Real authentication must remain real. Do NOT create fake JWTs for production or bypass `AuthContext` to skip security.

## 7. Development Demo Mode
The repository contains a `NEXT_PUBLIC_DEMO_MODE` flag.

When explicitly enabled during local development:
`NEXT_PUBLIC_DEMO_MODE=true`
The frontend exposes a development-only "Use Demo Account" button on the Login/Register screens.

- Demo mode is for **frontend inspection only**.
- It bypasses the real backend authentication request.
- It must **never** be treated as production authentication.
- It must **not** be enabled by default in production.
- `.env.local` is gitignored to protect this flag.
- `.env.example` documents the variable safely.

**Do NOT remove demo mode simply because real authentication is being connected. Preserve it for frontend UI testing.**

## 8. Mock Data — IMPORTANT
`src/lib/mockData.js` currently provides fallback data for visual inspection while the backend is unavailable.

**CRITICAL INTEGRITY RULE:**
Currently, `records.js`, `search.js`, and `summary.js` use `try/catch` blocks to silently serve this mock data when the API fails. 
A failed backend request must **NOT** silently become successful mock data in production.

The final integration behavior must be:
- Real API success → real backend response → UI
- Real API failure → UI error state
- Backend unavailable → UI unavailable/error state
- Explicit development/demo mode → mock/demo behavior

**The integration teammate must remove the silent `catch { return mockData }` fallbacks in the service layer during integration.**

## 9. API Client Rules
- **Base URL**: Set via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`).
- **Errors**: Throws standardized `{ status, message, ...data }` objects to the UI.
- Do not hardcode production backend URLs in the fetch calls. Rely on the environment variable.

## 10. Add Record Integration
`/add-record` is ONE route containing five modes (Field, Crop, Activity, Expense, Harvest) controlled by `activeType` state.
- Forms submit data to distinct service calls.
- Success/error feedback is handled inline via `FormWrapper`.
- Forms reset naturally on success.
- **Do not split these into separate routes.**

## 11. History Integration
- Depends on `getFields` and `getCrops` for filter dropdowns.
- `GET /records/filter` handles query permutations.
- Renders the chronological `Timeline`.

## 12. Search / RAG Integration
- Submits natural-language query to `POST /api/search/query`.
- Displays AI answer text alongside the referenced `EvidenceViewer` source records.
- *Do not invent the backend response schema if it has not been confirmed.*

## 13. Summary Integration
- Aggregates seasonal data.
- Metric cards display revenue, expense, and counts.
- AI insights text block.
- Chart implementation is currently a structural placeholder awaiting real backend distribution data.

## 14. Error Handling Rules
Backend errors must:
- Propagate cleanly through `apiClient.js` and the service layer.
- Reach the UI React state.
- Display meaningful error messages (e.g., 401, 404, 422 Validation Errors, 500).
- Never expose raw stack traces or sensitive backend context to end users.

## 15. CORS / Local Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
Ensure the FastAPI backend explicitly permits `http://localhost:3000` as an allowed origin for local development CORS.

## 16. Integration Order
Recommended approach:
1. Start backend.
2. Confirm auth contract and API base URL.
3. Connect login/register/me.
4. Confirm JWT flow and protected route access.
5. Connect fields/crops.
6. Connect Add Record forms.
7. Connect timeline/history and filters.
8. Connect search/RAG.
9. Connect summaries.
10. Remove unsafe automatic mock fallbacks from `src/services/`.
11. Test error states, 422s, and expired/invalid JWT handling.
12. Test full frontend/backend flow.

## 17. Do Not Break These Things
- Do not redesign UI.
- Do not replace the existing component architecture.
- Do not bypass AuthContext.
- Do not scatter `fetch` calls directly inside page components.
- Do not invent endpoints.
- Do not silently substitute mock data after API failures in production.
- Do not commit `.env.local`.
- Do not remove demo mode functionality.
- Do not create separate mobile/desktop routes.
- Do not break `MobileNav` or `Sidebar`.
- Do not change the 5-mode inline Add Record architecture.

## 18. Integration Acceptance Checklist
- [ ] login works with real backend
- [ ] register works with real backend
- [ ] /me works
- [ ] JWT is correctly handled
- [ ] fields load
- [ ] crops load
- [ ] Field creation works
- [ ] Crop creation works
- [ ] Activity creation works
- [ ] Expense creation works
- [ ] Harvest creation works
- [ ] timeline loads
- [ ] filters work
- [ ] search works
- [ ] evidence/source records display
- [ ] summary works
- [ ] API errors display correctly
- [ ] no automatic mock fallback remains
- [ ] demo mode still works locally
- [ ] mobile navigation still works
- [ ] responsive layout still works
- [ ] npm run build succeeds
