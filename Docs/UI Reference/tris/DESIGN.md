---
name: TRIS
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#434843'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#904c18'
  on-secondary: '#ffffff'
  secondary-container: '#ffa76b'
  on-secondary-container: '#783a04'
  tertiary: '#101917'
  on-tertiary: '#ffffff'
  tertiary-container: '#252d2b'
  on-tertiary-container: '#8c9592'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#ffdbc7'
  secondary-fixed-dim: '#ffb687'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#733600'
  tertiary-fixed: '#dbe4e1'
  tertiary-fixed-dim: '#bfc8c5'
  on-tertiary-fixed: '#151d1b'
  on-tertiary-fixed-variant: '#404946'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 16px
  stack-md: 32px
  stack-lg: 80px
---

## Brand & Style
The design system is built for a premium experience platform that bridges the gap between global travelers and the ancestral wisdom of Meghalaya. The personality is that of a **Storyteller and Connector**, prioritizing depth over speed and authenticity over artifice.

The visual style is **Contemporary Organic Minimalism**. It balances the precision of modern design with the warmth of natural textures. 
- **Emotional Response:** Grounded, serene, and deeply respectful.
- **Visual Direction:** High-end editorial meets cultural archive. Expect generous whitespace to allow immersive photography to breathe, creating a "gallery-like" experience that frames the landscape and people of Meghalaya as the primary subjects.

## Colors
The palette is derived from the living landscapes of the Khasi and Jaintia hills. 

- **Primary (Deep Forest):** Used for core branding, primary typography, and navigation. It provides a stable, authoritative anchor.
- **Secondary (Warm Terracotta):** Reserved for meaningful action points, highlights, and storytelling accents. It represents the earth and human craft.
- **Tertiary (Mist Grey):** Used for subtle UI elements, secondary backgrounds, and metadata.
- **Neutral (Stone White):** The primary canvas. A warm, off-white base that prevents the clinical feel of pure white, evoking the texture of mist-washed stone.
- **Feedback:** Success is indicated via a soft sage, warnings via muted ochre, and errors via a desaturated clay red.

## Typography
The typography system pairs the geometric confidence of Montserrat with the soft, modern approachability of Plus Jakarta Sans.

- **Headlines:** Use Montserrat to convey strength and architectural structure. Display sizes should utilize tight tracking and bold weights to anchor the page.
- **Body:** Plus Jakarta Sans provides high legibility with a friendly, open feel. Use `body-lg` for narrative descriptions and storytelling sections.
- **Labels:** Use `label-caps` for category tags (e.g., "COMMUNITY", "TREK", "CRAFT") to provide clear hierarchy without overwhelming the page.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Content is centered within a 1280px max-width container for readability on large screens, while margins expand fluidly.

- **Rhythm:** A strict 8px baseline grid is used.
- **Grid:** Use a 12-column grid for desktop with 24px gutters. For mobile, transition to a 4-column grid with 20px margins.
- **Whitespace:** Use `stack-lg` (80px) between major thematic sections to encourage a slower, "scenic" browsing experience. Narrative text blocks should be limited to 8 columns of width to maintain comfortable line lengths.

## Elevation & Depth
This design system avoids heavy shadows in favor of **Tonal Layering** and **Soft Depth**.

- **Surfaces:** Use `neutral` (Stone White) for the base layer and `Mist Grey` at 30% opacity for secondary container tiers. 
- **Shadows:** When necessary for functional depth (e.g., dropdowns or modals), use "Ambient Shadows"—extremely diffused (32px+ blur), low opacity (8%), tinted with the primary forest green rather than black.
- **Borders:** Use thin (1px) borders in a desaturated version of the primary color at 10% opacity to define card boundaries without creating visual noise.

## Shapes
The shape language is **Soft and Sophisticated**. 

The design system uses subtle rounding to mimic the weathered edges of river stones. Avoid perfect circles except for avatars or specific iconography. 
- Large imagery should use the `rounded-lg` (0.5rem) token to feel contained yet approachable.
- UI elements like buttons and input fields follow the `Soft` (0.25rem) standard to maintain a sense of precision and premium quality.

## Components
- **Buttons:** Primary buttons use the Forest Green background with Stone White text. Secondary buttons are "ghost" style with a 1px Forest Green border. All buttons use 16px horizontal and 12px vertical padding.
- **Cards:** Experience cards must lead with high-resolution photography. Use a subtle gradient overlay at the bottom for text legibility. Titles should be in `headline-md`.
- **Chips/Tags:** Small, pill-shaped tags for "Sustainability" or "Community-Led" status. Use Mist Grey backgrounds with Forest Green text.
- **Inputs:** Clean, bottom-border-only fields or softly outlined boxes. The focus state should transition the border color to Warm Terracotta.
- **Lists:** Use custom icons derived from Khasi weaving patterns or botanical sketches rather than standard generic icons.
- **The "Story" Component:** A specialized component for community narratives featuring a large quote in `body-lg` (italicized) and a small circular avatar of the community member.