# KisanVault - Work Done & Deployment Strategy

## 1. Work Completed So Far

### 1.1. Internationalization (i18n) & Localization
*   **Language Context**: Built a robust, centralized `LanguageContext` in React (`frontend/src/context/LanguageContext.jsx`) allowing instant UI translation.
*   **Dictionaries**: Created `translations.js` supporting **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
*   **UI Integration**: Fully localized the Dashboard, Auth (Login/Register), Sidebar, Mobile Navbar, Summary, and History pages.
*   **Dynamic AI Summaries**: Updated the FastAPI backend (`summary_service.py`) to accept a `lang` parameter, dynamically instructing the LLM to generate insights in the user's selected regional language without Markdown formatting.

### 1.2. Voice Input & RAG Search Pipeline
*   **Speech-to-Text**: Integrated `whisper-large-v3` via the Groq API for the main Search/RAG page.
*   **Audio Streaming**: Modified the frontend to capture audio via the MediaRecorder API and send standard WebM/Blob byte streams to the FastAPI backend.
*   **Model Stability**: Resolved Groq 400/404 deprecation errors by pinning the generative backend LLM to the highly stable `openai/gpt-oss-20b`.
*   **UI Feedback**: Added pulsing animations and real-time state management to indicate active voice listening.

### 1.3. Authentication & API Stability
*   **JWT & Error Handling**: Refactored `apiClient.js` to correctly throw standard Javascript `Error` objects instead of plain object literals, preventing Next.js 500 crash overlays and enabling smooth 401 Unauthorized handling.
*   **Mobile-to-Email Mapping**: Handled rural registration gracefully by accepting 10-digit mobile numbers on the frontend and mapping them to proxy emails (`[mobile]@kisanvault.com`) for the backend.
*   **Conflict Resolution**: Updated backend HTTP 409 Conflict errors to explicitly state that the "Mobile number or email" is already in use, preventing UI confusion.
*   **Session Management**: Added fully functioning Logout buttons to both Desktop (`Sidebar.jsx`) and Mobile (`MobileNav.jsx`) layouts, successfully clearing `localStorage` and routing the user safely.
*   **Dynamic User Data**: Replaced hardcoded dummy names (e.g., "Ramesh Patel") in the Navbar with the actual authenticated farmer's name fetched from the `/api/auth/me` endpoint.

---

## 2. Production Deployment Strategy

To move KisanVault from a local development environment to a scalable, production-grade cloud architecture, the following strategy must be implemented.

### 2.1. Relational Database Migration & Connection Pooling
Currently, the application uses a local SQLite database (`kisanvault.db`).
*   **Database Engine**: Migrate to **PostgreSQL**. It offers excellent concurrency handling and JSONB support if needed later. Managed services like AWS RDS, Supabase, or Neon are recommended.
*   **Schema Migrations (Alembic)**: 
    *   Initialize Alembic in the backend (`alembic init alembic`).
    *   Generate the initial migration script based on the SQLAlchemy `Base.metadata`.
    *   Integrate `alembic upgrade head` into the CI/CD pipeline prior to starting the FastAPI server.
*   **Connection Pooling**:
    *   **Application Level**: Configure SQLAlchemy's `QueuePool` in `database.py`. Set `pool_size=20`, `max_overflow=10`, and `pool_pre_ping=True` to handle moderate farmer traffic reliably.
    *   **Infrastructure Level (PgBouncer)**: For high scale, place `PgBouncer` (in transaction mode) in front of the PostgreSQL database to multiplex thousands of client connections onto a small number of actual database connections.

### 2.2. Vector Database Migration (Pinecone)
Currently, KisanVault uses a local ChromaDB instance for Semantic/RAG search. Moving to Pinecone will make the vector storage stateless and highly scalable.
*   **Index Creation**: Create a serverless Pinecone index named `kisanvault-index`. Set the dimension strictly to **384** to match the output of the current `BAAI/bge-small-en-v1.5` embedding model. Set the metric to `cosine`.
*   **Code Refactoring (`vector_service.py`)**:
    *   Remove `chromadb` dependencies.
    *   Initialize the Pinecone client (`from pinecone import Pinecone`).
    *   Update `embed_and_store()` to upsert vectors into the Pinecone index, attaching metadata (e.g., `user_id`, `record_id`, `text`).
    *   Update `search_similar_records()` to query the Pinecone index using the user's embedded search query, filtering strictly by the `user_id` in the Pinecone metadata filter object.
*   **Data Migration**: Write a one-off Python script to iterate through all existing records in the PostgreSQL `FarmRecord` table, embed their text, and batch upsert them into Pinecone.

### 2.3. Authentication Hardening
While the current stateless JWT architecture is highly scalable, it requires production hardening:
*   **Cookie-based JWTs**: Move the `kisanvault_jwt` from `localStorage` (which is vulnerable to XSS attacks) to an **HttpOnly, Secure, SameSite=Strict** cookie.
*   **FastAPI Update**: Update `get_current_user` in `auth.py` to read the token from the request cookies rather than the `Authorization` header.
*   **HTTPS Enforced**: Ensure all traffic is routed through HTTPS using Let's Encrypt or AWS ACM.

### 2.4. Infrastructure & Hosting
*   **Frontend (Next.js)**: Deploy to **Vercel**. It provides edge caching, automatic CI/CD from GitHub, and zero-configuration Next.js optimization.
*   **Backend (FastAPI)**: Deploy to **Render**, **Railway**, or **AWS App Runner**. Containerize the backend using a simple `Dockerfile` running Uvicorn with multiple Gunicorn workers (`gunicorn -k uvicorn.workers.UvicornWorker`).
*   **Environment Variables**: Securely inject the following into the hosting platforms:
    *   `DATABASE_URL` (PostgreSQL connection string)
    *   `JWT_SECRET` (A strong 256-bit randomly generated string)
    *   `GROQ_API_KEY` (For LLM and Whisper)
    *   `PINECONE_API_KEY` & `PINECONE_ENVIRONMENT` (For Vector Search)

### 2.5. CI/CD Pipeline
*   Use **GitHub Actions** to automatically lint the code, run standard unit tests, and trigger deployments on pushes to the `main` branch.
*   The deployment step should automatically execute database migrations (`alembic upgrade head`) before shifting traffic to the new backend containers.
