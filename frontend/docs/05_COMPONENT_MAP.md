# KisanVault — Component Map

This document outlines the component inventory for the KisanVault frontend. The goal is to provide a comprehensive, reusable component structure that prevents UI duplication while maintaining clear responsibilities and separation of concerns.

**General Rule:** UI Primitives and Layout components **do not** call APIs directly. Only page-level components or highly specialized domain components handle data fetching, passing it down as props.

---

## Global/Layout

Components that wrap pages and provide structural navigation across the application.

### `Navbar`
- **Responsibility**: Provides top-level branding, current user status, and desktop navigation links.
- **Props**: `user` (object), `currentRoute` (string).
- **Owns State**: Yes (mobile menu toggle state, user dropdown state).
- **Calls API**: No (Receives user data from global AuthContext or layout fetch).
- **Where Reused**: Inside `(main)/layout.jsx`.

### `Sidebar`
- **Responsibility**: Primary navigation for desktop layouts.
- **Props**: `currentRoute` (string), `navigationItems` (array).
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Inside `(main)/layout.jsx`.

### `MobileNav`
- **Responsibility**: Bottom navigation bar or hamburger menu for mobile users.
- **Props**: `currentRoute` (string), `navigationItems` (array).
- **Owns State**: No (State managed by layout).
- **Calls API**: No.
- **Where Reused**: Inside `(main)/layout.jsx` (visible only on `sm`/`md` breakpoints).

### `Footer`
- **Responsibility**: Provides secondary links, support contact (e.g., "Kisan Sahayata: 1800-180-1551"), and language selector.
- **Props**: None.
- **Owns State**: Yes (Language selection dropdown).
- **Calls API**: No.
- **Where Reused**: Bottom of `(main)/layout.jsx` or specific pages like Login.

---

## UI Primitives

Highly reusable, pure presentational components. Completely decoupled from business logic.

### `Button`
- **Responsibility**: Standard interactive button (supports Primary, Secondary, Ghost variants).
- **Props**: `variant`, `size`, `isLoading`, `disabled`, `onClick`, `children`, `icon`.
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Everywhere.

### `Input`
- **Responsibility**: Standard text/number/date input with optional icon and error state.
- **Props**: `value`, `onChange`, `placeholder`, `type`, `error`, `icon`, `label`.
- **Owns State**: No (Usually controlled by parent form).
- **Calls API**: No.
- **Where Reused**: Forms, Login, Search.

### `Select`
- **Responsibility**: Dropdown selector.
- **Props**: `value`, `onChange`, `options`, `label`, `error`.
- **Owns State**: Yes (Native select state or custom open/close state if styled heavily).
- **Calls API**: No.
- **Where Reused**: Forms, FilterPanel.

### `Card`
- **Responsibility**: Base container for wrapping content with standard shadow, background (`#FFFFFF` or `#F5F1E8`), and border-radius.
- **Props**: `children`, `className`, `onClick`.
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Dashboard stats, Records, Summary panels.

### `Tabs`
- **Responsibility**: Allows switching between different views within the same page context.
- **Props**: `tabs` (array of labels/values), `activeTab`, `onTabChange`.
- **Owns State**: No (Controlled by parent).
- **Calls API**: No.
- **Where Reused**: Dashboard, SummaryPage.

### `Badge/Chip`
- **Responsibility**: Displays small status indicators or selectable activity types.
- **Props**: `label`, `variant` (success, warning, error, neutral, selectable), `icon`, `onClick`, `selected`.
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: RecordCard (status), AddRecord (Activity selection).

### `Loading`
- **Responsibility**: Provides visual feedback during data fetching (spinner or skeleton block).
- **Props**: `type` ('spinner' | 'skeleton'), `size`.
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Wrapped around data-heavy sections or inside Buttons.

### `Error`
- **Responsibility**: Displays a localized error message or toast notification.
- **Props**: `message`, `onRetry`, `type` ('inline' | 'toast').
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Forms, global layout.

### `EmptyState`
- **Responsibility**: Friendly message when a list returns 0 items.
- **Props**: `title`, `description`, `icon`, `actionButton`.
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: History page, Search page.

---

## Records

Components dedicated to the creation and presentation of farming records.

### `RecordTypeSelector`
- **Responsibility**: Navigates between the 5 Add Record modes (Field, Crop, Activity, Expense, Harvest).
- **Props**: `activeType`, `onTypeSelect`.
- **Owns State**: No (Controlled by `AddRecordPage`).
- **Calls API**: No.
- **Where Reused**: Add Record page.

### `FieldForm` / `CropForm` / `ActivityForm` / `ExpenseForm` / `HarvestForm`
- **Responsibility**: Collects data specific to the respective record type. Validates input and triggers submission.
- **Props**: `onSubmit`, `isLoading`, `dropdownData` (e.g., list of fields for CropForm).
- **Owns State**: Yes (Local form field state).
- **Calls API**: No (Orchestrates payload and calls the `onSubmit` prop which calls the API).
- **Where Reused**: Add Record page.

### `RecordCard`
- **Responsibility**: Displays a summary of a single record (e.g., an irrigation activity or an expense).
- **Props**: `record` (object containing type, date, amount, field).
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: History Page, Dashboard Timeline, Search Results.

### `RecordDetail`
- **Responsibility**: Displays full metadata and voice notes for a specific record inside a modal or expanded view.
- **Props**: `recordId`, `record` (object).
- **Owns State**: Yes (Modal visibility).
- **Calls API**: No (Parent provides full data or it triggers a fetch on open).
- **Where Reused**: History Page.

---

## History

Components for viewing and filtering past events.

### `FilterPanel`
- **Responsibility**: Provides dropdowns and chips to filter timeline records by Field, Crop, Activity, Season, or Date.
- **Props**: `filters`, `onFilterChange`, `filterOptions` (dropdown lists).
- **Owns State**: Yes (Local state for selected filters before applying).
- **Calls API**: No (Parent passes filter options and handles fetching).
- **Where Reused**: History Page.

### `Timeline`
- **Responsibility**: Container that orders `TimelineItem` components chronologically.
- **Props**: `records` (array).
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: History Page, Dashboard (Recent Activity).

### `TimelineItem`
- **Responsibility**: Wraps a `RecordCard` with a visual timeline indicator (line and dot).
- **Props**: `record`, `isLast`.
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Inside `Timeline`.

---

## Search

Components handling the Ask KisanVault AI search flow.

### `SearchBar`
- **Responsibility**: Large natural language input for asking questions.
- **Props**: `onSearch`, `isLoading`, `suggestions` (array of example queries).
- **Owns State**: Yes (Current input value).
- **Calls API**: No.
- **Where Reused**: Search Page, optionally Navbar.

### `SearchResult / Answer Section`
- **Responsibility**: Renders the AI-generated text answer cleanly.
- **Props**: `answerText`.
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Search Page.

### `EvidenceViewer`
- **Responsibility**: Container displaying the source records used to generate the AI answer.
- **Props**: `sourceRecords` (array).
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Search Page (below `SearchResult`).

### `Evidence / Source Card`
- **Responsibility**: Specifically styled `RecordCard` highlighting why it was selected as evidence (e.g., showing exact matched text or record ID).
- **Props**: `record`.
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Inside `EvidenceViewer`.

---

## Summary

Components for aggregating data and charting.

### `SummaryCard`
- **Responsibility**: Displays high-level aggregated metrics (e.g., "Total Expenses").
- **Props**: `title`, `value`, `icon`, `trend` (optional).
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Summary Page, Dashboard.

### `Activity Chart`
- **Responsibility**: Renders a bar chart showing activity distribution.
- **Props**: `data` (array).
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Summary Page.

### `Expense Chart`
- **Responsibility**: Renders a pie or donut chart showing cost breakdown.
- **Props**: `data` (array).
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Summary Page.

### `Harvest/Revenue Section`
- **Responsibility**: Specialized layout combining harvest yields with corresponding revenue totals.
- **Props**: `harvestData` (array), `totalRevenue` (number).
- **Owns State**: No.
- **Calls API**: No.
- **Where Reused**: Summary Page.
