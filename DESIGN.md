# Design Brief

## Direction

Premium SaaS Indigo Gradient Luxury — A sophisticated Agency Management dashboard with deep indigo primary (#0F172A), purple-blue gradient accents on hero sections (Dashboard/Analytics/Finance), light-mode clarity with dark-mode support, elevated card hierarchy, and refined micro-interactions.

## Tone

Confident minimalism: bold indigo establishes authority while soft shadows and generous spacing maintain calm professionalism. Gradient headers add visual richness without excess; motion is intentional and purposeful.

## Differentiation

Gradient header treatment on major pages creates visual impact and premium feel; deep indigo primary paired with cool accent purples establishes modern SaaS identity; elevated card lifting and smooth transitions reinforce interactivity; semantic color coding (success green, warning yellow, danger red) ensures instant status recognition.

## Color Palette

| Token      | OKLCH           | Role                              |
| ---------- | --------------- | --------------------------------- |
| background | 0.99 0.005 250  | Soft off-white premium base       |
| foreground | 0.15 0.02 260   | Deep indigo text, high contrast   |
| card       | 1.0 0.001 0     | Pure white elevated card surfaces |
| primary    | 0.35 0.12 260   | Deep indigo CTA authority         |
| accent     | 0.65 0.18 270   | Purple-blue gradient highlights   |
| success    | 0.5 0.18 140    | Semantic green completion         |
| warning    | 0.68 0.18 60    | Semantic yellow caution           |
| destructive| 0.54 0.22 25    | Semantic red danger               |
| muted      | 0.93 0.005 250  | Soft UI backgrounds               |
| border     | 0.92 0.005 250  | Subtle separation lines           |

## Typography

- Display: Space Grotesk — page headers, section titles, status labels (bold indigo for impact)
- Body: DM Sans — form fields, descriptions, metadata, UI labels (readable baseline)
- Scale: hero `text-4xl font-bold gradient-primary`, h2 `text-2xl font-semibold`, label `text-sm font-medium`, body `text-base`

## Elevation & Depth

Premium shadow hierarchy: `shadow-card` (1px+2px, subtle) for base cards, `shadow-elevated` (4px+2px, hover lift) for interactive elements, `shadow-premium` (8px+4px) for modals/overlays; card lift-on-hover adds depth without excess.

## Structural Zones

| Zone      | Background        | Border             | Notes                                           |
| --------- | ----------------- | ------------------ | ----------------------------------------------- |
| Page Header | gradient-primary | none               | Dashboard/Analytics/Finance hero with gradients |
| Sidebar   | sidebar           | sidebar-border     | Navigation with indigo active state, icon icons |
| Content   | background        | —                  | Light base with alternating muted/card layers   |
| Cards     | card              | border/subtle      | 12-14px radius, shadow-card, lift on hover      |
| Modals    | card              | border             | shadow-premium, backdrop blur, centered overlay |
| Footer    | muted/20          | border             | Secondary actions, muted text                   |

## Spacing & Rhythm

Grid-aligned: 24px section gaps, 14px card padding, 8px micro-spacing; generous horizontal margins (20px mobile, 32px desktop) ensure breathing room; increased vertical spacing emphasizes card-based hierarchy.

## Component Patterns

- Buttons: primary (indigo bg, white text, shadow-card, active:scale-95), secondary (border-primary, indigo text), danger (red bg/text, shadow-card)
- Cards: rounded-xl (12-14px), shadow-card, white bg, lift-on-hover class combines transition-smooth + translate-y-[-2px] + shadow-elevated
- Badges: semantic colors (success green, warning yellow, danger red), 6px radius, 8px padding, text-xs font-medium, badge-hover for brightness transition
- Gradient headers: `gradient-primary` on page titles, `gradient-accent` for accent sections

## Motion Storyboard

- **Entrance**: fade-in 300ms, staggered item-in for lists (200ms per item)
- **Hover**: cards use lift-on-hover (translate-y + shadow-elevated 300ms), badges use badge-hover (brightness 150ms)
- **Press**: buttons scale 0.95 on active, buttons-press class combines active:scale-95
- **Decorative**: all animations functional, no pure decoration

## Responsive & Dark Mode

- Light mode: optimized for clarity and focus; primary indigo ensures authority
- Dark mode: backgrounds 0.12 L (near-black), cards 0.16 L with indigo tint, accent brightens to 0.75 L for contrast
- Mobile-first: sm breakpoint (480px), md (768px), lg (1024px); cards stack full-width on sm, 2-col on md

## Constraints

- Max 5 semantic colors (indigo primary, purple-blue accent, green success, yellow warning, red danger)
- Gradients only on page headers (Dashboard/Analytics/Finance) and button hover states if needed
- No neon or glow effects; maintain premium restraint

## Signature Detail

Deep indigo (#0F172A) paired with gradient headers establishes SaaS authority; card lift-on-hover combined with premium shadows creates tactile depth; semantic status colors enable instant recognition without labels, supporting rapid scanning and decision-making.
