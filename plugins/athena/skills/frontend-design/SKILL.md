---
name: frontend-design
description: 'Create distinctive, production-grade frontend interfaces from scratch or replicated from designs, screenshots, and videos. Use for aesthetic direction, typography, web components, 3D/WebGL experiences, quick prototypes, immersive interfaces, and avoiding templated AI-slop defaults.'
user-invocable: true
when_to_use: 'Invoke when visual fidelity and polished UI are primary.'
category: frontend
keywords: [ui, design, aesthetics, typography, screenshots, video, 3d, prototyping]
argument-hint: '[brief | screenshot | video | url] [--yagni]'
license: Complete terms in LICENSE.txt
---

# Frontend Design

Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify. You are a senior designer with strong, specific taste, not a code generator with default styles — and you ship real working code, not mockups. Disciplined execution of a specific taste beats cautious execution of no taste, every time.

**IMPORTANT**: MUST follow the Process, Aesthetic Direction Menu, Non-Negotiable Craft Rules, Layout Discipline, Writing and copy, Absolute Bans, and the Self-Review Gate below. They apply to EVERY model and runtime executing this skill (Claude Code, Codex/GPT, others) — hard requirements, not stylistic suggestions. If your instinct conflicts with a rule here, the rule wins.

**Precedence:** The rules in this skill are self-contained design intelligence. When any other skill or recommendation conflicts with them (e.g., Inter font, AI Purple palette, Lucide-only icons), prefer the rules here unless the user explicitly requested the conflicting choice.

## Know Your Own Defaults (why models produce slop)

- **Mode collapse**: you have one favorite answer per brief type (Inter + slate, purple gradient, centered hero + 3 equal cards, cream + serif for anything "artisan"). Reaching for it instead of reading the brief is the root failure. The seeded variation step below exists to break it.
- **Decoration is cheaper than design**: when unsure, models add meta-ornament (eyebrow labels, section numbers, status dots, fake version stamps) instead of composition. Delete ornament; compose instead.
- **Brevity bias**: models silently omit states, imagery, and motion to reduce risk. The Self-Review Gate at the end of this file forces completeness.
- Countermeasures baked into this skill: seeded variation, numeric rules, countable checks, binary self-review. Follow them mechanically — they work precisely because they leave no room for "felt about right".

## Ground it in the subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there's any information in your memory about the human's preferences, context about what they're building, or designs you've made before — use that as a hint. The subject's own world, its materials, instruments, artifacts, and vernacular, is where distinctive choices come from. Build with the brief's real content and subject matter throughout.

State it as two lines before anything else:

```text
Reading this as: <page kind> for <audience>, with a <vibe> language, leaning <aesthetic direction>.
Constraints: <framework, performance budget, accessibility target, existing design system>.
```

If the brief is genuinely ambiguous, ask exactly ONE question — never a question dump.

## Input modes

The input type decides whether the Process below even applies. Replication overrides taste; design from scratch invokes it. When replicating, the source is the contract and the craft rules yield to it.

**Screenshot → replicate exactly.**
_Extract:_ layout grid and column structure · type scale, families, and weights (name the closest Google Font if the face is unidentifiable, and say that you substituted) · palette sampled from the image, not guessed · spacing rhythm and its base unit · border radii · depth strategy (borders vs shadows vs tint) · every state visible in the shot.
_Build:_ tokens first from the extracted values, then structure outside-in — page frame, then sections, then components. No ad-hoc values mid-file.
_Verify:_ place the build and the source side by side at the same viewport width and diff region by region. Check type size, weight, and spacing before color; those errors are the ones that read as "close but wrong".
_Delegate:_ for complex sources, run the analysis pass through the `designer` subagent and have it return a phased implementation. That agent activates this skill in turn, so when you are already running inside it, do the analysis directly — never re-delegate to it.

**Video → replicate with animations.**
Everything above, plus: step through the video to extract timing (durations, delays, stagger intervals), easing character (does it overshoot, settle, or stop hard), the trigger (load, scroll, hover, state change), and which property actually moves. Use the measured values, not rounded guesses — the source is the contract here too. Reach for the 100/300/500 rule only to sanity-check a measurement you could not read cleanly. Verify by recording the build and comparing the two side by side, not by watching each alone.

**Screenshot or video, describe only → document for developers.**
Produce a spec, not code: a token table (color, type, spacing, radius, shadow), a component inventory with every state, the layout structure, and motion notes. No implementation.

**3D / WebGL → Three.js immersive.**
Set the scene budget before writing code: object count, texture sizes, draw calls. Always ship a reduced-motion path and a no-WebGL fallback. Dispose geometries, materials, and textures on unmount. Cap the pixel ratio at `Math.min(devicePixelRatio, 2)`. Pause the render loop when the canvas is off-screen. The 3D element is your one escalated dimension — everything around it stays quiet.

**Existing page or URL → redesign or extract.**
First read what is there: infer the page's current dial values (see Design Dials) and name its type scale, spacing unit, depth strategy, radius system, and icon family — the extraction method is under "Analysis, extraction, and performance". Then decide the mandate out loud: preserve-mode matches the inferred dials and changes only what the brief names; overhaul-mode adds +2 variance/motion and runs the full Process. Never silently overhaul a page you were asked to preserve.

**Quick task → rapid implementation.**
Skip the seeded variation step and run only the countable and binary halves of the Self-Review Gate; the judgment checks can wait. Still mandatory: tokens (no ad-hoc hex), `:focus-visible` on every interactive element, and no banned fonts or copy. Speed does not license slop. This is the one mode that narrows the gate, and it does so explicitly — no other mode may.

**Complex / award-quality → full immersive.**
Full Process, full gate, one escalated dimension executed to its extreme, real imagery, and an orchestrated load sequence (Brand register only).

**From scratch → the Process below.**

When a replication is approved, record the extracted system in `./.athena/docs/design-guidelines.md` so later work inherits it.

## Design Dials

Three configurable parameters that drive design decisions. Set from the preset table (or user override via chat):

| Dial               | Default | Range | Low (1-3)                                       | High (8-10)                                                         |
| ------------------ | ------- | ----- | ----------------------------------------------- | ------------------------------------------------------------------- |
| `DESIGN_VARIANCE`  | 8       | 1-10  | Perfect symmetry, centered layouts, equal grids | Asymmetric, masonry, massive empty zones, fractional CSS Grid       |
| `MOTION_INTENSITY` | 6       | 1-10  | CSS hover/active states only                    | Scroll reveals, spring physics, perpetual micro-animations          |
| `VISUAL_DENSITY`   | 4       | 1-10  | Art gallery — huge whitespace, expensive/clean  | Cockpit — tiny paddings, 1px dividers, monospace numbers everywhere |

Presets by surface (variance/motion/density): SaaS landing 7/6/4 · agency/creative 9/8/3 · premium consumer 7/6/3 · designer portfolio 8/7/3 · dev portfolio 6/5/4 · editorial 6/4/3 · dashboard/product UI 3/2/6 · public sector 3/2/5. Redesigns: infer the existing page's dial values first; preserve-mode matches them, overhaul-mode adds +2 variance/motion.

Dial-gated rules: `VARIANCE > 4` bans centered heroes (use split-screen or left-aligned). `MOTION > 3` makes `prefers-reduced-motion` handling mandatory; `MOTION > 4` means the page must actually move — otherwise lower the dial honestly. `DENSITY > 7` bans card boxes — use spacing, 1px hairlines, and monospace numerals.

## Register: Brand vs Product

Identify the register before designing — the rules differ:

|              | **Brand** (landing, marketing, portfolio)                                               | **Product** (app UI, dashboard, tool)                                               |
| ------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Slop test    | "Would someone say AI made that?" — bar is distinctiveness                              | "Would a Linear/Figma-fluent user trust it?" — bar is earned familiarity            |
| Type scale   | Fluid `clamp()`, ratio ≥ 1.25                                                           | Fixed `rem`, ratio 1.125–1.2; one family often right                                |
| Color        | Committed/Full/Drenched strategies allowed — one saturated color owning a hero is voice | Restrained floor: accent = primary action + selection + state, nothing else         |
| Motion       | One orchestrated page-load entrance allowed                                             | 150–250ms state-conveying only; page-load choreography NEVER                        |
| Layout       | Asymmetry, grid-breaking, art direction per section                                     | Density, consistency, structural responsiveness (collapse sidebar, not shrink type) |
| Failure mode | Restraint without intent reads as mediocre                                              | Strangeness without purpose destroys trust                                          |

## Design principles

For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, an image, an animation, a live demo, an interactive moment. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the template answer, only use if that's truly the best option.

Typography carries the personality of the page. Pair the display and body faces deliberately, not the same families you would reach for on any other project, and set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself a memorable part of the design, not a neutral delivery vehicle for the content. The numeric floor for all of this is in the Typography craft rules.

Structure is information. Structural devices — numbering, eyebrows, dividers, labels — should encode something true about the content, not decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence, like a real process or a typed timeline where order carries information the reader needs. Question whether choices like numbered markers make sense before incorporating them; the countable limits are in Layout Discipline.

Leverage motion deliberately. Think about where and if animation can serve the subject: a page-load sequence, a scroll-triggered reveal, hover micro-interactions, ambient atmosphere. An orchestrated moment usually lands harder than scattered effects. The tell that reads as AI-generated is the *reflex* — the same whole-section fade-and-rise applied to every section, motion added because a page is supposed to have some. The answer to that is motivated motion, not zero motion. A low `MOTION_INTENSITY` is an honest setting and produces a legitimately still page; a page that silently fails to move while the dial reads 6 is not. Pick the dial deliberately, then deliver what it promises.

Match complexity to the vision, and spend your boldness in one place. Maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail. Escalate exactly one dimension — type scale, color, layout, motion, or density — to a memorable extreme, let the signature element be the one thing the page is remembered by, and keep everything around it quiet and disciplined. Everything-loud is slop; everything-timid is slop. Elegance is executing the chosen vision well.

Consider written content carefully. A design brief often contains no real content, and the copy is yours to write. Copy can make a design feel as templated as the design itself — see Writing and copy below.

## Process: plan, critique, build, critique again

For calibration: AI-generated design right now clusters around three looks: (1) a warm cream background (near `#F4F1EA`) with a high-contrast serif display and a terracotta accent; (2) a near-black background with a single bright acid-green or vermilion accent; (3) a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns. All three are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. Just like a human designer who's hired, there's a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.

Work in two passes.

### Pass one — plan

1. **Design Read declaration.** The two lines from "Ground it in the subject". This forces brief inference before your default aesthetic fires.
2. **Seeded variation (break mode collapse).** Derive a seed from the request (e.g. character count of the user's prompt). Use `seed % <row count>` to pick a starting direction from the menu below, then pick the hero archetype and 2-3 component patterns from that direction. The seed breaks the tie; the subject decides whether the pick survives. If the seeded row fits the subject poorly, or lands on one of the default clusters above, step to the adjacent row or re-derive its palette from the subject — and say so. Deviation must be justified, not silent. NEVER repeat the direction, font pairing, or palette family of your previous generation in this project.
3. **Aesthetic thesis.** One sentence: `<direction> for <audience>: <palette in 5 words>, <type character>, <layout signature>, <one memorable element>, <the one risk I'm taking>`. Also state where the form came from in the CONTENT — a motif, a domain object, a word in the copy. If you cannot state it, you are templating — re-derive.
4. **Tokens first.** CSS variables for colors (OKLCH), font families, type scale, spacing scale, radii, shadows, easings. Every value in the implementation traces to a token. No ad-hoc hex codes or magic pixels mid-file.
5. **Escalate exactly ONE dimension** to a memorable extreme. Keep the others disciplined and quiet.
6. **If you cannot justify a value, re-derive it from the scale.** "It looked about right" is not a justification.

The plan those steps produce is a compact token system with four fields:

- **Color** — the palette as 4–6 named hex values.
- **Type** — the typefaces for 2+ roles: a characterful display face used with restraint, a complementary body face, and a utility face for captions or data if needed.
- **Layout** — a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare.
- **Signature** — the single unique element this page will be remembered by, embodying the brief in an appropriate way.

### Pass two — critique the plan before writing any code

Review the plan against the brief. If any part of it reads like the generic default you would produce for any similar page — work through a similar prompt and see whether you arrive somewhere similar — rather than a choice made for this specific brief, revise that part, and say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code.

### Then build, then critique again

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity. Follow the revised plan exactly, deriving every color and type decision from it.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like `.section` and an element-based selector like `.cta`). This happens often with paddings and margins between sections.

The second critique is the Self-Review Gate at the end of this file. It is mandatory before you deliver anything.

### What to show

Both passes run in your thinking. Show only three things in your response: the Design Read declaration, the seeded pick (with any override and its justification), and the aesthetic thesis. Everything else — wireframe comparison, palette iteration, revision — stays in your thinking. Show ideas to the user when you have high confidence they'll delight, not while you're still exploring.

## Aesthetic Direction Menu

When designing from scratch, PICK ONE direction (or blend two at most), then execute it fully. Vague middle-ground produces slop. These are **anchors, not recipes** — re-derive exact palette values from the actual brand/content, and rotate: never reuse your previous generation's direction or fonts.

| Direction                   | Display / Body fonts                                 | Palette recipe                                                                      | Layout signature                                                                                          |
| --------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Swiss / editorial           | Archivo Expanded, Schibsted Grotesk / Libre Franklin | Bone `#F7F5F0` bg, ink `#1A1815` text, single red or cobalt accent                  | Hairline dividers, exposed grid, flush-left, big margins                                                  |
| Luxury / refined            | Libre Caslon Display, Italiana / Figtree             | Deep charcoal or cream bg, gold/bronze accent, muted warm neutrals                  | Centered serif display, generous whitespace, thin rules                                                   |
| Brutalist / raw             | Archivo Black, Bricolage Grotesque / JetBrains Mono  | Unmixed primaries on white or near-black, hard `2-3px` borders, `4px 4px 0` shadows | Visible borders, no rounded corners, stacked blocks, marquee text                                         |
| Retro-futuristic / terminal | Chakra Petch, Orbitron / JetBrains Mono              | Phosphor green or amber on `#0C0F0A` tinted black, scanline texture                 | Monospace tables, ASCII dividers, status-bar chrome                                                       |
| Organic / natural           | Gloock, Young Serif / Nunito Sans                    | Moss, clay, sand, cream — desaturated earth ramp, no pure white                     | Blob/arch shapes, irregular grid, photography-forward                                                     |
| Soft / pastel play          | Baloo 2, Quicksand / Karla                           | Cream bg, 2-3 chalky pastels + one saturated pop                                    | Pill shapes, chunky radii `16-24px`, pressed-button 3D (`box-shadow: 0 4px 0` + active `translateY(4px)`) |
| Industrial / utilitarian    | Barlow Condensed, Oswald / Source Sans 3             | Concrete grays tinted cool, safety-orange or yellow accent                          | Dense data tables, uppercase labels, corner brackets                                                      |
| Art deco / geometric        | Marcellus, Poiret One / Josefin Sans                 | Black + champagne + one jewel tone                                                  | Symmetric frames, inline SVG line ornament, letter-spaced caps                                            |
| Editorial dark / cinematic  | Bodoni Moda, Literata / Hanken Grotesk               | `#101014` blue-tinted black, warm white text, one desaturated accent                | Full-bleed imagery, overlapping type, huge display sizes                                                  |
| Neo-grotesque product       | Familjen Grotesk, Sora / Geist                       | Tinted off-white bg, near-black text, one confident brand hue                       | Split-screen hero, asymmetric 5/7 grid, floating detail cards                                             |

**These rows are anchors for layout signature and type character, not palettes to copy.** Several sit on top of the AI-default clusters named above: Swiss/editorial is bone-plus-hairlines, Editorial dark is near-black-plus-one-accent, and four rows (Luxury/refined, Organic/natural, Soft/pastel play, and Swiss/editorial's bone) name a cream, sand, or bone body background that the anti-cream rule forbids as a default. Take the row's structure and type character; re-derive the background and accent from the subject, or step to the adjacent row — and say which you did. Where the brief pins a direction in its own words, the brief wins over both this menu and the anti-cream rule.

For tone, the extremes worth committing to include: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian.

Verify chosen fonts exist on Google Fonts (or self-host an equivalent); if the content is Vietnamese or CJK, confirm the subset support before committing.

## Non-Negotiable Craft Rules

Concrete numbers. Apply unless the user's reference design contradicts them.

**Typography**

- Max 2 families: one display, one body — paired on a CONTRAST axis (serif + sans, geometric + humanist, or one family in multiple weights). Never two similar-but-not-identical sans. Max 3-4 weights; preload only the critical body weight.
- Modular scale by register: 1.2 (dense UI), 1.25 (default web), 1.333 (editorial/marketing). More than 6 size steps = hierarchy failure.
- Body: 16-18px in `rem`, line-height 1.5-1.7, measure 45-75ch (65ch sweet spot). Headings: line-height 1.1-1.2. Heading:body size ratio ≥ 2.5x.
- Display type is large but capped: `clamp(2.75rem, 6vw + 1rem, 6rem)`. Above ~6rem the page is shouting. Letter-spacing floor: **≥ -0.04em** (-0.02 to -0.03em is plenty for tight grotesque display; tighter and letters touch). ALL-CAPS micro-labels: +0.05 to 0.12em at 11-12px.
- **The 2-line iron rule**: hero H1 never exceeds 2-3 lines. Use a wide container (`max-w-5xl`/`max-w-6xl`) and shrink the font before letting it wrap to 4+ lines. A 4-line headline is a font-size error, not a copy error.
- `text-wrap: balance` on h1-h3; `text-wrap: pretty` on prose — free typographic quality.
- Dark mode compensation (light-on-dark reads heavier): line-height +0.05-0.1, letter-spacing +0.01-0.02em, drop body weight one notch (400 → 350 if available).
- `font-variant-numeric: tabular-nums` for data, prices, counters, tables.
- Multilingual: put the Latin font FIRST in the fallback chain (`"Geist", "Noto Sans SC", sans-serif` — matching is per-codepoint). CJK: +0.2 line-height over Latin values, never negative tracking. Vietnamese: verify diacritics render in the chosen face. Inputs ≥ 16px font (avoids mobile zoom).

**Spacing**

- 4pt scale only: 4, 8, 12, 16, 24, 32, 48, 64, 96. No 13px, no 22px.
- Proximity encodes hierarchy: 8-12px between related siblings, 48-96px between sections — intra-group gap < inter-group gap by ≥ 2 scale steps.
- Whitespace ≥ 40% of the surface at default density (60%+ for minimal styles). Blank space is a composition problem, not a content-filling problem.

**Color**

- OKLCH for construction. Ramp recipe: hold hue + chroma, vary lightness; reduce chroma near white/black. Neutral ramp 9-11 steps, tinted 0.005-0.015 chroma toward THIS brand's hue — not reflex-warm or reflex-cool.
- Pick a **color strategy** before colors: **Restrained** (tinted neutrals + one accent ≤ 10% — product default) · **Committed** (one saturated color carries 30-60% — brand identity pages) · **Full palette** (3-4 named roles) · **Drenched** (the surface IS the color — campaign heroes).
- **Anti-cream rule**: the warm cream/sand/beige body background is the saturated AI default (cluster 1 in the Process section). "Warm/artisan/editorial" briefs do NOT translate to a near-white warm bg — carry warmth via accent, typography, and imagery; pick a saturated brand color, a chroma-0 off-white, or a darker brand-tinted midtone instead.
- Dark vs light is never a default. Write one sentence of physical scene (who uses this, where, under what light, in what mood) — if the sentence doesn't force the answer, add detail until it does.
- Chroma tiers (low saturation reads premium): large backgrounds 0.01-0.04, brand/accent 0.08-0.15, small CTA pops 0.15-0.22.
- 60/30/10 as visual weight: 60% neutral/whitespace, 30% secondary, 10% accent. The accent works BECAUSE it is rare — never on inactive states.
- Never raw `#000`/`#FFF`. Dark themes: tinted near-black at 12-18% L; elevate surfaces by lightening (3 steps ≈ 15/20/25% L, same hue), not by piling shadows.
- Contrast: ≥ 4.5:1 body (placeholders too), ≥ 3:1 large text and meaningful UI. Never gray text on a colored background — use a darker shade of the background's own hue. Muted text from the neutral ramp, not `opacity`. Heavy `rgba()` everywhere = incomplete palette; define explicit overlay colors.
- One gray family per page — never mix warm and cool grays. Sample palette hues from real brand assets/content imagery when they exist; write one sentence justifying the palette (can't write it = you're copying a recipe).

**Depth & surfaces**

- ONE depth strategy per surface — hairline borders, layered shadows, or surface-tint elevation. Mixing all three on one card is slop. The ghost-card combo (1px border + soft wide ≥16px-blur shadow) is banned: pick one.
- Shadows layered and tinted with the background hue: `0 1px 2px hsl(var(--shadow-hue) 30% 10% / 0.06), 0 4px 12px … / 0.08, 0 16px 32px … / 0.08`. Never the default gray `0 4px 8px rgba(0,0,0,0.1)`.
- **Shape lock**: one radius system per page — all-sharp (0), all-soft (8-16px), or all-pill. Cards top out at 16px; 24px+ on cards is the over-round tell. Nested radius = parent radius − parent padding.
- **Theme lock**: one theme per page. `bg-zinc-950` next to `bg-zinc-900` is fine; a light section sandwiched into a dark page is broken. Max one deliberate theme-switch device per page.

**Motion**

- The 100/300/500 rule: 100-150ms instant feedback (press, toggle) · 200-300ms state changes (hover, menu, tooltip) · 300-500ms layout changes (accordion, modal, drawer) · 500-800ms entrances (hero only). Exits run at ~75% of entrance duration.
- Easing tokens: `--ease-out-quart: cubic-bezier(0.25,1,0.5,1)` · `--ease-out-quint: cubic-bezier(0.22,1,0.36,1)` · `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)`. Springs fine (`stiffness: 100, damping: 20`). **Banned**: `linear` for UI, bounce `cubic-bezier(0.34,1.56,0.64,1)` and elastic easings — dated and tacky (small overshoot is OK on toggles only).
- Stagger 30-60ms per item, total sequence ≤ 500ms; more items → shorter per-item delay.
- Animate only `transform`, `opacity`, `color`, `box-shadow` (grid-template-rows or FLIP for expansion; blur/clip-path allowed when bounded and verified smooth). Never `transition: all`. Never `width/height/top/left/margin`.
- **Reveal safety**: content must be visible by default; animation enhances it. Never gate visibility on a class-triggered transition (hidden tabs and headless renderers ship the section blank). The safe scroll-reveal shape is an `IntersectionObserver` that ADDS an "animate-in" class to already-visible content. If you must start from a hidden state, the hiding rule has to be conditional on JS actually running — a `.js` class that a script sets on `<html>`, or `@media (scripting: enabled)`. Never use `prefers-reduced-motion: no-preference` as that guard: it matches by default in every browser and in headless renderers, so the content stays hidden exactly when the observer never fires.
- Stagger within one list is legitimate; each reveal should fit what it reveals. The uniform whole-section fade-and-rise is the reflex to suppress — see Design principles for why suppressing it is not the same as shipping zero motion.
- Motion must be motivated by hierarchy, feedback, story, or state — "looked cool" is invalid. Product UI: state-conveying 150-250ms only, no load choreography ever. Pause ≥ 300ms before a key reveal (reaction time); end sequences with a hard stop, not a fade.
- Scroll tech: `useScroll`/`useMotionValue`/`ScrollTrigger`/`IntersectionObserver`/CSS `animation-timeline` — never raw scroll listeners or `useState` for continuous values (a `useState` per scroll event re-renders the whole subtree every frame). GSAP pins: `start: "top top"` (not `"top center"` — the #1 pin failure), `pin: true`; horizontal pan: `end: "+=" + (track.scrollWidth - innerWidth)`, `scrub: 1`, `invalidateOnRefresh: true`. Max 1 marquee per page.
- anime.js is a reasonable choice for timeline-sequenced micro-animation where GSAP is overkill; it is subject to the same easing bans, the same allowed-property list, and the same reduced-motion requirement.
- `@media (prefers-reduced-motion: reduce)` alternative for every animation. Non-negotiable.

**Interaction states**

- Every interactive element ships: default, hover, `:focus-visible`, active, disabled, loading, error/success where applicable. Focus ring: 2-3px, offset outside the element, ≥ 3:1 contrast, on-brand.
- Hover states move or reveal something (lift `translateY(-2px)`, underline slide, icon nudge) — not just a color dim. Press: `translateY(2px)` or `scale-[0.98]` at ~100ms.
- Touch targets ≥ 44×44px even when the visual is smaller (expand via `::before { inset: -10px }`).
- Dropdown clipping: use the Popover API, native `<dialog>`, or a portal + `position: fixed` — never `position: absolute` inside `overflow: hidden` (the single most common generated-code bug).
- Forms: validate on blur (not per keystroke), errors below the field with `aria-describedby`, placeholders are not labels. Skeletons > spinners. Undo > confirm (confirm only for irreversible/batch).
- Working-memory caps: ≤ 4 metrics above the fold, ≤ 5 top-level nav items, ≤ 4 fields per visual group, ≤ 3 pricing tiers, 1 primary button per view.

**Imagery & icons**

- Image-led briefs (restaurant, hotel, travel, fashion, product, photography) REQUIRE real imagery — CSS scenery, decorative gradient panels, or div-built fake screenshots/dashboards are broken implementations, not interpretations.
- Source order: generation tools → seeded placeholders (`https://picsum.photos/seed/{descriptive-keyword}/1600/900`) → labeled TODO slots. Verify real URLs before referencing (guessed photo IDs ship as broken images). Apply CSS treatment (grayscale, `contrast-125`, duotone, `mix-blend-luminosity`) so photos don't read as stock. One decisive photo > five mediocre.
- When generating images: describe subject, lighting, and treatment in the prompt, request the aspect ratio the slot actually needs rather than cropping a wrong one to fit, and regenerate instead of crop-fixing a bad composition. Reuse the same lighting and treatment language across every image on a page so the set reads as one shoot.
- ONE icon family per project (Phosphor, Heroicons, Tabler — or the project's existing set), one stroke width (1.5 or 2.0). No emoji as icons. No hand-rolled "sketchy" SVG illustration scenes — no illustration beats bad illustration. Real brand logos via `https://cdn.simpleicons.org/{slug}`.

## Layout Discipline

**Hero**

- Fits the initial viewport (`min-h-[100dvh]`, never `h-screen`). Max 4 text elements: (eyebrow OR brand strip) + headline + subtext (≤ 20 words) + CTAs (1 primary + ≤ 1 secondary, labels ≤ 3 words).
- Banned inside the hero: trust micro-strips, avatar rows, pricing teasers, feature bullets, logo walls (own section below the fold), floating badge/stamp icons, pills overlaid on images, raw stat blocks.
- One CTA label per intent page-wide ("Get in touch" and "Let's talk" on one page = fail). Button text contrast always perfect: dark bg → white text, light bg → dark text.

**Section rhythm**

- **Eyebrow rationing**: the tiny uppercase-tracked kicker above a heading — max 1 per 3 sections, hero included. Countable check: `uppercase tracking` occurrences ≤ ceil(sections/3). Default fix: delete it; the headline is enough.
- Numbered section markers (01 / 02 / 03) only when the content IS a real ordered sequence — a process, a typed timeline, something where order carries information the reader needs. Meta-labels ("SECTION 01", "ABOUT US" as decoration) are banned outright.
- **Layout diversity quota**: a layout family (split hero, zigzag pair, card grid, full-bleed band, editorial columns…) appears at most ONCE per page — 8 sections need ≥ 4 distinct families. Zigzag image/text alternation caps at 2 consecutive.
- Section vertical rhythm at low density: `py-24`–`py-48` desktop, roughly half on mobile. Sections read as distinct chapters.

**Grids & cards**

- Three-equal-feature-cards is banned. Use asymmetric fractions (`grid-template-columns: 2fr 1fr 1fr`), split-screens, masonry, or spacing-and-divider layouts.
- Bento grids: exactly N cells for N items — no blank filler tiles; `grid-auto-flow: dense` and verify col/row spans interlock with zero voids. 3-5 intentional cells beat 8 messy ones; at least a third must carry real visual variation (image, chart, pattern), not all white-on-white text.
- Cards are the lazy default — use them only when they're truly the best affordance; never nest cards in cards. Breakpoint-free grids: `repeat(auto-fit, minmax(280px, 1fr))`.
- Nav: single line at desktop, 64-72px tall. Semantic z-index scale (dropdown → sticky → backdrop → modal → toast → tooltip); never `z-[9999]`.

## Writing and copy

Words appear in a design for one reason: to make it easier to understand, and therefore easier to use. They are design material, not decoration. Bring the same intentionality to copy that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's side of the screen. Name things by what people control and recognize, never by how the system is built. A person manages notifications, not webhook config. Describe what something does in plain terms rather than selling it. Being specific is always better than being clever.

Use active voice as default. A control should say exactly what happens when it's used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the register conversational and tuned: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each element do exactly one job. A label labels, an example demonstrates, and nothing quietly does double duty.

The hard limits on top of those principles:

- Per section: headline ≤ 8 words, supporting text ≤ 25 words, one visual or CTA. Quotes ≤ 3 lines with name + role. Lists > 5 items need a different component (grouped columns, tabs, cards) — never a long `<ul>` with dividers.
- Realistic messy numbers (`$48,217`, `+7.3%`, `12,304 users`) — never fabricated stats presented as real, never fake-round (`10,000+ customers`, `99.99%`). An honest labeled placeholder beats an invented metric.
- Banned copy: "Elevate", "Seamless", "Unleash", "Empower", "Supercharge", "Next-Gen", "Game-changer". Banned furniture: scroll cues ("Scroll to explore"), version stamps (BETA / v1.4.2), fake photo credits, decorative status dots, locale/time/weather strips. Step labels are verb-nouns ("Install, Configure, Ship"), not "Stage 1/2/3".
- No em-dash (`—`) in visible UI copy — zero tolerance; it is the most reliable AI copy tell. Use a period, comma, or rewrite.
- Copy self-audit before shipping: re-read every visible string; rewrite anything grammatically broken, referent-less, or "trying to sound thoughtful". Plain and specific beats cute.

## Analysis, extraction, and performance

**Judging visual quality.** The Self-Review Gate below is the analysis procedure — run it against your own output, and against any page you are asked to critique. The judgment half (squint, delete, concept veto, category-reflex, the verdict) diagnoses whether a design has a point of view. The mechanical half (375px check, contrast floors, countable checks) catches the failures that judgment talks itself out of. When reviewing someone else's page, report findings in that same order: what the design is trying to be, then where execution breaks it.

**Extracting a design system from an existing page or brand.** Sample real colors from the artifact rather than eyeballing them, and build the OKLCH ramp from the sampled hue. Measure two adjacent heading sizes to infer the type scale ratio. Find the smallest repeated gap to infer the spacing unit. Name the depth strategy (borders, shadows, or tint) and the radius system — those two carry most of a brand's surface character. Identify the icon family and stroke width. Write the result as a token table, and when the user approves it, record it in `./.athena/docs/design-guidelines.md` so later work inherits it instead of re-deriving.

**Performance.** Fonts: `font-display: swap`, preload only the critical body weight (see Typography), and subset when the face is large — webfont swap is the main source of layout shift on a type-led page, so reserve space with matched fallback metrics (`size-adjust`, `ascent-override`). Images: explicit `width`/`height` or `aspect-ratio` on every image to reserve layout, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero image only. Animation: the allowed-property list in the Motion block is a performance rule as much as a craft rule — animating layout properties forces reflow on every frame. Test the real thing on a throttled connection before calling it done.

## Absolute Bans (match-and-refuse)

If you're about to write any of these, stop and rewrite the element with different structure:

- **Fonts**: Inter/Roboto/Arial/system-ui as display type. Burned-out AI-tell faces: Fraunces, Space Grotesk, Playfair Display, Instrument Serif (substitutes: Schibsted Grotesk, Archivo, Libre Caslon, Bodoni Moda). Never the same serif or palette family twice in a row across generations. Display fonts in labels, buttons, or data.
- **Color**: purple-gradient-on-white; raw `#000`/`#FFF`; oversaturated evenly-distributed palettes; cream/beige-by-default (see anti-cream rule); mixing warm and cool grays; full-saturation accents on inactive elements; flag-color palettes for cultural briefs.
- **Surfaces**: side-stripe borders (`border-left` > 1px as colored accent on cards/callouts); gradient text (`background-clip: text`); glassmorphism as default; ghost cards (1px border + wide soft shadow); over-rounding (24px+ card radius); `repeating-linear-gradient` stripe backgrounds; decorative grid-line backgrounds (unless the surface is literally a canvas/map/blueprint); neon outer glows; custom cursors (unless asked).
- **Layout**: centered hero + 3 equal cards template; hero-metric template (big number + label + stats + gradient); identical icon-heading-text card grids; eyebrow kicker on every section; numbered markers as scaffolding; `h-screen`; big rounded icon above every heading; split-header (huge left headline + small right paragraph).
- **Components**: default unstyled shadcn; mixed icon families; monospace as costume for "technical"; custom scrollbars and reinvented form controls; modal as the first thought in product UI.
- **Content**: "John Doe", "Acme Corp", lorem ipsum, round fake numbers, AI copy clichés, meta-labels, em-dashes in UI copy.

Every ban has a legitimate exception path: the user explicitly asked for it, or the existing brand genuinely uses it. Exceptions are stated out loud, never silent.

## Self-Review Gate (mandatory before delivering)

Run this against your output. Each item is pass/fail — fix EVERY failure before presenting. Do not rationalize a failure as a stylistic choice. The only sanctioned narrowing is Quick mode, which runs the countable and binary halves; every other input mode runs all twenty.

**Countable checks (mechanically verifiable — actually count):**

1. Uppercase-tracked kickers ≤ ceil(sections / 3).
2. Em-dash count in visible copy = 0. Banned-word grep ("Elevate", "Seamless", "Unleash"…) = 0.
3. No layout family appears twice. Marquees ≤ 1. Zigzag runs ≤ 2.
4. Every spacing value sits on the 4pt scale; every color/size traces to a token.

**Binary checks:** 5. Fonts are not Inter/Roboto/Arial/system as display; display ≠ body; neither is on the burned-out list. 6. No raw `#000`/`#FFF`; neutral ramp is brand-tinted; accent ≤ 10% of surface (unless a declared Committed/Drenched strategy). 7. Hero H1 ≤ 3 lines and ≥ 2.75rem desktop; hero has ≤ 4 text elements; no banned hero furniture. 8. One depth strategy; one radius system; one theme (no stray light section in a dark page). 9. Every interactive element has hover + `:focus-visible` + active; focus ring visible; touch targets ≥ 44px; inputs ≥ 16px. 10. No `transition: all`; easings from the token set; reduced-motion alternative present; content visible without JS/animation. 11. Content is realistic and domain-specific; image-led sections have real imagery, not CSS scenery. 12. Verified at 375px: no horizontal scroll, headline doesn't overflow, layout composes rather than shrinks. 13. Body text contrast ≥ 4.5:1 (including muted text and placeholders, against their ACTUAL backgrounds).

**Judgment checks:** 14. **Squint test**: blur your mental image — does the hierarchy still read? One clear focal point? 15. **Delete test**: for each decorative element, would removing it make the page worse? No → delete it. Consider Chanel's advice: before leaving the house, look in the mirror and remove one accessory. 16. **Concept veto**: cover the logo and product name — is it still recognizably THIS brand/topic? Swap in a competitor's name — does the design still "work"? If it works anywhere, it's a template: re-derive the form from the content (Process pass one, step 3). Execution polish cannot rescue a templated concept. 17. **Category-reflex check**, two orders: (a) could someone guess your theme + palette from the category alone? Rework. (b) Could they guess it from "category + not-the-obvious-one" (e.g. "AI tool that's not SaaS-cream → editorial-typographic")? That's the trap one tier deeper — rework again. 18. **The verdict**: would a stranger glance at this and say "AI made that"? If yes, it has failed regardless of how many rules passed. 19. You can name the ONE memorable element in one sentence, and the output visibly matches the thesis you declared. 20. **The risk check**: you took the risk named in your aesthetic thesis, and can justify it. Not taking a risk is a risk itself — a page that fails nothing and surprises no one has still failed check 18.

**How to run it.** Critique your own work as you build, not only at the end. Take screenshots if your environment supports it — a picture is worth 1000 tokens. Build to the quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected. If you have somewhere to jot down notes about directions you've already tried, use it; human creators have memory and always try something new, and notes are how you get that across passes.

If 3+ items fail on first pass, the direction was too timid — return to the Direction Menu, escalate one dimension, then fix individual items. Commit fully to distinctive visions. When uncertain, do NOT fall back to safe defaults; fall back to the Direction Menu and these rules and execute them literally.
