# KisanVault — Design Preservation

This document extracts and strictly defines the visual system established by the Stitch-generated frontend. The purpose of this document is to prevent visual regression during the conversion to Next.js.

The visual language favors absolute clarity, large touch targets, natural agricultural warmth, instant comprehension, high contrast, and gentle earthy tones.

## Colors

The following exact color values must be preserved. They are mapped to the Tailwind configuration.

- **Primary**: `#244523` (Deep, warm, trustworthy foliage green. Used for primary actions and key anchors.)
- **Primary Container**: `#D6EACF`
- **Secondary**: `#556B48` (Warm moss/sage green with golden-leaf undertones.)
- **Secondary Container**: `#E0ECCE`
- **Tertiary / Harvest Accent**: `#705936` (Warm soil and grain tone used for highlights, seasonal status, and weather anchors.)
- **Tertiary Container**: `#F5E4C7`
- **Background / Canvas**: `#FAF7F2` (Warm, breathable agricultural off-white / parchment.)
- **Surface**: `#FAF7F2`
- **Surface Bright**: `#FFFFFF`
- **Surface Container**: `#ECE7DD`
- **Text (On-Surface)**: `#20261E` (Deep charcoal-bark for maximum sunlight readability.)
- **Muted Text (On-Surface Variant)**: `#525B4F`
- **Borders (Border Subtle / Outline)**: `#E2DDD2` / `#7E887B`
- **Error**: `#9E2A2B`
- **Error Container**: `#ffdad6`

## Typography

KisanVault uses a dual-font system. 

- **Newsreader** (Georgia, serif fallback): Used for editorial warmth, section titles, and friendly greeting moments. Conveys heritage, care, and organic earthiness.
- **Source Sans 3** (system-ui fallback): Humanist sans-serif for crystal-clear readability and UI controls.

**Hierarchy:**
- **Display / Headlines**: `Newsreader`. Weights vary from `500` to `600`. Sizes range from `20px` (headline-sm) to `40px` (display).
- **Body / Content**: `Source Sans 3`. Weight `400`. Sizes: `14px` (body-sm), `16px` (body-md), `18px` (body-lg).
- **Labels / Buttons / Navigation**: `Source Sans 3`. Weight `600`. Sizes: `12px` (label-sm), `14px` (label-md), `16px` (label-lg).
- **Numeric/Data**: Large, clear, and uncrowded. No microscopic microcopy.

## Components

The visual treatment of UI elements must adhere to these standards:

- **Buttons**:
  - **Primary**: Solid deep green (`#244523`), white text, bold label, rounded pill / 12px curve, minimum height 48px.
  - **Secondary / Ghost**: Warm outlined border with subtle background tint, clear tap state.
- **Inputs & Selects**: Minimum height 48px to ensure large touch targets. Soft `#F5F1E8` or `#FFFFFF` backgrounds with 12px radius.
- **Cards**: 12px–16px border-radius, clean `#FFFFFF` or `#F5F1E8` fill, 1px `#E2DDD2` border, soft gentle shadow (`0 2px 6px rgba(0,0,0,0.04)`).
- **Tabs / Chips**: Pill-shaped, often utilizing secondary containers or surface containers for inactive states. Active states use primary or secondary solid fills.
- **Navigation (Navbar/Sidebar)**: Clear typography, padded touch targets, and visual distinction of the active route (e.g., bolded or with a container fill).
- **Timeline / Record Cards**: Must maintain high information hierarchy (1 primary message/metric per card). Plain language over cryptic technical graphs (e.g., "Good Soil Moisture").
- **Summary Cards / Evidence Cards**: Clean borders, distinct data groupings, utilizing harvest accents for highlights.
- **Charts**: Minimalist and highly legible, avoiding overly dense or technical presentations.
- **Alerts**: Clear color associations (Error: `#9E2A2B`, Success: Primary Green) with readable text and spacing.
- **Empty States**: Friendly, uncrowded, and clear next-action guidance.

## Iconography

- **Library**: Google Material Symbols Outlined.
- **Treatment**: Simple, rounded, consistent 2px stroke agricultural symbols (e.g., sprout, sun, raindrop, soil, grain bag, shield, voice mic).

## Imagery

- Stitch placeholder imagery (`screen.png` and others) establishes a natural, warm, authentic Indian agricultural landscape scene in natural morning daylight.
- The tone is grounded, organic, and authentic. Imagery should feel real, not abstract or hyper-stylized.

## Responsive Behavior

- The application must dynamically adapt to device width using Tailwind breakpoints.
- Grids shift from single-column on mobile (`grid-cols-1`) to multi-column on desktop (`md:grid-cols-2`, `lg:grid-cols-12`).
- **IMPORTANT**: The two Stitch login implementations (`kisanvault_desktop_login` and `kisanvault_mobile_login`) are reference material only. **The final application MUST have ONE responsive Login implementation.**

## Preservation Rules

To ensure strict adherence to the Farmer-First Principle, the implementing coding agent **MUST NOT**:

- Redesign the application layout or UI elements.
- Change the core color palette.
- Change the typography families or scale.
- Introduce gradients.
- Introduce glassmorphism or excessive blur effects.
- Introduce neon, high-tech, or futuristic AI styling.
- Introduce dense, generic enterprise SaaS styling.
- Replace the established organic visual language.
- Create separate mobile pages (`MobileLogin.jsx`).
- Create separate desktop pages (`DesktopLogin.jsx`).
