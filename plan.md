

# PROJECT OVERVIEW
Build an AI-powered digital farm history platform where farmers can store, organize, search, and retrieve their farming records using natural language. Every AI-generated response must link back to the original stored record.

Domain

Agritech — Sustainable Solutions

Background

Farmers generate valuable information throughout every farming cycle, including:

Crop activities
Field preparation
Irrigation
Fertilizer application
Pesticide usage
Expenses
Harvest information
Seasonal observations

However, these records are often maintained across notebooks, paper documents, photographs, bills, and personal records.

An AI-powered digital farm history system can organize these records into a structured timeline and make past farming information easier to search, understand, and reuse.

The Pain Point
Important farm information is often scattered across different records and is difficult to retrieve when needed
Farmers may remember that an activity was performed but may not remember the exact date, quantity, cost, or field where it was performed
Without an organized digital history, it becomes difficult to:
Compare previous seasons
Understand field-level patterns
Use past records to support future farming decisions
Core Requirements
Maintain structured digital records for fields, crops, activities, inputs, expenses, and harvests
Organize farm information chronologically by field, crop, and season
Allow users to search farm history using natural-language queries
Support filtering by field, crop, activity, and season
Retrieve relevant historical records based on the user's question
Display the source record or evidence supporting the generated response
Generate useful summaries from previous farming activities
Maintain traceability between AI-generated responses and stored farm records
Evaluation Metrics
Historical Retrieval Accuracy — how accurately relevant farm records are retrieved
Record Organization Quality — how effectively information is structured by field, crop, activity, and season
Evidence Traceability — whether generated answers can be validated against the original farm records
Natural-Language Query Accuracy — how effectively the system understands farmer queries
Response Usefulness — how clearly historical information is presented
Data Consistency — how reliably the system maintains accurate farm records

---


# TECH STACK

```
Frontend     → *Next.js (framework)+ Tailwind CSS
Backend      → Python + FastAPI
Database     → PostgreSQL
AI/NLP       → LangChain + Groq API
embedding    → BAAI/bge-small-en-v1.5
Vector DB    → ChromaDB (local, no extra cost)
Auth         → JWT
ORM          → SQLAlchemy
Migration    → Alembic
```

---

# FOLDER STRUCTURE

```
/farm-history-platform
│
├── /frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── RecordCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   └── EvidenceViewer.jsx
│   │   ├── /pages
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddRecord.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Search.jsx
│   │   │   └── Summary.jsx
│   │   ├── /api
│   │   │   └── axios.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── /backend
│   ├── /app
│   │   ├── /models
│   │   │   ├── user.py
│   │   │   ├── field.py
│   │   │   ├── crop.py
│   │   │   ├── activity.py
│   │   │   ├── expense.py
│   │   │   └── harvest.py
│   │   ├── /routes
│   │   │   ├── auth.py
│   │   │   ├── records.py
│   │   │   ├── search.py
│   │   │   └── summary.py
│   │   ├── /services
│   │   │   ├── ai_service.py
│   │   │   ├── vector_service.py
│   │   │   └── summary_service.py
│   │   ├── /schemas
│   │   │   ├── record_schema.py
│   │   │   └── user_schema.py
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   ├── /migrations
│   └── requirements.txt
│
├── /vector_store
│   └── chroma_db/
│
├── .env
└── README.md
```

---

# DATABASE SCHEMA

## 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP
);
```

## 2. Fields Table
```sql
CREATE TABLE fields (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  field_name VARCHAR(100),
  location TEXT,
  area_acres FLOAT,
  created_at TIMESTAMP
);
```

## 3. Crops Table
```sql
CREATE TABLE crops (
  id UUID PRIMARY KEY,
  field_id UUID REFERENCES fields(id),
  crop_name VARCHAR(100),
  season VARCHAR(50),
  sowing_date DATE,
  expected_harvest_date DATE,
  status VARCHAR(50)
);
```

## 4. Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  crop_id UUID REFERENCES crops(id),
  field_id UUID REFERENCES fields(id),
  activity_type VARCHAR(100),
  -- types: irrigation, fertilizer, pesticide, 
  --        field_preparation, observation
  description TEXT,
  quantity FLOAT,
  unit VARCHAR(50),
  date DATE,
  cost FLOAT,
  created_at TIMESTAMP
);
```

## 5. Expenses Table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  field_id UUID REFERENCES fields(id),
  crop_id UUID REFERENCES crops(id),
  expense_type VARCHAR(100),
  amount FLOAT,
  description TEXT,
  date DATE,
  created_at TIMESTAMP
);
```

## 6. Harvests Table
```sql
CREATE TABLE harvests (
  id UUID PRIMARY KEY,
  crop_id UUID REFERENCES crops(id),
  field_id UUID REFERENCES fields(id),
  harvest_date DATE,
  quantity FLOAT,
  unit VARCHAR(50),
  quality_notes TEXT,
  selling_price FLOAT,
  total_revenue FLOAT,
  created_at TIMESTAMP
);
```

---

# BACKEND — API ENDPOINTS

## Auth Routes
```
POST   /api/auth/register     → Register new user
POST   /api/auth/login        → Login, return JWT token
GET    /api/auth/me           → Get current user info
```

## Record Routes
```
POST   /api/records/field          → Add new field
GET    /api/records/fields         → Get all fields
POST   /api/records/crop           → Add new crop
GET    /api/records/crops          → Get all crops
POST   /api/records/activity       → Add new activity
GET    /api/records/activities     → Get all activities
POST   /api/records/expense        → Add new expense
GET    /api/records/expenses       → Get all expenses
POST   /api/records/harvest        → Add new harvest
GET    /api/records/harvests       → Get all harvests
GET    /api/records/timeline       → Get all records 
                                     chronologically
GET    /api/records/filter         → Filter by field/
                                     crop/activity/season
```

## Search Routes
```
POST   /api/search/query      → Natural language query
                                returns answer + 
                                source records
```

## Summary Routes
```
GET    /api/summary/season    → Season-wise summary
GET    /api/summary/field     → Field-wise summary
GET    /api/summary/crop      → Crop-wise summary
```

---

# AI SERVICE — DETAILED LOGIC

## Step 1 — Embedding & Storing Records
```python
# vector_service.py

# When any record is added to PostgreSQL,
# immediately create a text representation
# and store it in ChromaDB

def embed_and_store(record):
    text = f"""
    Field: {record.field_name}
    Crop: {record.crop_name}
    Season: {record.season}
    Activity: {record.activity_type}
    Description: {record.description}
    Date: {record.date}
    Cost: {record.cost}
    Quantity: {record.quantity}
    """
    # Store in ChromaDB with record ID as metadata
    chroma_collection.add(
        documents=[text],
        metadatas=[{"record_id": str(record.id),
                    "table": record.table_name}],
        ids=[str(record.id)]
    )
```

## Step 2 — Natural Language Query
```python
# ai_service.py

def handle_query(user_query, user_id):

    # 1. Search ChromaDB for relevant records
    results = chroma_collection.query(
        query_texts=[user_query],
        n_results=5
    )

    # 2. Get matching record IDs
    record_ids = [r['record_id'] 
                  for r in results['metadatas'][0]]

    # 3. Fetch full records from PostgreSQL
    source_records = fetch_records_by_ids(record_ids)

    # 4. Build context for GPT
    context = build_context(source_records)

    # 5. Call OpenAI GPT
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": 
             "You are a farm assistant. Answer using 
              only the provided farm records. 
              Be specific and factual."},
            {"role": "user", "content": 
             f"Records:\n{context}\n\n
               Question: {user_query}"}
        ]
    )

    # 6. Return answer + source records
    return {
        "answer": response.choices[0].message.content,
        "source_records": source_records
    }
```

## Step 3 — Summary Generation
```python
# summary_service.py

def generate_season_summary(field_id, season):

    # Fetch all records for this field and season
    activities = get_activities(field_id, season)
    expenses   = get_expenses(field_id, season)
    harvests   = get_harvests(field_id, season)

    # Build summary prompt
    prompt = f"""
    Summarize this farming season:
    Activities: {activities}
    Total Expenses: {sum(e.amount for e in expenses)}
    Harvest: {harvests}
    Give a clear, useful summary for the farmer.
    """

    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content
```

---

# FRONTEND — PAGE BY PAGE

## 1. Login Page
- Email + password form
- JWT token stored in localStorage
- Redirect to Dashboard on success

## 2. Dashboard Page
- Welcome message with farmer name
- Quick stats cards:
  - Total Fields
  - Active Crops
  - Total Expenses This Season
  - Last Harvest Date
- Recent activity timeline (last 5 records)
- Quick action buttons:
  - Add Record
  - Search History
  - View Summary

## 3. Add Record Page
- Tabbed form:
  - Tab 1 → Add Field
  - Tab 2 → Add Crop
  - Tab 3 → Add Activity
  - Tab 4 → Add Expense
  - Tab 5 → Add Harvest
- Each form has relevant fields
- On submit → saves to PostgreSQL + embeds in ChromaDB

## 4. History Page
- Full chronological timeline of all records
- Filter panel on left side:
  - Filter by Field
  - Filter by Crop
  - Filter by Activity Type
  - Filter by Season
  - Filter by Date Range
- Each record card shows:
  - Record type (icon)
  - Date
  - Field name
  - Crop name
  - Key details
  - Season

## 5. Search Page
- Large natural-language search bar
- Example queries shown as chips:
  - "How much water did I use last season?"
  - "What was my wheat harvest in 2024?"
  - "Total fertilizer cost for Field A?"
- After search:
  - AI Answer displayed clearly
  - Below answer → Source Records section
  - Each source record shown as a card
  - Record ID + full details visible
  - This satisfies EVIDENCE TRACEABILITY

## 6. Summary Page
- Dropdown to select Field + Season
- AI-generated summary paragraph
- Stats cards:
  - Total Activities
  - Total Expenses
  - Total Harvest Quantity
  - Total Revenue
- Activity breakdown chart (bar chart)
- Expense breakdown chart (pie chart)

---

# ENVIRONMENT VARIABLES

```env
DATABASE_URL=postgresql://user:password@localhost/farmdb
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_jwt_secret
CHROMA_PATH=./vector_store/chroma_db
```

---

# SAMPLE DATA TO ADD FOR DEMO

```
User: Demo Farmer

Field 1: North Field — 5 acres
  Crop: Wheat — Rabi Season 2024
    Activities:
      - Field Preparation — 01 Oct 2024
      - Irrigation — 15 Oct 2024 — 500 litres
      - Fertilizer — 20 Oct 2024 — 10kg — ₹500
      - Pesticide — 05 Nov 2024 — 2 litres — ₹300
    Harvest:
      - 15 Jan 2025 — 800kg — ₹24,000 revenue

Field 2: South Field — 3 acres
  Crop: Rice — Kharif Season 2024
    Activities:
      - Irrigation — 10 Jun 2024 — 800 litres
      - Fertilizer — 20 Jun 2024 — 15kg — ₹750
    Harvest:
      - 20 Sep 2024 — 600kg — ₹18,000 revenue
```

---

# EVALUATION METRIC COVERAGE

| Metric | How it is covered |
|---|---|
| Historical Retrieval Accuracy | ChromaDB semantic search retrieves correct records |
| Record Organization Quality | PostgreSQL schema organized by field/crop/season |
| Evidence Traceability | Source records shown below every AI answer |
| NL Query Accuracy | LangChain + GPT handles varied farmer questions |
| Response Usefulness | Clean answer format + summary cards in UI |
| Data Consistency | PostgreSQL constraints + validated input forms |

---

# BUILD ORDER FOR AGENT

```
Step 1 → Setup PostgreSQL database and all tables
Step 2 → Build FastAPI backend with all routes
Step 3 → Setup ChromaDB and embedding logic
Step 4 → Build AI query service with GPT
Step 5 → Build summary generation service
Step 6 → Build React frontend — all pages
Step 7 → Connect frontend to backend via Axios
Step 8 → Add sample demo data
Step 9 → Test all NL queries end to end
Step 10 → Final UI polish and demo preparation
```

---

This plan is complete and ready to hand directly to an agent or developer. Want me to generate the actual starter code files for any specific part?