# KisanVault — GitHub Contribution Guide

> **This is the single source of truth for Git/GitHub workflow in KisanVault.**
> All contributors must follow this workflow.

---

## 1. Repository Structure

```text
KisanVault/
├── frontend/     → Yash
├── backend/      → Saqib
├── database/     → Arnav
├── ai/           → Saqib
├── docs/         → Param
├── .gitignore
├── .env.example
├── README.md
└── CONTRIBUTING.md
```

### Module ownership

| Module      | Owner |
| ----------- | ----- |
| `frontend/` | Yash  |
| `backend/`  | Saqib |
| `database/` | Arnav |
| `ai/`       | Saqib |
| `docs/`     | Param |

If your feature requires changes in another person's module, coordinate with them first.

---

# 2. First-Time Setup

### Clone the repository

```bash
git clone <REPOSITORY_URL>
cd KisanVault
```

### Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your-github-email"
```

### Get the latest code

```bash
git checkout main
git pull origin main
```

Do **not** start development directly on `main`.

---

# 3. Branching Rules

`main` is the protected, stable branch.

Every task gets its own branch.

### Create a branch

```bash
git checkout main
git pull origin main
git checkout -b feature/<task-name>
```

Examples:

```text
feature/frontend-login
feature/backend-auth
feature/database-schema
feature/ai-search
feature/docs-architecture
```

For bugs:

```text
fix/login-error
fix/search-query
```

### Rules

* Never work directly on `main`.
* Never force-push to `main`.
* Don't reuse old branches for unrelated tasks.
* Keep one branch focused on one task.

---

# 4. Daily Workflow

The standard workflow is:

```text
Pull latest main
      ↓
Create / switch to feature branch
      ↓
Work
      ↓
Test
      ↓
Commit
      ↓
Push
      ↓
Pull Request
      ↓
Review
      ↓
Merge into main
```

---

# 5. Commit Rules

Make small, meaningful commits.

Format:

```text
<type>: <description>
```

Use:

```text
feat
fix
docs
refactor
test
chore
```

Examples:

```bash
git commit -m "feat: add field model"
git commit -m "fix: correct login validation"
git commit -m "docs: update setup instructions"
```

Avoid:

```text
update
changes
final
final2
done
```

---

# 6. Push Your Work

Check your changes:

```bash
git status
git diff
```

Stage and commit:

```bash
git add .
git commit -m "feat: description"
```

Push:

```bash
git push -u origin <branch-name>
```

---

# 7. Pull Requests

**All changes to `main` must go through a Pull Request.**

After pushing:

1. Open the GitHub repository.
2. Create a Pull Request.
3. Target branch: `main`.
4. Clearly describe what you changed.
5. Mention how you tested it.
6. Request review from the relevant teammate.
7. Resolve review comments.
8. Merge only after approval.

### PR title examples

```text
feat: implement login API
feat: add database schema
fix: resolve crop filtering
docs: add architecture diagram
```

---

# 8. Keeping Your Branch Updated

Before opening/merging a PR, make sure your branch has the latest `main`.

```bash
git checkout main
git pull origin main
git checkout <your-branch>
git merge main
```

If there are conflicts, resolve them before creating/merging the PR.

If a conflict involves another person's active work, coordinate with them instead of guessing.

---

# 9. Database Rules

Database changes must be tracked through the project's migration system.

Whenever the schema changes:

```text
Schema change
     ↓
Migration
     ↓
Test migration
     ↓
Commit
     ↓
Pull Request
```

Do not make database changes that exist only on your local machine.

Coordinate with **Arnav** before making changes that affect shared schema or existing relationships.

---

# 10. Secrets & `.env`

**Never commit secrets.**

Do not commit:

```text
.env
API keys
database passwords
JWT secrets
tokens
```

Use:

```text
.env.example
```

for placeholders.

If you accidentally commit a secret, immediately inform the repository maintainer and rotate the credential.

---

# 11. Before Opening a PR

Check:

```text
[ ] I am NOT on main
[ ] My branch contains only this task
[ ] Code has been tested
[ ] No secrets/.env committed
[ ] Database migration included if required
[ ] Changes are pushed
[ ] PR description is clear
```

---

# 12. After Your PR Is Merged

Update your local repository:

```bash
git checkout main
git pull origin main
```

Delete the completed branch:

```bash
git branch -d <branch-name>
```

Start the next task from the latest `main`.

---

# 13. If Something Goes Wrong

**Do not force-push, delete branches, or rewrite history blindly.**

Check:

```bash
git status
git branch
git log --oneline -10
```

If you're unsure, stop and contact **Arnav** before changing Git history.

---

# Golden Rule

```text
main → feature branch → work → test → commit → push
      → Pull Request → review → merge → main
```

**Never push directly to `main`.**
