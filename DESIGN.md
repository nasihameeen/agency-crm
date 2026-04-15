# Design Brief

## Direction

Clean Serene Professional — A light, accessible Client Management dashboard for digital agencies with professional teal accents and card-based information hierarchy.

## Tone

Refined minimalism with a focus on clarity and trust; soft shadows and generous spacing reduce cognitive load while maintaining information density for productivity workflows.

## Differentiation

Intentional card-based depth through subtle elevation shadows and varied surface tones creates rhythm without decoration; status indicators use semantic color (gray pending, orange in-progress, green completed) for instant project recognition.

## Color Palette

| Token      | OKLCH           | Role                           |
| ---------- | --------------- | ------------------------------ |
| background | 0.98 0.008 230  | Off-white cool base            |
| foreground | 0.18 0.015 230  | Deep teal text, high contrast  |
| card       | 1.0 0.004 230   | Pure white elevated surfaces   |
| primary    | 0.42 0.14 240   | Professional teal CTAs         |
| accent     | 0.6 0.15 170    | Cool teal highlights           |
| muted      | 0.94 0.01 230   | Soft dividers and backgrounds  |
| border     | 0.9 0.008 230   | Subtle separation              |

## Typography

- Display: Space Grotesk — headers, client/project names, status labels
- Body: DM Sans — form fields, descriptions, metadata, UI labels
- Scale: hero `text-3xl md:text-4xl font-bold`, h2 `text-2xl font-semibold`, label `text-sm font-medium`, body `text-base`

## Elevation & Depth

Soft shadows create card hierarchy: `shadow-card` (1px subtle) for interactive elements, `shadow-elevated` (4-6px) for modals and floating panels; no glow or neon effects maintain professional restraint.

## Structural Zones

| Zone      | Background        | Border             | Notes                                     |
| --------- | ----------------- | ------------------ | ----------------------------------------- |
| Header    | sidebar-accent    | sidebar-border     | Dashboard metrics, soft separated layout  |
| Sidebar   | sidebar           | sidebar-border     | Navigation with primary teal active state |
| Content   | background        | —                  | Alternating muted/card backgrounds        |
| Cards     | card              | border/subtle      | Soft shadows, 12px radius, clickable      |
| Footer    | muted/30          | border             | Copyright or secondary actions            |

## Spacing & Rhythm

Grid-aligned spacing: 16px section gaps, 12px card internal padding, 8px micro-spacing (buttons, icons); generous horizontal margins (24px mobile, 32px desktop) prevent cramped layouts and improve mobile readability.

## Component Patterns

- Buttons: primary (teal bg, white text, shadow-card), secondary (border-only, teal text), danger (red/destructive, shadow-card on hover)
- Cards: rounded-lg (12px), shadow-card, white background, hover shadow-elevated + transition-smooth
- Badges: inline status indicators (gray pending, orange in-progress, green completed), 6px radius, condensed text-xs

## Motion

- Entrance: fade-in 300ms on mount, staggered for card lists
- Hover: shadow and elevation lift via shadow-elevated + transition-smooth, no bounces or extreme rotations
- Decorative: none; all motion is functional

## Constraints

- No dark mode (productivity tools use light mode for focus and reduced eye strain)
- Max 3 primary colors (teal, orange, green for status; gray muted)
- No gradient backgrounds; subtle linear gradients only for hover/active states if needed
- Mobile-first: cards stack full-width on sm, 2-col on md, 3-col on lg

## Signature Detail

Soft shadows paired with cool undertones create a sense of calm professionalism; each status color (pending gray, in-progress orange, completed green) is semantic and instantly recognizable without labels, reducing cognitive friction in rapid scanning.
