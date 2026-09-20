# KisanVault — API Contract

This document defines the frontend-backend integration contract for the KisanVault application. It is based exclusively on the endpoints defined in the project plan. 

**IMPORTANT**: The frontend must not assume undocumented backend behavior. Where payload or response shapes are not explicitly detailed in the project plan, proposed fields derived from the database schema are provided but marked as requiring confirmation.

---

## Authentication

### `POST /api/auth/register`
- **Purpose**: Register a new user.
- **Request Fields**: 
  - `name` (string, *proposed from schema*)
  - `email` (string, *proposed from schema*)
  - `password` (string, *proposed from schema*)
- **Expected Response**: `TBD — backend/frontend contract must be confirmed` (Likely user object or success message).
- **Authentication**: None required.
- **Frontend Screen**: Registration Page.

### `POST /api/auth/login`
- **Purpose**: Authenticate user and return JWT.
- **Request Fields**: `TBD — backend/frontend contract must be confirmed` (Likely `email` and `password`).
- **Expected Response**: `TBD — backend/frontend contract must be confirmed` (Must include JWT token).
- **Authentication**: None required.
- **Frontend Screen**: Login Page.

### `GET /api/auth/me`
- **Purpose**: Get current authenticated user information.
- **Request Fields**: None.
- **Expected Response**: `TBD — backend/frontend contract must be confirmed` (Likely `id`, `name`, `email`).
- **Authentication**: Required (JWT).
- **Frontend Screen**: Application Layout (Navbar/Sidebar for displaying farmer name), Dashboard.

---

## Records

*All Record endpoints require JWT Authentication.*

### `POST /api/records/field`
- **Method**: POST
- **Path**: `/api/records/field`
- **Purpose**: Add a new field.
- **Request Payload**: 
  - `field_name` (string, *proposed*)
  - `location` (string, *proposed*)
  - `area_acres` (float, *proposed*)
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: Add Record Page (Field Tab).
- **Loading State**: Submit button spinner in Field Form.
- **Expected Error Handling**: Toast notification on failure; preserve form state.

### `GET /api/records/fields`
- **Method**: GET
- **Path**: `/api/records/fields`
- **Purpose**: Get all fields for the authenticated user.
- **Request Payload**: None.
- **Response Shape**: `TBD — backend/frontend contract must be confirmed` (List of Field objects).
- **Authentication**: Required.
- **Screen**: Add Record Page (Dropdowns), Dashboard, Filter Panels.
- **Loading State**: Skeleton dropdowns or loading spinners where dropdowns mount.
- **Expected Error Handling**: Fallback to empty list or display error message inline.

### `POST /api/records/crop`
- **Method**: POST
- **Path**: `/api/records/crop`
- **Purpose**: Add a new crop.
- **Request Payload**: 
  - `field_id` (uuid, *proposed*)
  - `crop_name` (string, *proposed*)
  - `season` (string, *proposed*)
  - `sowing_date` (string/date, *proposed*)
  - `expected_harvest_date` (string/date, *proposed*)
  - `status` (string, *proposed*)
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: Add Record Page (Crop Tab).
- **Loading State**: Submit button spinner in Crop Form.
- **Expected Error Handling**: Toast notification on failure.

### `GET /api/records/crops`
- **Method**: GET
- **Path**: `/api/records/crops`
- **Purpose**: Get all crops.
- **Request Payload**: None (or optional `field_id` query param).
- **Response Shape**: `TBD — backend/frontend contract must be confirmed` (List of Crop objects).
- **Authentication**: Required.
- **Screen**: Add Record Page (Dropdowns), Dashboard, Filter Panels.
- **Loading State**: Skeleton dropdowns.
- **Expected Error Handling**: Fallback to empty list or display error message.

### `POST /api/records/activity`
- **Method**: POST
- **Path**: `/api/records/activity`
- **Purpose**: Add a new farming activity.
- **Request Payload**: 
  - `crop_id` (uuid, *proposed*)
  - `field_id` (uuid, *proposed*)
  - `activity_type` (string: irrigation, fertilizer, pesticide, field_preparation, observation, *proposed*)
  - `description` (string, *proposed*)
  - `quantity` (float, *proposed*)
  - `unit` (string, *proposed*)
  - `date` (string/date, *proposed*)
  - `cost` (float, *proposed*)
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: Add Record Page (Activity Tab).
- **Loading State**: Submit button spinner in Activity Form.
- **Expected Error Handling**: Toast notification on failure.

### `GET /api/records/activities`
- **Method**: GET
- **Path**: `/api/records/activities`
- **Purpose**: Get all activities.
- **Request Payload**: None.
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: Dashboard, Summary Page.
- **Loading State**: Skeleton loaders for activity cards/charts.
- **Expected Error Handling**: Inline error state.

### `POST /api/records/expense`
- **Method**: POST
- **Path**: `/api/records/expense`
- **Purpose**: Add a new expense.
- **Request Payload**: 
  - `field_id` (uuid, *proposed*)
  - `crop_id` (uuid, *proposed*)
  - `expense_type` (string, *proposed*)
  - `amount` (float, *proposed*)
  - `description` (string, *proposed*)
  - `date` (string/date, *proposed*)
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: Add Record Page (Expense Tab).
- **Loading State**: Submit button spinner in Expense Form.
- **Expected Error Handling**: Toast notification on failure.

### `GET /api/records/expenses`
- **Method**: GET
- **Path**: `/api/records/expenses`
- **Purpose**: Get all expenses.
- **Request Payload**: None.
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: Summary Page, Dashboard.
- **Loading State**: Skeleton loaders for expense charts/cards.
- **Expected Error Handling**: Inline error state.

### `POST /api/records/harvest`
- **Method**: POST
- **Path**: `/api/records/harvest`
- **Purpose**: Add a new harvest record.
- **Request Payload**: 
  - `crop_id` (uuid, *proposed*)
  - `field_id` (uuid, *proposed*)
  - `harvest_date` (string/date, *proposed*)
  - `quantity` (float, *proposed*)
  - `unit` (string, *proposed*)
  - `quality_notes` (string, *proposed*)
  - `selling_price` (float, *proposed*)
  - `total_revenue` (float, *proposed*)
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: Add Record Page (Harvest Tab).
- **Loading State**: Submit button spinner in Harvest Form.
- **Expected Error Handling**: Toast notification on failure.

### `GET /api/records/harvests`
- **Method**: GET
- **Path**: `/api/records/harvests`
- **Purpose**: Get all harvests.
- **Request Payload**: None.
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: Summary Page, Dashboard.
- **Loading State**: Skeleton loaders.
- **Expected Error Handling**: Inline error state.

### `GET /api/records/timeline`
- **Method**: GET
- **Path**: `/api/records/timeline`
- **Purpose**: Get all records ordered chronologically.
- **Request Payload**: None.
- **Response Shape**: `TBD — backend/frontend contract must be confirmed` (Expected unified array of fields, crops, activities, expenses, harvests).
- **Authentication**: Required.
- **Screen**: History Page, Dashboard (Recent Activity).
- **Loading State**: Skeleton record cards.
- **Expected Error Handling**: Empty state fallback or error banner.

### `GET /api/records/filter`
- **Method**: GET
- **Path**: `/api/records/filter`
- **Purpose**: Filter records by field, crop, activity, or season.
- **Request Payload**: Query parameters: `field_id`, `crop_id`, `activity_type`, `season`.
- **Response Shape**: `TBD — backend/frontend contract must be confirmed`.
- **Authentication**: Required.
- **Screen**: History Page (Filter Panel).
- **Loading State**: Refreshing skeleton list or spinner overlay.
- **Expected Error Handling**: Toast notification and retain previous list state.

---

## Search

### `POST /api/search/query`
- **Purpose**: Natural language query returns AI answer and source records.
- **Query Input**: 
  - `query` (string, *proposed*) - e.g., "How much water did I use last season?"
- **AI Answer Response**: `TBD — backend/frontend contract must be confirmed` (String containing the LangChain/GPT response).
- **Source Records**: `TBD — backend/frontend contract must be confirmed` (Array of record objects retrieved from ChromaDB/PostgreSQL).
- **Evidence/Record ID Relationship**: The response must return source records with IDs that correspond to the AI answer to satisfy Evidence Traceability.
- **Authentication**: Required.
- **Screen**: Search / Ask KisanVault Page.

---

## Summary

*All Summary endpoints require JWT Authentication.*

### `GET /api/summary/season`
- **Purpose**: Get season-wise summary.
- **Required Parameters**: `TBD — backend/frontend contract must be confirmed` (Likely `season` and optionally `field_id` as query params).
- **Expected Response**: `TBD — backend/frontend contract must be confirmed` (AI-generated summary string + aggregated stats for activities, expenses, and harvests).
- **Consuming Screen**: Summary Page.
- **Charts/Data**: AI Summary Paragraph, Activity breakdown chart, Expense pie chart.

### `GET /api/summary/field`
- **Purpose**: Get field-wise summary.
- **Required Parameters**: `TBD — backend/frontend contract must be confirmed` (Likely `field_id`).
- **Expected Response**: `TBD — backend/frontend contract must be confirmed`.
- **Consuming Screen**: Summary Page.
- **Charts/Data**: Field-specific stats and charts.

### `GET /api/summary/crop`
- **Purpose**: Get crop-wise summary.
- **Required Parameters**: `TBD — backend/frontend contract must be confirmed` (Likely `crop_id`).
- **Expected Response**: `TBD — backend/frontend contract must be confirmed`.
- **Consuming Screen**: Summary Page.
- **Charts/Data**: Crop-specific yield and expense data.

---

## Backend Integration Checklist

For the frontend to connect successfully and avoid blocking development, the backend developer must provide the following:

1. **Exact Payload Schemas**: Confirmation of exact JSON keys for all `POST` payloads (especially for Add Record modes).
2. **Exact Response Shapes**: The JSON structure returned by all `GET` routes, especially nested objects or arrays.
3. **Timeline Union Shape**: Definition of how `/api/records/timeline` formats different record types (activities, expenses, harvests) into a single chronological array.
4. **Auth Handshake Details**: Expected format for the Login response (e.g., `{ "access_token": "...", "token_type": "bearer" }`).
5. **Search Response Shape**: Exact structure of the `/api/search/query` response, specifically how `source_records` are attached to the `answer` string.
6. **Summary Response Shape**: Exact structure of the `/api/summary/*` endpoints, confirming how chart data (aggregations) and the AI text paragraph are separated.
7. **Error Format**: Standardized error response structure (e.g., `{ "detail": "Error message" }`).
8. **CORS Configuration**: Backend must be configured to accept cross-origin requests from the Next.js development server (typically `http://localhost:3000`).
