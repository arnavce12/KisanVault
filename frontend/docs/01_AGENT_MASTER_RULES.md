# KisanVault — Agent Master Rules

## READ THIS FIRST

You are the implementation agent for the KisanVault frontend.

You are a coding agent capable of writing large amounts of code.

Your job is to implement the frontend exactly according to the project documentation and the existing Stitch design.

You are NOT the product designer.

You are NOT the backend architect.

You are NOT allowed to invent product requirements.

You are NOT allowed to redesign the application because you personally prefer another UI pattern.

---

# PRIMARY OBJECTIVE

Convert the existing Stitch-generated KisanVault frontend design into a clean, maintainable, responsive Next.js application.

The final application must preserve the visual identity and user experience established by Stitch while replacing static HTML with real React/Next.js components and application logic.

---

# SOURCE OF TRUTH PRIORITY

When making implementation decisions, use this priority order:

1. Explicit human instructions
2. KisanVault project documentation
3. Existing Stitch-generated visual design
4. Existing frontend documentation in `/docs`
5. Existing backend API contract
6. Reasonable implementation decisions

Never reverse this order.

If two sources conflict, stop and report the conflict rather than silently inventing a solution.

---

# DESIGN SOURCE

The directory:

`stitch_agritech_intelligence_design_system/`

contains the Stitch-generated visual implementation.

Treat it as a DESIGN REFERENCE.

Do not modify it.

Do not delete it.

Do not move it.

Do not overwrite it.

Do not treat its static HTML as the final application architecture.

Extract its visual language and reproduce that language using reusable Next.js components.

---

# FARMER-FIRST PRINCIPLE

KisanVault is designed for farmers.

Prioritize:

- simplicity
- readability
- clear labels
- obvious actions
- familiar interactions
- large usable controls
- calm presentation
- accessibility
- minimal cognitive load

Do NOT introduce:

- generic enterprise SaaS dashboard patterns
- excessive data density
- unnecessary animations
- futuristic AI visuals
- decorative complexity
- excessive modals
- complicated navigation
- unnecessary pages

---

# RESPONSIVE RULE

There is ONE implementation per screen.

Never create:

- DesktopLogin.jsx
- MobileLogin.jsx
- DesktopDashboard.jsx
- MobileDashboard.jsx

or equivalent duplicated screens.

Use responsive Next.js/Tailwind behavior.

The Stitch login contains separate desktop and mobile exports.

These MUST be merged into ONE responsive Login implementation.

---

# PRIMARY SCREENS

The application has these primary screen families:

1. Login
2. Registration
3. Dashboard
4. Add Record
5. History
6. Search / Ask KisanVault
7. Summary

Do not create additional primary screens unless explicitly instructed.

---

# ADD RECORD

Add Record is ONE screen.

It contains five record modes:

1. Field
2. Crop
3. Activity
4. Expense
5. Harvest

These are NOT five separate pages.

Use a reusable record-type selector and render the appropriate form.

Each form must remain visually consistent with the Stitch Add Record design.

---

# REUSABILITY

Extract repeated UI into reusable components.

Examples include:

- Navbar
- Sidebar
- Mobile navigation
- Record cards
- Buttons
- Inputs
- Select controls
- Tabs
- Filter controls
- Timeline items
- Summary cards
- Evidence/source cards
- Empty states
- Loading states
- Error states
- Record detail presentation

Do not prematurely create hundreds of tiny components.

A component should be reusable when it represents a meaningful repeated UI pattern.

---

# DATA

Never permanently hardcode demonstration data into application components when that data is expected to come from the backend.

During development, temporary mock data may be used only when necessary to render a screen.

Keep mock data clearly separated from UI components.

Do not silently convert mock data into fake API behavior.

---

# API

Keep backend communication separate from UI components.

Components should not contain large blocks of API implementation logic.

Use a clear frontend API/service layer.

Every API dependency must be documented in `/docs/04_API_CONTRACT.md`.

Backend implementation details are NOT the frontend agent's responsibility.

---

# AUTHENTICATION

Authentication will eventually use the backend JWT system.

Do not invent a different authentication architecture.

The frontend must have a clear place where authentication requests and authenticated API requests can be connected.

Do not implement fake authentication that pretends to be production authentication.

---

# LANGUAGE SUPPORT

KisanVault will eventually support farmer-friendly language switching.

The footer will contain the language selector.

For the current implementation:

- keep user-facing strings organized so they can be internationalized later
- do not scatter critical strings in unusual places
- do not hardcode language-specific logic into components
- do not build a massive translation system unless explicitly instructed

The language selector UI can be implemented later as a controlled enhancement.

---

# ERROR HANDLING

Every API-driven feature must have a clear place for:

- loading state
- success state where applicable
- error state
- empty state where applicable

Do not allow failed API requests to leave the UI appearing successful.

---

# ACCESSIBILITY

Use:

- semantic HTML
- proper labels
- keyboard-accessible controls
- visible focus states
- descriptive buttons
- accessible form controls
- appropriate alt text
- clear error messages

Do not sacrifice accessibility for visual styling.

---

# CODE QUALITY

Prefer:

- simple code
- predictable naming
- small meaningful components
- clear separation of concerns
- reusable components
- typed/validated data boundaries where appropriate
- centralized API configuration
- centralized constants where useful

Avoid:

- giant page components
- duplicated markup
- duplicated API logic
- unexplained magic values
- unnecessary abstractions
- premature optimization

---

# DO NOT DO THIS

Never:

- redesign the Stitch UI
- change colors without instruction
- change typography without instruction
- replace imagery without instruction
- add pages because they "seem useful"
- add features because they "would be nice"
- invent backend endpoints
- invent database fields
- invent business logic
- modify backend files
- modify Stitch reference files
- create separate mobile pages
- create separate desktop pages
- install random libraries to solve simple problems
- rewrite working code merely for stylistic preference

---

# WHEN UNCERTAIN

If a requirement is unclear:

1. inspect the project documentation
2. inspect the Stitch reference
3. inspect the API contract
4. determine whether the ambiguity can safely be isolated
5. if it materially affects architecture or product behavior, STOP and report the ambiguity

Do not invent important product behavior.

---

# DEVELOPMENT PHILOSOPHY

Build the smallest correct implementation first.

Then verify it.

Then improve only where required.

The deadline is strict.

Do not spend hours polishing architecture that does not improve the working product.

Working > theoretical perfection.

Maintainable > clever.

Simple > elaborate.
