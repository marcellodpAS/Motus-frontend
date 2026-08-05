---
name: Motus Mobility
colors:
  surface: '#f9f9ff'
  surface-dim: '#d5daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#eaeef4'
  surface-container-high: '#e3e8f8'
  surface-container-highest: '#dee2f2'
  on-surface: '#161c27'
  on-surface-variant: '#424753'
  inverse-surface: '#2b303c'
  inverse-on-surface: '#edf0ff'
  outline: '#727784'
  outline-variant: '#c2c6d5'
  surface-tint: '#005bbf'
  primary: '#004492'
  on-primary: '#ffffff'
  primary-container: '#005bbf'
  on-primary-container: '#c8d8ff'
  inverse-primary: '#acc7ff'
  secondary: '#0059bb'
  on-secondary: '#ffffff'
  secondary-container: '#1371e6'
  on-secondary-container: '#fefcff'
  tertiary: '#7c2e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a23f01'
  on-tertiary-container: '#ffceb9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004492'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc7ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004493'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f9f9ff'
  on-background: '#161c27'
  surface-variant: '#dee2f2'
  map-background: '#f8f9fa'
  border-subtle: '#dadce0'
  semantic-success: '#188038'
  semantic-error: '#d93025'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 12px
  margin-mobile: 16px
  margin-desktop: 24px
  component-padding-x: 16px
  component-padding-y: 10px
---

## Brand & Style
Motus is a premium mobility and navigation brand that prioritizes precision, utility, and effortless clarity. The brand personality is **Corporate Modern** with a lean towards minimalist efficiency. It targets urban professionals and travelers who require real-time, data-driven decisions without visual clutter.

The UI should evoke a sense of reliability and calmness. It utilizes expansive whitespace, a disciplined primary blue for "hero" actions, and a sophisticated grayscale for structural elements. The aesthetic is inspired by high-end cartography and modern SaaS dashboards—functional, unobtrusive, and highly legible.

## Colors
The palette is rooted in a "Fidelity" blue system. 
- **Primary Blue (#005bbf):** Used for critical interactive states, highlights (like the cheapest gas price), and primary navigation icons.
- **Surface Palette:** Employs a range of cool greys and off-whites. `surface` is pure white for high-contrast readability on top of maps. `surface-container-low` (#f0f4fa) provides soft grouping for list items.
- **Map Context:** The map utilizes a specific `map-background` (#f8f9fa) to ensure UI overlays like pins and bottom sheets remain distinct through contrast and subtle shadows.
- **Feedback:** Semantic greens and reds are reserved for status indicators, though the primary blue often doubles as the "success" or "active" state in navigation contexts.

## Typography
The system uses **Inter** exclusively to maintain a technical, clean, and neutral tone. 
- **Headlines:** Use Medium weights (500) to provide hierarchy without excessive visual weight.
- **Labels:** Crucial for map pins and navigation items; they use Medium weights and slight letter spacing (0.1px to 0.5px) to ensure legibility at small sizes.
- **Numbers:** In pricing contexts (e.g., gas prices), font weights may be pushed to Bold (700) within the `headline-lg` or `label-lg` roles to emphasize the data.

## Layout & Spacing
The layout follows a **contextual/fluid model** with strict adherence to safe margins.
- **Mobile:** Uses a bottom-heavy interaction model. Main content is housed in a floating bottom sheet with 16px side margins. 
- **Desktop:** Pivots to a "Sidebar + Panel" layout. A fixed 80px left navigation rail manages top-level app switching, while detail panels (420px width) anchor to the left margin (24px).
- **Grids:** While the map is fluid, UI overlays use a 4px base unit for internal component padding and a 12px gutter for list items.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Tonal Layering**.
- **Level 1 (Surface):** Default background state.
- **Level 2 (Cards/Pins):** Uses a combined shadow: `0px 1px 2px rgba(60,64,67,0.3)` and `0px 1px 3px 1px rgba(60,64,67,0.15)`. This creates a crisp, physical lift from the map.
- **Level 3 (Sheets/Modals):** Large surfaces like bottom sheets use a softer, upward-directed shadow `0px -2px 12px rgba(60,64,67,0.1)` and a `border-subtle` (#dadce0) to define boundaries against the map.
- **Interaction:** Hovering over pins or list items results in a slight Y-axis translation (-4px) to signal interactivity.

## Shapes
The system uses **Rounded (Level 2)** geometry to balance professional structure with approachability.
- **Standard Components:** Buttons and small containers use a 0.5rem (8px) radius.
- **Sheet Surfaces:** Bottom sheets and desktop panels use a more generous 0.75rem to 1rem (12px-16px) top-corner radius to soften the large surface area.
- **Interactive Pill:** Map pins and search bars use "Full" rounding (9999px) to distinguish them as floating, high-interaction elements.

## Components
- **Buttons:** Primary buttons are filled with the primary blue and white text. Icon buttons are circular with a soft grey hover state (`surface-container-low`).
- **Map Pins:** Two variants. *Normal:* White background, subtle border, black text. *Highlighted:* Primary blue background, bold white text, and a double-ring (offset) focus effect.
- **Lists:** Items are grouped in containers with a 12px radius. Active or "best" items receive a subtle background tint (`surface-container-low`) and a 1px border in a primary-tinted color.
- **Bottom Sheets:** Feature a centered, low-opacity "drag handle" for mobile and a sticky header with a backdrop blur (`bg-surface/80 backdrop-blur-md`) to maintain context of the map underneath.
- **Navigation:** Mobile uses a bottom bar with active states indicated by a pill-shaped background highlight (`secondary-fixed/50`). Desktop uses a slim vertical rail.