# 🌾 KisanVault

### 🚜 AI-Powered Digital Farm History

> **📥 Store &nbsp;→&nbsp; 🔎 Search &nbsp;→&nbsp; 🧠 Understand &nbsp;→&nbsp; 📚 Trace**
>
> 🌟 **Your Farm's History, Organized and Searchable.**

---

## 📑 Table of Contents

- [🌾 About](#-about)
- [🎯 Problem](#-problem)
- [💡 Proposed Solution](#-proposed-solution)
- [✨ Key Features](#-key-features)
- [🧱 System Architecture](#-system-architecture)
- [🔧 Technology Stack](#-technology-stack)
- [📁 Project Structure](#-project-structure)
- [📦 Database Design](#-database-design)
- [🔌 API Endpoints](#-api-endpoints)
- [🧠 AI & RAG Workflow](#-ai--rag-workflow)
- [🔐 Environment Variables](#-environment-variables)
- [🚀 Installation & Setup](#-installation--setup)
- [🧪 Testing](#-testing)
- [📊 Evaluation Metrics](#-evaluation-metrics)
- [👥 Team & Module Ownership](#-team--module-ownership)
- [🌿 Demo Data](#-demo-data)
- [🔄 Development Workflow](#-development-workflow)
- [🔒 Security](#-security)
- [🎯 Project Goal](#-project-goal)
- [📚 Documentation](#-documentation)
- [📄 License](#-license)

---

## 🌾 About

**KisanVault** is an AI-powered digital farm history platform that helps farmers **store, organize, search, and retrieve their farming records using natural language**.

Farmers can maintain records of **fields, crops, farming activities, expenses, and harvests** in one structured digital platform. The system uses **semantic search and AI** to answer questions about historical farm records.

> 🔑 **Key feature: Evidence Traceability.** Every AI-generated response is linked back to the original stored farm record, so answers can always be verified.

---

## 🎯 Problem

Farmers generate valuable information throughout every farming cycle:

| 🌱 Records | 📝 Examples |
| :--- | :--- |
| 🌾 Crop activities | Sowing, weeding, seasonal work |
| 🚜 Field preparation | Ploughing, levelling |
| 💧 Irrigation | Water quantity and dates |
| 🧪 Fertilizer application | Type, quantity, cost |
| 🐛 Pesticide usage | Product, quantity, cost |
| 💸 Farming expenses | Labour, seeds, equipment |
| 🧺 Harvest information | Quantity, quality, revenue |
| 🌦️ Seasonal observations | Notes on weather and crop health |

These records are often **scattered** across notebooks, paper documents, photographs, bills, and personal records.

This makes it difficult to answer questions such as:

> 💬 *"How much fertilizer did I use on the North Field last season?"*

or:

> 💬 *"What was my wheat harvest in 2024?"*

✅ **KisanVault converts these scattered records into a structured, searchable digital farm history.**

---

## 💡 Proposed Solution

KisanVault provides a centralized platform where farmers can:

- 🏞️ Create and manage **fields**
- 🌾 Record **crops and seasons**
- 🚜 Record **farming activities**
- 💰 Track **expenses**
- 🧺 Record **harvest information**
- 📅 View **chronological farm history**
- 🎛️ **Filter** records by field, crop, activity, and season
- 🗣️ Ask questions using **natural language**
- 🧠 Retrieve relevant historical records using **semantic search**
- 📊 Generate **seasonal and field-wise summaries**
- 📚 View the **source records** supporting AI-generated answers

---

## ✨ Key Features

### 📋 Digital Farm Records

Maintain structured records for:

- 🏞️ Fields
- 🌾 Crops
- 🗓️ Seasons
- 🚜 Activities
- 💰 Expenses
- 🧺 Harvests

### 📅 Farm History Timeline

View farming activities chronologically and filter them by:

- 🏞️ Field
- 🌾 Crop
- 🔧 Activity type
- 🗓️ Season
- 📆 Date range

### 🤖 AI Natural-Language Search

Farmers can ask questions in normal language instead of manually searching through records.

```text
How much fertilizer did I use last season on the North Field?
```

```text
What was my rice harvest in September 2024?
```

```text
What was the total fertilizer cost for the North Field?
```

### 🔎 Semantic Search

Farm records are converted into **embeddings** and stored in **ChromaDB**, so relevant historical records can be retrieved based on the **meaning** of the farmer's question.

### 📊 Seasonal Summaries

Generate summaries containing:

- 🔢 Total activities
- 💸 Total expenses
- 🧺 Harvest quantity
- 💵 Revenue
- 🥧 Activity breakdown
- 🧾 Expense breakdown

### 📚 Evidence Traceability

KisanVault does **not** rely only on an AI-generated response. Every answer is returned together with the source records it came from.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '15px', 'lineColor': '#607D8B'}}}%%
flowchart LR
    q(["👨‍🌾 Farmer Question"]):::start
    s{{"🔎 Semantic Search"}}:::ai
    ids["🆔 Relevant Record IDs"]:::data
    src[("🗄️ Fetch Original Records")]:::db
    gen{{"🤖 AI Generates Answer"}}:::ai
    out(["✅ Answer + Source Records"]):::done

    q ==> s ==> ids ==> src ==> gen ==> out
    src -. "evidence attached" .-> out

    classDef start fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef ai fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef data fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#E65100
    classDef db fill:#E8EAF6,stroke:#3949AB,stroke-width:2px,color:#1A237E
    classDef done fill:#C8E6C9,stroke:#1B5E20,stroke-width:3px,color:#1B5E20
```

This allows farmers to **verify the information** behind every AI response.

---

## 🧱 System Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '16px', 'lineColor': '#546E7A'}}}%%
flowchart TB
    farmer(["👨‍🌾 FARMER · Web / Mobile"]):::user

    subgraph FE["⚛️ FRONTEND · React.js + Tailwind CSS"]
        fe["📋 Dashboard · ➕ Add / Edit Records · 🕒 Timeline View · 🔎 Search (NL Query)<br>🎛️ Filter Panel · 📊 Summary Cards · 📈 Charts · 🧾 Evidence Viewer"]:::fe
    end

    subgraph BE["⚡ BACKEND · FastAPI"]
        be["🔐 Authentication (JWT) · 📝 CRUD Operations · ⚙️ Business Logic<br>✅ Data Validation · 🔎 Filtering and Search · 📊 Summary Generation"]:::be
    end

    subgraph PGS["🐘 POSTGRESQL · Structured Storage"]
        pg["👤 Users · 🏞️ Fields · 🌾 Crops<br>🚜 Activities · 💰 Expenses · 🧺 Harvests"]:::db
    end

    subgraph AIS["🧠 AI SERVICES"]
        lc["🦜 LangChain<br>Orchestration and Chains"]:::ai
        gpt["🤖 OpenAI GPT API"]:::ai
    end

    subgraph SEC["🛡️ ENVIRONMENT AND SECURITY"]
        sec["🔑 JWT Authentication · 📄 Environment Variables (.env)<br>🗝️ API Key Management · 🔒 HTTPS Communication"]:::sec
    end

    subgraph CHS["🧬 CHROMADB · Vector Database"]
        ch["🧬 Embeddings · 🔎 Semantic Search<br>🏷️ Record Metadata · 🆔 Record IDs"]:::vec
    end

    farmer <-->|"Login, Ask, View"| fe
    fe <-->|"REST API (HTTPS)"| be
    be <-->|"Read / Write Records"| pg
    be <-->|"API Calls (HTTPS)"| lc
    be -.->|"protected by"| sec
    lc -->|"LLM calls"| gpt
    lc <-->|"Store / Retrieve Embeddings"| ch
    pg <-->|"Fetch Full Records by ID"| ch

    classDef user fill:#E8F5E9,stroke:#2E7D32,stroke-width:3px,color:#1B5E20
    classDef fe fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef be fill:#EDE7F6,stroke:#5E35B1,stroke-width:2px,color:#311B92
    classDef db fill:#E8EAF6,stroke:#3949AB,stroke-width:2px,color:#1A237E
    classDef ai fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    classDef sec fill:#FFF8E1,stroke:#F9A825,stroke-width:2px,color:#E65100
    classDef vec fill:#E0F2F1,stroke:#00796B,stroke-width:2px,color:#004D40

    style FE fill:#F5FAFF,stroke:#1565C0,stroke-dasharray: 5 5
    style BE fill:#F7F4FD,stroke:#5E35B1,stroke-dasharray: 5 5
    style PGS fill:#F6F7FD,stroke:#3949AB,stroke-dasharray: 5 5
    style AIS fill:#FEF5F8,stroke:#C2185B,stroke-dasharray: 5 5
    style SEC fill:#FFFDF3,stroke:#F9A825,stroke-dasharray: 5 5
    style CHS fill:#F3FAF9,stroke:#00796B,stroke-dasharray: 5 5
```

### 🤖 AI Response Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '15px', 'lineColor': '#546E7A'}}}%%
flowchart LR
    s1["1️⃣ Farmer Question<br>Natural Language"]:::step
    s2["2️⃣ Semantic Search<br>ChromaDB"]:::step
    s3["3️⃣ Get Record IDs<br>Metadata"]:::step
    s4["4️⃣ Fetch Records<br>PostgreSQL"]:::step
    s5["5️⃣ Generate Answer<br>LangChain + GPT"]:::step
    s6(["6️⃣ Answer + Evidence<br>Record IDs and Details"]):::done

    s1 ==> s2 ==> s3 ==> s4 ==> s5 ==> s6

    classDef step fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#01579B
    classDef done fill:#C8E6C9,stroke:#1B5E20,stroke-width:3px,color:#1B5E20
```

---

## 🔧 Technology Stack

| Layer | Technology | Icon |
| :--- | :--- | :---: |
| 🎨 **Frontend** | React.js | ⚛️ |
| 💅 **Styling** | Tailwind CSS | 🌬️ |
| 📈 **Charts** | Chart.js / Recharts | 📊 |
| ⚙️ **Backend** | Python + FastAPI | 🐍 |
| 🗄️ **Database** | PostgreSQL | 🐘 |
| 🔗 **ORM** | SQLAlchemy | 🧩 |
| 🔀 **Migrations** | Alembic | 🧬 |
| 🧠 **AI / NLP** | LangChain | 🦜 |
| 🤖 **LLM** | OpenAI GPT API | ✨ |
| 🧬 **Vector Database** | ChromaDB | 🔎 |
| 🔐 **Authentication** | JWT | 🪪 |
| 🔌 **API Communication** | REST | 🌐 |

---

## 📁 Project Structure

```text
🌾 KisanVault/
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── 🧩 components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── RecordCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   └── EvidenceViewer.jsx
│   │   │
│   │   ├── 📄 pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddRecord.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Search.jsx
│   │   │   └── Summary.jsx
│   │   │
│   │   ├── 🔌 api/
│   │   │   └── axios.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── ⚙️ backend/
│   ├── app/
│   │   ├── 🗃️ models/
│   │   │   ├── user.py
│   │   │   ├── field.py
│   │   │   ├── crop.py
│   │   │   ├── activity.py
│   │   │   ├── expense.py
│   │   │   └── harvest.py
│   │   │
│   │   ├── 🛣️ routes/
│   │   │   ├── auth.py
│   │   │   ├── records.py
│   │   │   ├── search.py
│   │   │   └── summary.py
│   │   │
│   │   ├── 🧠 services/
│   │   │   ├── ai_service.py
│   │   │   ├── vector_service.py
│   │   │   └── summary_service.py
│   │   │
│   │   ├── 📐 schemas/
│   │   │   ├── record_schema.py
│   │   │   └── user_schema.py
│   │   │
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── 🔀 migrations/
│   └── requirements.txt
│
├── 🐘 database/
│
├── 🤖 ai/
│
├── 🧬 vector_store/
│   └── chroma_db/
│
├── 📚 docs/
│
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## 📦 Database Design

KisanVault uses **PostgreSQL** as the structured source of farm records.

### 🔗 Entity Relationship Diagram

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%
erDiagram
    USERS ||--o{ FIELDS : owns
    FIELDS ||--o{ CROPS : grows
    CROPS ||--o{ ACTIVITIES : has
    CROPS ||--o{ EXPENSES : incurs
    CROPS ||--o{ HARVESTS : yields

    USERS {
        int id PK
        string name
        string email
        string password_hash
    }
    FIELDS {
        int id PK
        int user_id FK
        string name
        string location
        float area
    }
    CROPS {
        int id PK
        int field_id FK
        string crop_name
        string season
        date sowing_date
        date expected_harvest_date
        string status
    }
    ACTIVITIES {
        int id PK
        int crop_id FK
        string activity_type
        string description
        float quantity
        string unit
        date activity_date
        float cost
    }
    EXPENSES {
        int id PK
        int crop_id FK
        string expense_type
        float amount
        string description
        date expense_date
    }
    HARVESTS {
        int id PK
        int crop_id FK
        date harvest_date
        float quantity
        string unit
        string quality_notes
        float selling_price
        float total_revenue
    }
```

### 📋 Entity Summary

| Entity | Stores |
| :--- | :--- |
| 👤 **Users** | Farmer account information |
| 🏞️ **Fields** | Field name, location, area, owner |
| 🌾 **Crops** | Crop name, season, sowing date, expected harvest date, status |
| 🚜 **Activities** | Activity type, description, quantity, unit, date, cost |
| 💰 **Expenses** | Expense type, amount, description, date |
| 🧺 **Harvests** | Harvest date, quantity, unit, quality notes, selling price, total revenue |

**Example activity types:** 💧 Irrigation · 🧪 Fertilizer · 🐛 Pesticide · 🚜 Field preparation · 👁️ Observation

---

## 🔌 API Endpoints

### 🔐 Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### 📝 Records

```http
POST /api/records/field
GET  /api/records/fields

POST /api/records/crop
GET  /api/records/crops

POST /api/records/activity
GET  /api/records/activities

POST /api/records/expense
GET  /api/records/expenses

POST /api/records/harvest
GET  /api/records/harvests

GET  /api/records/timeline
GET  /api/records/filter
```

### 🤖 AI Search

```http
POST /api/search/query
```

**Returns:**

```json
{
  "answer": "...",
  "source_records": []
}
```

### 📊 Summaries

```http
GET /api/summary/season
GET /api/summary/field
GET /api/summary/crop
```

---

## 🧠 AI & RAG Workflow

### 📥 When a new farm record is created

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '15px', 'lineColor': '#607D8B'}}}%%
flowchart LR
    subgraph INDEX["📥 INDEXING PIPELINE"]
        direction LR
        a(["📝 Farm Record"]):::start
        b["📄 Create Text<br>Representation"]:::step
        c{{"🧬 Generate<br>Embedding"}}:::ai
        d[("🗃️ Store in<br>ChromaDB")]:::vector
        e["🆔 Save Record ID<br>as Metadata"]:::done
        a ==> b ==> c ==> d ==> e
    end

    classDef start fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef step fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef ai fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef vector fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#E65100
    classDef done fill:#C8E6C9,stroke:#1B5E20,stroke-width:3px,color:#1B5E20
    style INDEX fill:#FAFAFA,stroke:#90A4AE,stroke-dasharray: 5 5
```

### 🗣️ When a farmer asks a question

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%
sequenceDiagram
    autonumber
    actor F as 👨‍🌾 Farmer
    participant UI as ⚛️ React UI
    participant API as ⚡ FastAPI
    participant VDB as 🧬 ChromaDB
    participant PG as 🐘 PostgreSQL
    participant LLM as 🤖 LangChain + GPT

    F->>UI: Ask a natural language question
    UI->>API: POST /api/search/query
    API->>VDB: Semantic search
    VDB-->>API: Relevant record IDs
    API->>PG: Fetch original records by ID
    PG-->>API: Complete source records
    API->>LLM: Question + source records
    Note over API,LLM: The AI answers only from the retrieved records
    LLM-->>API: Grounded answer
    API-->>UI: answer + source_records
    UI-->>F: ✅ Answer with evidence
```

> 🛑 The AI is instructed to answer **using the retrieved farm records** rather than generating unsupported farm information.

---

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost/farmdb

OPENAI_API_KEY=your_openai_api_key

JWT_SECRET=your_jwt_secret

CHROMA_PATH=./vector_store/chroma_db
```

> [!WARNING]
> Never commit `.env` or API keys to GitHub.

---

## 🚀 Installation & Setup

### 📥 1. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd KisanVault
```

### ⚙️ 2. Backend Setup

Create a Python virtual environment:

```bash
cd backend

python -m venv venv
```

Activate it.

**🪟 Windows**

```bash
venv\Scripts\activate
```

**🐧 Linux / 🍎 macOS**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the environment variables:

```bash
cp .env.example .env
```

> ✏️ Update `.env` with your PostgreSQL and OpenAI credentials.

Run the backend:

```bash
uvicorn app.main:app --reload
```

### 🎨 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 🧪 Testing

The system should be tested using different types of natural-language questions.

**Example queries:**

```text
How much fertilizer did I use last season on the North Field?

What was my wheat harvest in 2024?

What was the total fertilizer cost for the North Field?

Show me all irrigation activities for the North Field.

How much did I spend on pesticides?

Give me a summary of my Rabi 2024 season.
```

**For every AI query, verify:**

- [x] 🔎 Relevant records retrieved
- [x] 🏞️ Correct field, crop and season
- [x] 🔢 Correct calculations
- [x] 🗄️ Answer based on stored records
- [x] 📚 Source records displayed
- [x] 🚫 No unsupported information generated

---

## 📊 Evaluation Metrics

| 📏 Metric | 🌾 KisanVault Implementation |
| :--- | :--- |
| 🎯 **Historical Retrieval Accuracy** | ChromaDB semantic retrieval |
| 🗂️ **Record Organization Quality** | PostgreSQL field / crop / season structure |
| 📚 **Evidence Traceability** | Source records displayed with AI answers |
| 🗣️ **Natural-Language Query Accuracy** | LangChain + OpenAI GPT |
| 💡 **Response Usefulness** | Clean answers, dashboards and summaries |
| 🛡️ **Data Consistency** | Validated forms, PostgreSQL constraints and migrations |

---

## 👥 Team & Module Ownership

| 👤 Member | 📦 Module | 🎯 Responsibility |
| :--- | :--- | :--- |
| 🎨 **Yash** | `frontend/` | React UI and frontend |
| ⚙️ **Saqib** | `backend/` | FastAPI backend and APIs |
| 🐘 **Arnav** | `database/` | PostgreSQL schema and migrations |
| 🤖 **Saqib** | `ai/` | AI, LangChain and semantic search |
| 📚 **Param** | `docs/` | Documentation, architecture and presentation |

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '15px', 'lineColor': '#607D8B'}}}%%
flowchart LR
    yash(["🎨 Yash"]):::person --> fe["frontend/"]:::mod
    saqib(["⚙️ Saqib"]):::person --> be["backend/"]:::mod
    saqib --> ai["ai/"]:::mod
    arnav(["🐘 Arnav"]):::person --> db["database/"]:::mod
    param(["📚 Param"]):::person --> docs["docs/"]:::mod

    classDef person fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef mod fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
```

The GitHub contribution workflow, branch rules and module ownership are defined in `CONTRIBUTING.md`.

---

## 🌿 Demo Data

The project can be demonstrated using sample farm records such as:

### 🌾 Field 1: North Field

```text
Area:   5 acres
Crop:   Wheat
Season: Rabi 2024

Activities:
- Field Preparation - 01 Oct 2024
- Irrigation        - 15 Oct 2024 - 500 litres
- Fertilizer        - 20 Oct 2024 - 10 kg      - ₹500
- Pesticide         - 05 Nov 2024 - 2 litres   - ₹300

Harvest:
- 15 Jan 2025
- 800 kg
- ₹24,000 revenue
```

### 🍚 Field 2: South Field

```text
Area:   3 acres
Crop:   Rice
Season: Kharif 2024

Activities:
- Irrigation - 10 Jun 2024 - 800 litres
- Fertilizer - 20 Jun 2024 - 15 kg - ₹750

Harvest:
- 20 Sep 2024
- 600 kg
- ₹18,000 revenue
```

### 🗓️ Season Timeline

```mermaid
%%{init: {'theme': 'base'}}%%
timeline
    title 🌾 Demo Farm Seasons
    section Kharif 2024 - South Field (Rice)
        10 Jun 2024 : 💧 Irrigation - 800 litres
        20 Jun 2024 : 🧪 Fertilizer - 15 kg
        20 Sep 2024 : 🧺 Harvest - 600 kg
    section Rabi 2024 - North Field (Wheat)
        01 Oct 2024 : 🚜 Field Preparation
        15 Oct 2024 : 💧 Irrigation - 500 litres
        20 Oct 2024 : 🧪 Fertilizer - 10 kg
        05 Nov 2024 : 🐛 Pesticide - 2 litres
        15 Jan 2025 : 🧺 Harvest - 800 kg
```

### 💸 North Field Expenses (₹)

```mermaid
%%{init: {'theme': 'base'}}%%
pie showData
    title North Field - Rabi 2024 Expenses (₹)
    "🧪 Fertilizer" : 500
    "🐛 Pesticide" : 300
```

---

## 🔄 Development Workflow

All contributors should follow:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '15px', 'lineColor': '#546E7A'}}}%%
flowchart TD
    a["⬇️ Pull latest main"]:::local --> b["🌿 Create feature branch"]:::local
    b --> c["🛠️ Develop"]:::local
    c --> d["🧪 Test"]:::local
    d --> e["💾 Commit"]:::local
    e --> f["⬆️ Push"]:::remote
    f --> g["🔀 Pull Request"]:::remote
    g --> h["👀 Code Review"]:::remote
    h --> i(["✅ Merge into main"]):::done
    h -. "changes requested" .-> c

    classDef local fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef remote fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#E65100
    classDef done fill:#C8E6C9,stroke:#1B5E20,stroke-width:3px,color:#1B5E20
```

**Example:**

```bash
git checkout main
git pull origin main

git checkout -b feature/ai-search

# Make changes

git add .
git commit -m "feat: implement semantic farm search"

git push -u origin feature/ai-search
```

> [!CAUTION]
> **Never push directly to `main`.**

See `CONTRIBUTING.md` for the complete contribution workflow.

---

## 🔒 Security

The project uses **JWT-based authentication** for user access.

Important security practices:

- 🙈 Do not commit `.env`
- 🔑 Do not expose API keys
- 🧂 Store password hashes rather than plain-text passwords
- ✅ Validate API inputs
- 👤 Restrict farm records to the authenticated user
- 🚧 Protect private API endpoints

---

## 🎯 Project Goal

KisanVault aims to transform scattered farm records into a **structured, searchable, AI-powered digital farm history**.

The central idea:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '16px', 'lineColor': '#607D8B'}}}%%
flowchart LR
    a(["📥 STORE"]):::s1 ==> b(["🗂️ ORGANIZE"]):::s2 ==> c(["🔎 SEARCH"]):::s3 ==> d(["📤 RETRIEVE"]):::s4 ==> e(["🧠 UNDERSTAND"]):::s5 ==> f(["✅ VERIFY"]):::s6

    classDef s1 fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef s2 fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef s3 fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#E65100
    classDef s4 fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef s5 fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef s6 fill:#C8E6C9,stroke:#1B5E20,stroke-width:3px,color:#1B5E20
```

Every AI-generated response should remain connected to the underlying farm records, making historical farm information easier to access and validate.

---

## 📚 Documentation

Project documentation can be maintained in:

```text
/docs
```

Recommended documents:

```text
📚 docs/
├── 🏗️ architecture/
├── 🗄️ database/
├── 🔌 api/
├── 🖼️ screenshots/
└── 🎤 presentation/
```

---

## 📄 License

Add the project's chosen license here before public release.

---

## 🌾 KisanVault

**AI-Powered Digital Farm History**

> *Your Farm's History, Organized and Searchable.*

⭐ **If you like this project, give it a star!**
