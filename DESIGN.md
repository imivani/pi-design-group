# PI Design Group | Website Design System

> Current implementation authority: [September 13 revision](design/BUILD_NOTES.md). The owner's later written plan and R12/R13 replace the earlier body-section order and uppercase styling below. Keep the original video hero; use three expanding service photographs, a large featured project, Design in the details, the complete archive, photographic contact and white footer. Earlier reference tables are retained as design history.

**Version 1.0 | 13 September 2026**  
**Recommended repository filename: `DESIGN.md`**  
**Companion: the owner's separate `MOTION.md`**  
**Scope: shared navigation, homepage, project archive, project detail, and supporting page templates.**


### Reading map

| Need | Section |
|---|---|
| Establish what is fixed and what is provisional | [Operating contract](#0-operating-contract) and [references](#1-visual-reference-map) |
| Set the frame, borders, spacing, and typography | [Layout](#3-layout-rails-and-spacing), [typography](#4-typography), [materials](#5-color-rules-and-materials) |
| Build the selected header and dropdowns | [Header](#6-shared-header-and-navigation) and [dropdown system](#7-dropdown-system) |
| Build the homepage | [Hero](#8-homepage-hero) and [body sections](#9-homepage-body-section-by-section) |
| Build the full portfolio | [Archive](#10-all-projects-archive) and [project detail](#11-project-detail-template) |
| Define component states and motion | [Components](#13-component-specification) and [motion handoff](#14-motion-handoff-to-motionmd) |
| Prepare real content and imagery | [Assets](#16-photography-video-and-other-assets) and [content model](#17-content-model-and-migration-rules) |
| Review the implementation | [Accessibility](#18-accessibility-requirements), [performance](#19-performance-and-implementation-boundaries), [acceptance gates](#20-implementation-sequence-and-acceptance-gates) |
| Start Codex | [Implementation contract](#24-codex-implementation-contract) and `CODEX_START.md` |

## 0. Operating contract

Build the approved PI Design Group website, not a new interpretation of a fashionable architecture website. Preserve the dark video hero, restrained translucent navigation, photographic dropdown, white editorial body, Helvetica character, and continuous light-gray structural rules in the supplied references.

The intended character is an established, highly regarded design practice: clear, precise, composed, and confident. The owner's comparison to an elite financial institution describes the standard of presentation and reliability. It does not authorize financial branding, navy-and-gold decoration, claims of prestige, or imitation of another company's identity.

The work and its documentation establish credibility. Animation improves the experience of browsing that work. Neither should pretend the practice is larger, older, or responsible for more projects than the evidence supports.

### Authority and evidence

| Label | Meaning |
|---|---|
| **LOCKED** | A direction explicitly selected in the conversation or a defining visual relationship in the approved references |
| **SPECIFIED** | A concrete implementation decision introduced here to make the selected direction buildable |
| **PROVISIONAL** | Copy, content, or a detail requiring owner confirmation |
| **CONDITIONAL** | A feature to show only when its real content and functionality exist |

All pixel values, breakpoints, opacity values, and composition measurements in this document are **SPECIFIED starting values**, not measurements extracted from source code or a frame-by-frame recording. The screenshots establish appearance and visible states. They do not establish exact font files, hidden behavior, or measured timing.

**Responsibility split:** `DESIGN.md` owns composition, typography, colors, surfaces, content hierarchy, component anatomy, and the states that must exist. `MOTION.md` owns animation execution, interruption, motion preference handling, and motion testing. Section 14 maps the two. The supplied motion document explicitly says it does not authorize a visual redesign and that useful content must remain available without animation. [M01: Operating contract](MOTION.md#contract)

Resolve conflicts in this order: functional correctness and accessibility, truthful approved content, the owner's explicit design selections, this document's component specifications, then optional motion flourishes. Do not quietly substitute a new layout because an animation is easier to build another way.

### Non-negotiable build rules

- Reuse the existing hero video. Do not replace it with an AI-generated film, stock architecture montage, or unrelated aerial footage.
- Keep real text in HTML. Do not use the supplied website screenshots as finished page backgrounds.
- Keep native page scrolling. No wheel interception, fake scrollbars, compulsory pinned sequences, or mandatory entrance animation.
- Preserve all real project routes and content. Audit broken links rather than copying them.
- Use the approved imagery and content inventory for production. The generated concepts contain sample information, not a verified portfolio database.
- Read the existing repository and preserve its working framework, CMS, and dependencies. This design system does not require a stack migration.
- Build the static composition first, but do not consider the project finished until the specified interactive states and motion have been implemented and tested.

## 1. Visual reference map

The reference images are included in `design/references/` in the complete handoff package. The standalone Markdown remains a complete written specification, but the images make visual comparison substantially easier.

| ID | Reference | Authority | Borrow |
|---|---|---|---|
| R01 | [Approved hero and Projects dropdown](design/references/R01-hero-and-projects-menu.png) | LOCKED | Full-bleed darkened video, full-width header, lower-left headline, large anchored dark dropdown, category rail, three photographic previews |
| R02 | [Approved white homepage sections](design/references/R02-homepage-white-sections.png) | LOCKED | Shared outer rails, thin dividers, three project columns, numbered service columns, text-and-image studio section |
| R03 | [Selected lower-page direction](design/references/R03-homepage-lower-sections.png) | SPECIFIED continuation | Featured project, four-step approach strip, contact section, compact footer |
| R04 | [All Projects grid](design/references/R04-all-projects-grid.png) | LOCKED visual direction | White archive, category filters, Grid / Index, image-led cards, short metadata |
| R05 | [Category list with image preview](design/references/R05-dropdown-category-preview.png) | Interaction reference | A stable list beside one image that changes with the highlighted item |
| R06 | [Two photographic dropdown panels](design/references/R06-dropdown-photo-panels.png) | Interaction reference | Compact, paired visual destinations inside the same dropdown system |
| R07 | [Existing video frame](design/references/R07-existing-video-frame.png) | Media continuity reference | The actual streetscape subject matter and landscape emphasis |
| R08 | [Thin structural rule reference](design/references/R08-hairline-structure-reference.png) | Structural reference only | Subtle boundaries and aligned rails, not the technology-company palette, logos, copy, or graphics |

### What must not carry over from the concepts

The approved images contain inconsistent wordmarks, different navigation labels, sample project locations, invented or unconfirmed project entries, a sample experience claim, a sample copyright date, and decorative controls. Approval of the visual direction is not approval of those facts.

Examples to resolve explicitly:

- The concepts label D'Arcy with conflicting cities. The current public PI site describes its D'Arcy work in Okotoks. Treat that as a migration lead, then confirm the exact project and location with the owner. Do not copy the concept's Edmonton or Calgary label. [S01]
- Names such as River Valley Renewal, West District, University District, Oakridge Centre, and Meewasin Trail are not established as PI commissions by the supplied materials. They are not approved portfolio entries merely because they appear in a generated mockup.
- The phrase “For over two decades” is not an approved statement about the firm's operating history.
- Do not copy sample office locations, telephone numbers, email addresses, social accounts, project counts, awards, or a claim that PI designed an entire neighborhood.
- A `01 / 04` hero indicator is meaningful only when there are four real selectable media items. One looping video does not require a carousel indicator.
- The archive reference shows both pagination and “Load More.” The specified archive below uses neither at the expected initial portfolio size. Do not implement two competing pagination systems.
- The references show different wordmarks. Section 2 chooses one consistent treatment rather than alternating between them on scroll.

The difference between a concept image and a production asset must remain explicit in the repository. Keep these reference files out of the published portfolio media collection.

## 2. Identity and visual character

### The fixed visual relationship

**Dark, immersive media at the top. White, carefully structured documentation below.**

Use photography and actual project information to create interest. Use typography, spacing, and rules to organize it. Use translucency only where a control surface sits above media or content.

The site is not a lifestyle brand, a startup landing page, a luxury property sales brochure, or a creative-agency experiment. Avoid giant marketing claims, gold accents, floating blobs, ornamental gradients, marble textures, animated grain, and superlative language about the firm.

### Wordmark

The selected hero uses the full name `PI DESIGN GROUP` with restrained tracking. Use this full-name treatment consistently in the header and footer, with inverse color over the hero and dark color on white.

**Specified provisional text treatment:** 20px, medium weight, `0.12em` letter spacing, one line. Use 17px on small screens, with tracking reduced to `0.08em` when necessary. Do not condense the letters with a horizontal transform.

If the owner supplies an approved vector wordmark, use it instead. Its proportions and spacing override the provisional text treatment. Preserve its aspect ratio and do not redraw it by eye.

The large `PI` monogram in some body concepts is an alternate identity treatment, not permission to introduce a second logo. Do not switch between that monogram, the tracked full name, and the existing mixed-case wordmark across pages without an explicit brand decision.

### Color and imagery relationship

The interface remains neutral. Green foliage, warm planting, blue skies, and material colors come from the photographs and video, not from a new interface accent palette. The blue-gray quality of the approved hero comes from its media and dark overlay. It is not a requirement to tint every page blue.

### Density

Use spacious panels, not empty screens. Preserve large photographs and readable copy while increasing the breathing room within the approved grid. Do not inflate the page with decorative 200px gaps between every section, and do not squeeze an entire homepage into one desktop viewport to resemble a concept sheet.

## 3. Layout, rails, and spacing

### 3.1 Shared page frame

Use one centered content frame across the header, hero content, section headings, project grid, studio panels, and footer.

| Property | Specified value |
|---|---|
| Maximum frame width | 1440px |
| Desktop outer gutter, 1200px and wider | 64px minimum on each side |
| Tablet outer gutter, 768px to 1199px | 40px on each side |
| Mobile outer gutter, below 768px | 20px, reduced to 16px below 360px |
| Structural rail thickness | 1 CSS pixel |
| Desktop panel inset | 24px for project cells, 40px for narrative panels |
| Tablet panel inset | 24px |
| Mobile panel inset | 20px, or 16px on the narrowest layout |
| Main logical layout | 12 columns, composed into halves, thirds, quarters, and 5/7 or 8/4 splits |

Frame width is the smaller of 1440px and viewport width minus the two outer gutters. At a 1440px viewport, the frame is 1312px wide. At 1920px, it is capped at 1440px and centered. Do not stretch body paragraphs across an ultrawide monitor.

The video remains edge-to-edge. Its foreground content aligns to the same frame, with the same internal panel inset used by the section text below. This produces a consistent text axis despite the change from dark media to white content.

### 3.2 Border ownership

The body should read as one joined editorial frame, not as a stack of unrelated rounded cards.

Assign each shared edge a single owner. The frame owns the outer vertical rails. A section owns its top rule. The section heading band owns its bottom rule. A cell owns its right divider except at the row edge. Following rows own their top dividers. The final footer owns the closing bottom rule.

Do not apply a full border to every nested wrapper. That creates double-thickness seams and dark intersections. Recalculate right and top borders at each responsive column count. The first row must not acquire a second rule directly beneath the section heading.

Rules are decorative structure, not interaction. They never block pointer input, cross through text, or become focus targets. Do not draw a visible 12-column grid behind every section. Show only meaningful panel boundaries.

### 3.3 Spacing scale

Use a shared scale of `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128` CSS pixels. Choose from the scale instead of adding arbitrary one-off margins.

| Relationship | Desktop | Mobile |
|---|---:|---:|
| Section heading band vertical padding | 28 to 32px | 24px |
| Heading to nearby supporting paragraph | 16 to 24px | 16px |
| Paragraph to action | 24 to 32px | 24px |
| Image to first metadata line | 16px | 16px |
| Project title to category | 8px | 8px |
| Narrative panel vertical padding | 48 to 64px | 32px |
| Standalone contact invitation padding | 64 to 80px | 40px |
| Between adjacent sections | Shared rule, not an extra spacer by default | Shared rule |

When a panel contains little text, let the panel remain open and airy. Do not insert filler copy to occupy the available space. Height should normally be content-driven. Minimum heights are acceptable for desktop composition, but must relax for enlarged text and narrow screens.

### 3.4 Responsive compositions

| Component | Wide desktop, 1200px+ | Tablet, 768px to 1199px | Mobile, below 768px |
|---|---|---|---|
| Full navigation | Full link group and utility area | Compact wordmark, Projects link, Menu | Wordmark and Menu |
| Project archive | 3 equal columns | 2 equal columns | 1 column |
| Homepage selected projects | 3 equal columns | 2 columns, third continues naturally | 1 column |
| Services | 3 columns at 1024px+ | 1 column below 1024px | 1 column |
| Studio / Why PI | 5/7 split | 1 column below 1024px | 1 column |
| Featured project | 8/4 split | 1 column below 1024px | 1 column |
| Approach | 4 columns | 2 by 2 | 1 column |
| Contact | 5/7 split | 1 column below 1024px | 1 column |
| Footer | Horizontal groups | Wrapped groups | Stacked groups |

These are implementation starting points. If real labels or browser zoom no longer fit, enter the compact composition earlier rather than reducing the font size. Do not enlarge the last project card solely to fill an incomplete row.

## 4. Typography

### 4.1 Family and font delivery

**Locked character:** Helvetica-like, neutral, architectural sans serif. One family should handle display, body, navigation, buttons, and metadata.

First inspect the existing site's rendered font and the repository's font assets. The screenshots and parsed public page do not establish the exact font file or weight currently used. Do not claim an exact font match without checking it in the actual browser.

The specified fallback stack is:

```css
--pi-font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
```

An existing, approved, licensed Helvetica-family webfont should take precedence when available. A stack alone does not guarantee identical letter shapes across devices. If a licensed webfont is needed for cross-platform consistency, obtain it through the owner and configure the approved delivery method. Do not extract a font from an operating system, another site, or this handoff package.

No font binaries are included. Do not substitute Inter, Segoe UI, a geometric display face, or a serif simply because those were used in a different project. Do not load several new families for variety.

### 4.2 Weights and texture

Use regular weight for most display headings and body copy. Use medium for selected navigation, compact headings, and emphasis. Reserve bold for brief functional emphasis, not every large headline.

Use actual available font weights. If the chosen face does not supply a medium weight, use the nearest approved real weight rather than synthetic styling. Never simulate weight with text stroke, shadows, or duplicated text.

The typography should have the quiet, substantial quality of the approved images, not ultra-thin fashion typography or heavy startup headings.

### 4.3 Type scale

Values below are CSS pixel equivalents at the default 16px root size. Implement with `rem` and bounded fluid sizes. Keep the root font at the browser default rather than resetting it to an artificially small percentage.

| Role | Desktop | Tablet | Mobile | Weight | Line height | Tracking |
|---|---:|---:|---:|---|---|---|
| Hero headline | 80 to 96 | 60 to 76 | 42 to 52 | Regular | 1.02 to 1.06 | -0.035em |
| Page title | 60 to 80 | 48 to 64 | 38 to 44 | Regular | 1.06 | -0.03em |
| Contact statement | 44 to 56 | 40 to 48 | 32 to 38 | Regular | 1.08 | -0.03em |
| Section band heading | 28 to 32 | 28 | 26 to 28 | Regular | 1.15 | -0.025em |
| Narrative / service heading | 26 to 32 | 24 to 28 | 23 to 26 | Regular | 1.15 to 1.2 | -0.02em |
| Project card title | 22 to 24 | 22 | 22 | Regular or medium | 1.2 | -0.02em |
| Hero supporting text | 20 | 19 | 17 to 18 | Regular | 1.5 | 0 |
| General body | 17 to 18 | 17 | 16 to 17 | Regular | 1.5 to 1.6 | 0 |
| Navigation / buttons | 15 to 16 | 16 | 16 | Regular or medium | 1.25 | 0 |
| Category / secondary metadata | 14 to 15 | 14 | 14 | Regular | 1.4 | 0 |
| Small uppercase label | 12 to 13 | 12 to 13 | 12 to 13 | Medium | 1.4 | 0.10em |
| Footer links and contact details | 14 | 14 | 14 | Regular | 1.5 | 0 |

Small uppercase labels are for short items such as `LANDSCAPE ARCHITECTURE` or a verified city. They are not the place for a long service description. Keep important project facts at least 14px where practical.

### 4.4 Text width and line breaks

Keep hero copy in a left-aligned column of roughly 680 to 780px on wide desktops. The supporting paragraph should be narrower, about 520 to 580px. General reading copy should remain around 55 to 68 characters per line.

The approved headline's visual shape is two substantial lines, not one sentence stretched across the entire hero. Preserve that shape. The exact wording remains provisional. The concept says “Shaping Places People Belong.” A grammatical copy option is “Shaping places / where people belong.” Do not silently claim either has final copy approval.

Use deliberate editorial line breaks for the desktop hero only when needed. On mobile, permit natural wrapping rather than preserving a line break that creates an isolated word or horizontal overflow.

Do not force a long service into one line. `Multifamily Residential Landscape Design` may occupy two or three readable lines. Technical meaning takes precedence over a perfectly identical heading height. Do not shorten it to `Residential` merely to balance a column.

Use sentence case or restrained title case for readable content. All caps are reserved for the wordmark, short labels, and small indices. Do not set whole paragraphs or all navigation in tracked capitals.

### 4.5 Writing rules

Write plainly and specifically. Describe PI's role, the project type, a real design challenge, and what was delivered. Avoid generic promises about transforming the future, “visionary clients,” or “unparalleled excellence.”

Use Canadian English where relevant. Do not use em dashes or semicolons in marketing copy. Do not invent quotations, testimonials, outcomes, years of experience, awards, team size, or environmental performance.

Headings should identify the content. Repeated secondary slogans at the right of every section are optional and should be omitted when they add no information. The layout still works without them.

## 5. Color, rules, and materials

### 5.1 Core tokens

| Token | Value | Use |
|---|---|---|
| `--pi-page` | `#FFFFFF` | Main page and panels |
| `--pi-soft` | `#F7F8F8` | Restrained hover fill or a local neutral fallback |
| `--pi-ink` | `#141719` | Headings, primary text, filled buttons |
| `--pi-secondary` | `#62686F` | Body support, categories, secondary metadata |
| `--pi-rule` | `#E2E5E7` | Decorative section rails and cell boundaries |
| `--pi-rule-strong` | `#CBD0D4` | Optional stronger structural emphasis |
| `--pi-control-edge` | `#737A80` | Identifiable outlined controls on white |
| `--pi-inverse` | `#FFFFFF` | Hero and dark-menu text |
| `--pi-inverse-secondary` | `#D5DADF` | Secondary text on sufficiently opaque dark surfaces |
| `--pi-dark-solid` | `#192126` | Opaque dark navigation fallback |
| `--pi-error` | `#A12622` | Form error text, not decorative branding |
| `--pi-success` | `#24583B` | Confirmed functional success only |

Use light structural lines without making functional controls faint. A decorative divider and an input boundary serve different purposes. Informative text and essential control indicators need their own contrast checks. [S04] [S05]

### 5.2 Material hierarchy

| Surface | Treatment |
|---|---|
| Hero media | Actual video plus a stable readability overlay |
| Header over hero | Dark, lightly translucent, modest backdrop blur |
| Desktop dropdown | Dark, more opaque than the header, restrained blur and one subtle shadow |
| Header over white content | White or nearly opaque white, dark text, light bottom rule |
| Body panels and project cards | Solid white, no blur, no shadow |
| Form fields | Solid white or a very subtle neutral fill |
| Lightbox | Opaque or nearly opaque dark viewing surface |

The desktop header is **full width and square edged**, as in R01. It is not the floating rounded bar from an earlier unselected concept. The dropdown is the rounded floating surface. Preserve that distinction.

### 5.3 Glass recipe

Specified dark header starting point: `rgba(22, 30, 35, 0.68)` with 12px backdrop blur. Specified dropdown starting point: `rgba(22, 29, 33, 0.94)` with 18px backdrop blur, a 1px white edge at roughly 16% opacity, and a restrained dark shadow.

The dropdown has a 14px corner radius. Its photographic previews may have a 6px radius. Project images in the page body remain square. Standard buttons use 0 to 2px radius. A circular control is reserved for play/pause or another genuinely icon-only control.

`backdrop-filter` affects content behind a surface and needs a suitable translucent fill for that treatment to show. Provide a readable opaque fallback instead of relying on blur for contrast. [S06]

Do not animate blur radius across the whole viewport. Do not apply a `filter: blur()` to the menu container and blur its own text. Do not lower the opacity of an entire navigation group, which would also weaken its labels.

### 5.4 Hero overlay

Start with a moderate overall dark scrim and a stronger lower-left gradient behind the headline. A starting range is approximately 20% to 35% black overall, with additional left/bottom darkening where the text sits. These are tuning values, not a contrast guarantee.

Keep the actual landscape legible. Avoid heavy global blur, muddy black shadows, or an artificial color grade. The approved effect is achieved primarily through darkening and composition, not hiding the work.

Check text and controls against the brightest relevant frames of the real clip. If contrast fails, strengthen the local scrim or change the text placement. Do not solve it with large text shadows.

## 6. Shared header and navigation

### 6.1 Anatomy

At wide desktop sizes, preserve the reference's horizontal arrangement:

```text
PI DESIGN GROUP     About   Approach   Projects v   Services v   Insights   Contact     Search | short descriptor
```

This is the maximum content model, not a requirement to fabricate six destinations. `Projects` and `Services` are disclosure buttons. `About`, `Approach`, `Insights`, and `Contact` are ordinary links when their destination exists. The wordmark returns to the homepage.

Suggested initial destination mapping:

| Label | Initial destination | Publication rule |
|---|---|---|
| About | Homepage studio section or an approved Studio page | Use one consistent destination |
| Approach | `/#approach` | Retain when the process section exists |
| Projects | Opens Projects dropdown | “All Projects” inside links to the archive |
| Services | Opens Services dropdown | Service links must land on real sections or pages |
| Insights | Real editorial archive | Omit if no approved articles exist |
| Contact | Contact page or `/#contact` | Direct and easy to find |
| Search | Optional project search | Omit the icon if search is not implemented |

Removing an unavailable utility or editorial link is preferable to a dead control. Record that as a content-dependent variation, not as a redesign of the selected header. Do not add a search box, command palette, careers link, or “our people” page just to make the practice appear larger.

### 6.2 Geometry

Use an 80px header on desktop and 64px on mobile. The initial implementation keeps that height stable while scrolling. Do not squeeze or scale the wordmark during a scroll transition.

Align the header's content and separators with the page frame. The wordmark has its own left region. The navigation occupies the middle. A compact utility region sits at the right. Use 24 to 28px gaps between desktop links, with each link or trigger given at least a 44px-high interaction area.

Keep the header fixed above content. On internal white pages, reserve its height before the page content. On the homepage, let the hero media extend behind it and reserve adequate internal hero padding for text. Do not add both a page offset and a second header-sized blank gap to the homepage.

### 6.3 Header states

| State | Appearance | Behavior |
|---|---|---|
| Homepage over video | Dark translucent surface, white text, fine inverse rails | Hero remains visible behind it |
| Homepage dropdown open | Same header, slightly stronger material if needed | Dropdown overlays the hero without moving content |
| Scrolled beyond hero | Nearly opaque white, dark text, light gray rule | Same layout and wordmark |
| Internal page | White header from first paint | No initial dark flash |
| Compact layout | Wordmark, optional Projects link, Menu control | Mobile navigation replaces desktop dropdown geometry |
| Reduced transparency / unsupported blur | Opaque surface with the same hierarchy | No dependence on an optical effect |

Switch the header theme when the content directly under the header changes from hero media to the white page. Do not change to white after an arbitrary tiny scroll while the header is still sitting over video. Use a stable boundary and avoid flicker near the threshold.

If a dropdown is open during the boundary crossing, keep its dark material and contrast stable. The header can resolve its own theme without recoloring the dropdown mid-interaction.

### 6.4 Link styling

Normal links are calm and readable. Hover increases emphasis through text color or a short underline. Current-page state uses an underline or another persistent marker, not color alone. An open disclosure rotates its chevron and shows its expanded state.

Do not change font weight on hover if it makes the navigation jump horizontally. Keep hit boxes stable. Focus indicators appear immediately and must remain visible on both dark and light surfaces.

## 7. Dropdown system

### 7.1 Shared behavior

Use one coordinated dropdown system, with a shared surface that can change its contents and size. The interaction should feel like moving between related sections of the same navigation, not opening a succession of unrelated modals.

The desktop dropdown is nonmodal. It does not trap focus, lock page scrolling, or blur the entire website. Site navigation should use disclosure buttons and ordinary links rather than adopting application-menu semantics just because the component is called a mega-menu. [S02]

### 7.2 Projects dropdown: primary composition

This is the **LOCKED** R01 composition.

Desktop width is approximately 1024px, capped to the available page frame. Anchor its right edge to the frame's right rail. Position it about 8px below the header. Use around 24px internal padding and 24px column gaps.

The left rail is about 190px wide. It contains “All Projects,” a short divider, then the approved categories. The right side is a three-column preview area. A typical panel height is 300 to 340px, determined by content rather than a hard crop.

```text
All Projects ->  |  [project photograph] [project photograph] [project photograph]
----------------|  Project name         Project name         Project name
Multifamily     |  Location             Location             Location
Commercial      |
Public Realm    |
Residential     |
```

Each preview is one real project link. Include one image, a readable name, optional verified location, and a small directional arrow. Do not put an extra nested button inside the link. Use a consistent preview image ratio, initially 5:4, and retain the same crop when a panel is reopened.

On first open, show three owner-selected projects. A category hover or keyboard focus may replace that preview set with projects from the relevant category. Keep panel dimensions stable while changing the preview contents. The category itself remains a normal link to the filtered archive. Do not make a touch user tap once to preview and a second time to navigate.

If a category has fewer than three publishable projects, show only those projects without duplication. Do not invent filler or stretch a single image to imply three commissions. If the three-card panel cannot fit with readable labels, use the compact navigation rather than crushing the panel.

### 7.3 Services dropdown: list and one image

Use R05's relationship, translated into PI's dark neutral material.

The left side contains the full service names with one concise line of explanation. The right side contains one large representative image. Use a stable panel around 760 to 840px wide on a full desktop, with roughly 44% list and 56% image.

Hovering or focusing a service highlights its row and crossfades the representative image within fixed bounds. The text does not move. The image caption, if present, must identify the real service or project shown. A rapid change of highlighted service should display the latest selection, not queue every skipped image.

The incoming image should be decoded before its visual handoff. Until then, keep the existing image or a quiet fallback. Never flash an empty dark rectangle every time the pointer changes rows.

### 7.4 Two-image dropdown variant

R06 establishes an optional compact variant for two genuine destinations, for example Studio and Approach if they later warrant a combined dropdown. Use two photographs with a stable dark caption scrim and clear labels.

This is **CONDITIONAL**, not an instruction to add a third dropdown. The initial About and Approach links may remain direct links. Do not force the paired-image treatment into a menu with only one real destination.

### 7.5 Input and dismissal contract

Pointer users may open a dropdown after an intentional hover delay of approximately 100 to 140ms. Click and keyboard activation open immediately. The delay prevents accidental openings while moving across the header. It is separate from the opening animation.

Use a forgiving pointer corridor between the trigger and panel. A close grace period of approximately 160 to 200ms is a starting value. Crossing the small gap must not collapse the panel. A keyboard-focused panel must not close merely because the pointer has moved elsewhere.

`Enter` or `Space` toggles the disclosure button. `Tab` and `Shift+Tab` move through real links. `Escape` closes the panel and returns focus to the controlling trigger when appropriate. Moving focus out of the navigation closes the nonmodal dropdown. Outside click closes it without stealing focus back from the clicked target. Use `aria-expanded` and a relationship to the controlled content. [S02]

When switching from Projects to Services, keep the outer surface conceptually continuous, update its bounds without scaling paragraphs, and replace the inner content. Cancellation, rapid reversal, and resize must leave one valid state. Closed or exiting content must not remain interactive.

Render the dropdown in a root overlay layer so it is not clipped by the header or unintentionally constrained by an ancestor effect. Clamp the panel inside the viewport. When necessary, constrain its height to the space below the header and allow the panel's own content to scroll. Never clip the final links under the browser edge.

### 7.6 Compact navigation

Use a white, full-height navigation dialog or sheet below the compact header. The desktop photographic menu does not become a tiny menu squeezed into a phone.

Present the same destinations in a vertical list, with Projects and Services as readable disclosures. Featured imagery is optional and secondary. Keep a visible Close control, a clear contact destination, and adequate touch targets. The mobile modal needs its own focus management and background interaction policy, unlike the nonmodal desktop dropdown.

The menu remains usable when text wraps, the device rotates, or the browser's visible height changes. Do not set a fixed height that clips links behind browser controls.

## 8. Homepage hero

### 8.1 Composition lock

Use R01 as the primary visual target. The hero is a full-width view of the existing landscape video with a dark readability treatment. Place the text low on the left. Keep the right side visually open for the project itself and the video control. The header sits above it.

No split-screen replacement, no separate glass rectangle around the headline, no centered slogan, and no illustrated or animated background replacing the real footage. Those belong to unselected alternatives.

### 8.2 Layers

```text
Hero section
  Existing video and a matching poster fallback
  Noninteractive dark readability overlay
  Shared frame and structural rails
  Lower-left text group
  Lower-right media control and optional project caption
  Bottom information rail and optional in-page scroll link
```

Keep the text and controls separate from the media layer. Do not apply opacity to the entire hero. Do not place essential wording inside the video file.

### 8.3 Geometry

On desktop, start with a hero minimum height of `clamp(44rem, 92svh, 62rem)`. Let the actual content expand the section if needed. At a 900px-tall desktop viewport, the intended composition is roughly 820 to 850px high, including the header overlay and bottom rail.

Use a text column around 740px wide. Align its left edge with the body panel text axis. Its bottom should sit about 128 to 152px above the hero's lower edge. The bottom information rail occupies around 72px. Keep comfortable separation between the title, paragraph, and primary action.

On shorter screens, reduce discretionary top and bottom space before reducing the font. On mobile, allow a naturally taller text block, reduce the headline to the mobile type scale, and move the media control below or beside the CTA. Never hide text behind an absolutely positioned footer rail.

### 8.4 Content model

| Element | Treatment | Content status |
|---|---|---|
| Eyebrow | Small uppercase `LANDSCAPE ARCHITECTURE` | Confirm professional wording with owner |
| Headline | Two large, left-aligned lines | Visual shape locked, final wording provisional |
| Description | One useful sentence, usually two to three lines | Describe actual service scope |
| Primary action | `Explore Our Work` or `View Projects` | Links to the archive |
| Secondary action | Optional quiet `Our Services` link | Use only when it improves the composition |
| Video control | Circular play/pause plus accessible label | Must reflect real playback state |
| Project caption | Short verified name and location | Omit uncertain facts rather than guessing |
| Lower rail | Restrained firm identifier and optional short descriptor | No redundant three-slogan stack |

Keep the hero's primary action visually stronger than optional utilities. One outlined light button is enough. Do not introduce a row of four calls to action.

### 8.5 Video behavior and fallbacks

Preserve the actual clip and use a matching frame as the poster. The image supplied in R07 is a reference to the subject matter, not the production video file. Locate the original clip in the existing site or owner-provided assets before building the final media pipeline.

The intended full-motion presentation is muted inline playback with looping behavior when playback is permitted. Autoplay is not a guarantee. The page must remain complete on the poster when playback is blocked or fails. Handle the actual playback result, not just the requested state. [S07]

Provide a visible pause control for the looping background. A decorative looping video presented alongside text needs real user control, not a pause icon that only stops while it is hovered. [S03]

Under the effective Reduced or Off motion policy, present the poster by default. A deliberate Play action can start the real video if the visitor chooses to watch it. Do not restart it automatically after they pause it. Pause resource-intensive playback when the hero is offscreen or the tab is hidden, while preserving the user's playback preference.

Do not add automatic volume, a soundtrack, a fake progress bar, or multiple slide indicators for a single clip. On constrained devices, the approved fallback is a still image with the same composition, not an empty block.

### 8.6 First paint and entrance

The headline, primary link, and usable navigation must be visible without waiting for video, font downloads, or an animation engine. The selected motion guide's P085 requires that stable first state. [M01: P085](MOTION.md#p085)

A supporting media handoff or short secondary-content reveal can add polish after the page is usable. Do not hide the hero for a sequential label, word, paragraph, button, and metadata performance. The final visual arrangement must be just as good with all motion disabled.

## 9. Homepage body, section by section

The page below the hero uses the R02 and R03 white editorial system. The header visible in a scrolled reference is the shared fixed header, not a second header inserted into the middle of the homepage.

### 9.1 Section order

```text
Header over existing video hero
Selected Projects
What We Design
Why PI Design Group
Featured Project
Our Approach
Contact invitation
Footer
```

This is the specified complete homepage. Insights, client logos, metrics, testimonials, awards, and additional service grids are not part of the default layout. Add them only after an explicit content decision. In particular, do not repeat “What We Design” later as a second “Our Expertise” section.

The rough desktop page-height target is 3400 to 4300px at a 1440px-wide viewport with normal copy lengths. This is a composition check, not a hard height or a reason to clip content. The site should have real breathing room without becoming the long single-project-per-row catalogue being replaced.

### 9.2 Selected Projects

A heading band contains `Selected Projects` on the left and `View All Projects` with a small right arrow on the right. Omit generic promotional copy between them unless the owner has a useful statement.

Below, show three owner-selected projects in a single desktop row. Prioritize the strongest completed work and a sensible range of actual services. Do not select solely by whether the photograph matches a generated concept's color palette.

Each cell contains a landscape photograph, optional verified location, project name, project category, and a small directional arrow. Use a 3:2 image ratio, 24px cell inset, and enough room below the image for metadata. Keep the whole cell as one project link. A name may wrap to two lines without truncation.

Cells share dividers and the same white page background. Do not give each one its own floating box, heavy outline, shadow, or rounded container. Image contrast is natural, not desaturated until hover. The title and category are visible without hovering.

The row should take roughly 420 to 500px plus its heading band at common desktop widths. Do not shrink the image to a narrow strip to fit more sections above the fold.

### 9.3 What We Design

Keep the three-column, numbered typographic treatment in R02. This section explains the practice's service categories and should not become a set of generic icon cards.

Provisional service labels are:

| Index | Working label | Confirmation needed |
|---|---|---|
| 01 | Multifamily Residential Landscape Design | Confirm whether “Community” should appear in the exact label |
| 02 | Commercial & Mixed-Use Landscape Design | Confirm the inclusion and terminology of plaza work |
| 03 | Parks & Public Realm | Confirm that this accurately describes the work being offered |

The existing public site also lists new residential builds and renovation design. That is a content inventory item requiring the owner's decision, not something to remove silently or merge into multifamily landscape work. [S01]

Use a small index and short rule, a readable service title, one concise description, and a contextual text link. The accessible link name should identify the service, not be three indistinguishable “Learn More” links without context.

Use 40px horizontal and 48px vertical panel padding on a spacious desktop. Allow headings to wrap and align the actions using a flexible layout rather than fixed-height paragraphs. At narrower widths, stack the services instead of reducing text to fit.

A short sentence at the far right of the section heading is optional. Do not duplicate the hero slogan there.

### 9.4 Why PI Design Group

Use the approved 5/7 text-to-image split. The section heading stays in its own bordered band. The left panel contains an optional short label, a two- or three-line heading, roughly 60 to 100 words of specific approved copy, and one link to the approach or studio information. The right panel holds one generous project photograph.

This section answers a different question from the services: how the practice works and what a client can reasonably expect. Content could cover principal involvement, coordination, the design process, or relevant experience only when those statements are confirmed. Do not invent a large team or an operating history.

Use the image to show the work, not as a billboard for another slogan. The small overlay phrase in R02 is optional and should normally be omitted if the surrounding copy already communicates the point. If retained, keep it short and protect contrast with a localized scrim.

On mobile, place the text before the image. Do not reorder the DOM independently of the visual reading order. Remove a fixed minimum height if the text is enlarged.

### 9.5 Featured Project

Use R03's image-left, text-right composition with an 8/4 desktop split. The heading band says `Featured Project`. The image is large enough to show a designed space, not merely a building facade.

The text panel contains verified location, the exact project name, project type, a short explanation of PI's scope, and a `View Project` action. A useful feature paragraph might describe one real site constraint or design decision. It must not claim a completed outcome or community impact without supporting information.

Prefer a project distinct from the first three homepage cards. If the same commission is intentionally repeated, use a different view and explain a new aspect of it. Do not show the same photograph twice in succession.

Choose the featured commission from the approved project inventory. `River Valley Renewal` is sample concept text, not the required project. The layout is locked in direction, not that name or image.

The feature is a static editorial block by default. No autoplay carousel, slideshow dots, or fake `01 / 04` display. A direct link is sufficient.

### 9.6 Our Approach

Use the four-step, thin-bordered band in R03. This section is about process, not a second statement of prestige.

Working labels are `Listen`, `Explore`, `Design`, and `Realize`, as shown in the concept. They remain provisional until the owner confirms the actual workflow. A more technical set of labels can replace them without changing the grid.

Each step contains a small index, a short rule, a concise heading, and around 20 to 35 words. Keep all four visible in the desktop row. There is no reason to hide them in an accordion, animate a progress line across them, or make the user click through steps.

Do not claim approvals, construction administration, site supervision, or complete delivery services merely to fill the final step. Describe the scope PI actually provides.

The desktop steps may enter as one restrained section group. They do not need to animate individually in sequence. On tablet, use two rows of two. On mobile, stack them with horizontal separators.

### 9.7 Contact invitation

Continue R03's two-part composition: a large text invitation on the left and a landscape photograph on the right. Keep the section airy, with a 5/7 split, and use a photo different from the studio and feature images.

Working heading: `Great places start with a conversation.` An equally valid plainer option is `Discuss your next project.` Exact wording is provisional. Use one short supporting sentence and one clear `Contact Us` or `Let's Talk` action.

The button must open a real contact destination or focus a real form. It should not launch a modal with no delivery system. On mobile, the invitation and action are enough if another photo makes the page repetitive. That image can be omitted without losing the essential section.

When no distinct approved photograph is available, use an all-white text-led contact band. Do not generate a fake commission to complete the composition.

### 9.8 Footer

Use a compact version of R03 rather than a sprawling corporate sitemap. The initial footer contains the same wordmark, a small group of real navigation links, verified contact or location details, and confirmed social links if available.

Keep a final light rule above the copyright line. Use the current year from application data rather than the concept's sample year. Legal links must lead to real, reviewed content. Do not add `Terms`, `Accessibility`, or `Privacy` labels with empty destinations simply because the mockup shows them.

Do not add multiple office cities, an invented generic email address, or fake social icons. The public PI site can seed a contact audit, but the owner should confirm what to publish. [S01]

The footer remains white. A new giant black footer would weaken the selected dark-hero / white-body relationship unless separately approved.

## 10. All Projects archive

### 10.1 Purpose and composition

The archive replaces the current long list with a fast visual overview of the complete approved portfolio. Use R04 for the design language, but do not reproduce its compressed lower rows or its contradictory pagination controls.

The page uses the shared white header, a concise title band, a filter row, the complete image-led grid, a small results summary, and the shared footer. It does not have a second full-height video hero.

```text
White shared header
All Projects                                   Actual project count
All   Multifamily   Commercial   Public Realm   Residential   Mixed-Use     Grid / Index
[image]                   [image]                   [image]
Location                  Location                  Location
Project title ->          Project title ->          Project title ->
Category                  Category                  Category
...additional equally sized rows...
Showing all approved projects
Footer
```

### 10.2 Title and filtering

Use a 60 to 80px page title on wide desktop with 48 to 64px top and bottom breathing room around the title group. Keep any introduction short and factual. A displayed project count is computed from the publishable collection, not hard-coded as 30.

The filter row uses plain text controls with a clear active underline. No colored pills, badges, or dashboard-style filter boxes. Each filter has a comfortable interaction area even if its visible text is small.

Choose one primary category per project for the archive, with optional secondary tags. Do not duplicate a project in the All view because it has more than one tag. Keep labels and filtering rules consistent with Services, the dropdown, and the detail page.

`All`, `Multifamily`, `Commercial`, `Public Realm`, `Residential`, and `Mixed-Use` are a working taxonomy. Show only categories that are approved and populated. The distinction between individual-house residential work and multifamily developments must remain explicit.

Store the selected category and Grid / Index state in the URL so a filtered view can be linked and browser Back can restore it. An example state is `/projects?category=multifamily&view=grid`. The final route names must follow the actual application.

On mobile, use a labeled native category select or a compact filter disclosure with readable options. Do not require horizontal page scrolling to reach a hidden filter. Grid / Index remains a small, clearly labeled two-option control.

### 10.3 Project card geometry

Use three columns at 1200px and wider, two from 768px, and one below 768px. All archive images use the same 3:2 aspect ratio within a given view. Later rows must not become progressively shorter to squeeze the entire portfolio into a screenshot.

A typical desktop card consists of 24px inset, a photograph around 240 to 300px high depending on frame width, a 16px gap, metadata, a 22 to 24px title, a category line, and bottom padding. At ordinary desktop heights, expect one full row and part or all of the next, not twelve full projects above the fold.

Use the same `ProjectCard` component as the homepage with a density variant, not a separately styled archive card. The archive may use slightly tighter vertical metadata spacing, but the typography, edge treatment, and hover language remain the same.

Keep the image as the main visual identifier. Do not overlay names on every photo or hide metadata until hover. Do not use masonry, alternating large and small archive cards, or a horizontal drag canvas.

### 10.4 Showing the full collection

For the expected roughly 25 to 35 approved projects, render the complete project collection in the document, with below-the-fold images loaded as needed. The three-column grid already reduces the length considerably relative to one full-width row per project.

Do not show both numbered pages and Load More. Do not implement an infinite-scroll trap. A visitor should be able to reach the footer and return to a specific project through browser history.

If the collection later grows enough to justify pagination, choose one deliberate model, give it a URL state, and preserve reading position. That is a future content decision, not required for the initial archive.

### 10.5 Filtering and empty states

Update the count when a category is selected. Keep retained cards recognizable, and animate only the visible small collection if the selected motion engine supports it reliably. Do not wait for every existing card to fade out before showing results.

When there are no results, show a clear message and `View all projects`. Distinguish that state from loading, a data error, and an unpublished collection. The count and message must not suggest a successful search if the underlying request failed.

There should be no default loading animation for locally available data. The archive should be useful before enhancement code runs.

### 10.6 Index view

Index is a compact text view of the same collection and filters. Use aligned columns for Project, Type, and Location, with an optional Status field when that data is consistently available. Use white backgrounds and horizontal hairlines, not zebra striping or a boxed data-grid widget.

Project names remain standard links. On mobile, show one readable row with the name followed by secondary metadata, rather than forcing a wide table into horizontal overflow. Sorting is optional and should exist only when implemented with visible state.

A pointer-hover thumbnail is a possible later enhancement. It is not required, must not obscure the list, and cannot be the only route to a project. The initial version is a clean, stable index.

## 11. Project detail template

This page family extends the selected system. It has not been visually locked by a final screenshot to the same degree as the hero and archive. The following is the specified implementation template, subject to a first-project review.

### 11.1 Page structure

```text
Shared white header
Back to Projects or breadcrumb
Large exact project name
Structured facts and a short explanation of PI's role
Large primary photograph
Editorial gallery with optional context and captions
Project credits and other verified facts
Previous / Next Project and Back to Projects
Shared footer
```

Preserve the existing project URLs unless there is an approved migration. A new internal route pattern is not permission to break inbound links. Keep a redirect map if routes change.

### 11.2 Title and project facts

Use a generous but controlled title area, not a huge heading followed by a nearly empty screen. On desktop, arrange the title and facts on the left with a short scope paragraph on the right, or place facts directly under the title when that better fits the content.

Typical facts are Location, Project Type, Status, Year, Client, and PI Scope. Render only approved fields. Do not label a publication year as completion year or infer a client from a developer logo in a photograph.

A short paragraph should describe the actual commission, not a generic neighborhood sales description. Clearly distinguish the wider development from the portion PI designed.

### 11.3 Gallery

Lead with one strong completed photograph where available. Continue with a composed gallery that can combine a full-width image, a pair of related landscape views, and a plan or detail image. Use a small set of approved layout patterns rather than arbitrary masonry.

Maintain natural image proportions. `Cover` cropping is appropriate for archive covers and selected editorial frames, but technical plans and diagrams must be shown without cutting off important information. Allow a drawing to use a white surround and a descriptive caption.

Images should remain honest representations of the project. Do not remove utilities, add planting, alter materials, or replace weather in production imagery unless the owner explicitly approves a clearly identified illustrative treatment. A rendering remains labeled as a rendering.

Do not invent a panoramic photo for every project. Adapt the gallery to the actual available media.

### 11.4 Image viewer

A photograph may open into a dark lightbox with clear Close, Previous, Next, and a truthful image count. Provide keyboard operation and an accessible viewing model. Keep the image fitted within the available area by default and preserve browser zoom.

The background page becomes noninteractive while a modal viewer is active. Closing restores the visitor to the same image and scroll position. No duplicate interactive image should remain above the real viewer during a shared-element animation.

### 11.5 Credits and navigation

Credit photography, renderings, architecture, and collaborators where required. Do not remove existing attribution because it makes the layout cleaner. The public site already contains collaborator credit lines, which should be included in the migration audit. [S01]

A next-project block can contain a large name, one thumbnail, and an arrow. Keep Back to Projects available as a direct link. Returning to the archive should restore its filter, presentation mode, and approximate scroll position.

## 12. Supporting page families

### Studio / About

Use the same white header, page title, rails, and two-column editorial panels. Introduce the actual practice and principal using approved text. A project image can lead the page until a genuine portrait or studio image is available.

Do not invent a staff grid, multiple offices, a founding date, or a global presence. The layout must suit a small practice without making it look unfinished. Avoid stock photographs of an unrelated architecture team.

### Services

Use one shared service-detail template: title, concise scope explanation, relevant project grid, a small process or deliverables section if accurate, and contact invitation. Keep full professional terminology readable.

Do not present architectural building design, construction, engineering, landscape architecture, and maintenance as interchangeable services. Confirm the actual scope and professional wording before publication.

### Contact

Use a simple two-column white page or homepage contact section. One side provides verified contact details and a short invitation. The other contains a form only if a real submission endpoint exists.

Suggested form fields are Name, Email, Organization as optional, Project type as optional, and Message. Use visible labels. Required status must be clear. Show inline errors without discarding entered data, and show success only after actual delivery acceptance.

No fake “message sent” state, aggressive booking pop-up, newsletter checkbox selected by default, or decorative map unrelated to a real office. If there is no backend, use honest email and telephone links instead of a nonfunctional form.

### Insights

This page family is conditional. Publish it only when there are real articles the owner intends to maintain. An empty editorial archive is not evidence of an established practice.

Use the same grid and reading typography, with actual titles, dates, and authorship. Do not generate sample articles and publish them as the principal's opinions.

### Not found and unavailable content

Use the shared header, a readable `Page not found` heading, a brief explanation, and links to Projects and Contact. Distinguish missing pages from temporarily unavailable data. Do not send visitors into an endless loader or silently redirect every broken project link to the homepage.

## 13. Component specification

### 13.1 Buttons

Use a small family of buttons rather than inventing a new style in each section.

| Variant | Use | Appearance |
|---|---|---|
| Primary dark | Contact and important white-page actions | `--pi-ink` fill, white label |
| Secondary outline | Secondary actions on white | White fill, identifiable gray edge, dark label |
| Inverse outline | Main hero action | Transparent dark-supported fill, light edge, white label |
| Text link | View all, project navigation, service links | Underline or directional arrow with clear hover/focus |
| Icon control | Play/pause, Close, optional Search | Fixed 44px minimum target, visible state |

Standard button height is 48px. Use 20 to 24px horizontal padding, 16px labels, a 12px label-to-icon gap, and 0 to 2px radius. Labels stay fixed in size and position. The arrow may move a few pixels without shifting the whole button.

Show hover, active, focus-visible, disabled when relevant, pending, success, and error states. Disabled and loading are not the same state. A pending submit action should prevent duplicate submission without freezing unrelated navigation.

### 13.2 Text links and arrows

Use a consistent arrow family. Prefer simple right arrows for internal progression, chevrons for disclosures, and an explicit external-link treatment only for real external destinations. Do not scatter diagonal arrows onto every item.

A link inside a paragraph should be identifiable without hover. Repeated `View Project` or `Learn More` labels need programmatic context identifying the specific destination. Do not create several redundant keyboard stops for one card's image, title, and arrow.

### 13.3 Icons

Use a single restrained line-icon family already available in the repository, or an appropriately licensed equivalent. A 20px visual size and around 1.5px stroke is the specified starting point. Keep stroke weight and corner treatment consistent.

The service section is typographic and does not need decorative leaf, mountain, or building icons. Use icons when they communicate an action, state, or useful category. Do not use emoji, mixed icon families, three-dimensional symbols, or a branded icon for a social account that does not exist.

### 13.4 Forms

Input height is at least 48px, with 16px text, visible labels above, and a clear border distinct from the faint decorative grid rules. Use 12 to 16px internal horizontal padding. A textarea should have enough initial room to explain a project.

Use concise helper text below the relevant field. Required markers, error text, and focus styles must not rely only on color. Validate at a sensible stage and preserve all recoverable input on failure. Avoid floating labels unless already established and tested in the repository.

### 13.5 Section heading band

A reusable band contains one heading, an optional short supporting sentence, and an optional action. Do not force all three into every instance. Use wrapping and a second row at narrow widths rather than hiding or shrinking the action.

Keep the band aligned with the panel content below. The far-right action uses the same inset as the far-right card content. The heading should not drift onto a different horizontal axis in each section.

### 13.6 Project card states

Default: solid white, clear photograph, visible name and metadata. Hover: a restrained image enlargement inside its fixed crop, a slightly stronger arrow or text emphasis, and optional faint cell tint. Focus: a high-contrast outline around the link region. Active: immediate feedback without moving the target.

The optional image enlargement is capped around `1.015`. It applies only to the image layer, not the card, title, or hit box. It is a PI-specific editorial exception to the motion guide's no-default-hover-scale baseline. Disable it in Reduced and Off modes. No card lift, tilt, shadow bloom, or pointer-follow motion.

On an image failure, retain the image region's dimensions, show a neutral nonanimated fallback, and keep the project's real name and link accessible. In the production build, prevent incomplete projects from being selected for prominent slots unless the owner has approved their fallback presentation.

### 13.7 Optional search

A search icon is allowed only with a complete search experience. Scope the initial search to actual projects, project types, and locations. Use a simple accessible search dialog or a search field on the archive. Do not turn the site into a command-palette product.

Keep results as readable project links. Show the query, clear action, result count, no-results state, and a correct dismissal path. Do not include fabricated results, unapproved drafts, or navigation links to nonexistent pages.

### 13.8 No-JavaScript behavior

Essential page content and normal links should exist without JavaScript. Desktop disclosure enhancements may fall back to a simple directly accessible navigation list or native disclosure structure. The archive should retain a usable All Projects collection, and the hero should show its poster.

No content should be permanently hidden because a reveal observer, media event, or animation import failed.

## 14. Motion handoff to MOTION.md

### 14.1 PI motion profile

Use a restrained **Editorial** profile for the homepage and a quieter browsing profile for the archive, forms, and repeated navigation. The intended impression is fluid continuity, not conspicuous animation everywhere.

The important polished moments are the shared dropdown surface, image-preview changes, subtle photographic hover, first-entry section reveals, and continuity when opening a real project. The design must not become static and unfinished, but it must also not make browsing slower in order to demonstrate an effect.

Read the owner's motion document before implementation. Its numerical tokens are original recipes, not Apple's internal constants. Use the same tokens rather than creating a second unrelated timing scale. [M01: Tokens](MOTION.md#tokens)

### 14.2 Component-to-recipe map

| PI interaction | Relevant MOTION.md recipes | Designed relationship |
|---|---|---|
| Button, link, and focus feedback | P001, P002, P003 | Fixed target, immediate local emphasis |
| Dropdown entrance | P007, P032, P091 | Surface belongs to its navigation trigger |
| Switching open navigation categories | P091 | One shared surface, coordinated new contents |
| Hover/focus image preview | P057, P091 | Same image frame, latest selected content |
| Compact menu disclosure | P009, P031 | Readable mobile modal with local disclosure |
| Hero media and poster handoff | P057, P065, P066, P085 | Persistent real media beneath stable readable content |
| First section reveal | P086 | A small content group enters once |
| Explicit anchor navigation | P093 | Direct or optional native smooth scroll to a real section |
| Archive filter | P040 | Retained project identity and stable controls |
| Grid / Index switch | P041 | Same project collection in a different presentation |
| Project-card navigation | P029, P092 | Optional shared photograph, real route change |
| Lightbox | P031, P045, P047 | Selected image remains identifiable and controllable |
| Form submission | P013 to P016 | Truthful input, pending, success, and failure states |
| Reduced motion / transparency / contrast | P109, P110, P111 | Full functionality without unnecessary motion or optical effects |
| Print and static visual tests | P120 | Complete final state, no partially hidden sections |

### 14.3 PI-specific starting settings

These values are a binding relationship and tuning starting point for this design, not measurements of the Twitter example. Map them to the owner's actual motion tokens and record changes centrally.

| Event | Starting timing | Amplitude and coordination |
|---|---|---|
| Link or button hover | `quick`, 120ms | Color, underline, or small icon emphasis |
| Dropdown open | `settle`, 240ms | Opacity and no more than 6px vertical travel from the header |
| Dropdown close | `feedback`, 180ms or faster | Clean removal, immediately noninteractive |
| Projects to Services switch | `surface`, 320ms | Surface bounds change, content crossfades, no text scaling |
| Preview image change | `feedback`, 180ms | Decoded image crossfade inside fixed bounds |
| Header material change | `feedback`, 180ms | Restrained surface change with readable foreground |
| Project image hover | `surface`, 320ms | Optional scale from 1 to at most 1.015 |
| Arrow cue | `quick`, 120ms | Up to 3px horizontal travel, stable target |
| Eligible section reveal | `spatial`, 420ms | Opacity plus at most 16px upward settlement |
| Optional hero support reveal | Up to `cinematic`, 600ms | Supporting visual only, no blocking title or CTA |
| Filter reflow | `surface`, 320ms | Animate visible retained items only where worthwhile |
| Same-image route continuity | Up to `spatial`, 420ms | Measured image geometry, no stretched copy |

Menu links do not cascade one by one. A short editorial group may use the motion guide's small bounded stagger, but never add a delay proportional to the total number of projects.

Use an arrival curve or a controlled non-bouncy spring where the existing motion system supports it. Do not mix incompatible spring parameters or introduce visible overshoot to large navigation panels.

### 14.4 Scroll experience

Keep browser scrolling native. The effect of refinement comes from clean spacing, stable media dimensions, well-timed section entrances, and responsive controls, not imposed momentum. Do not install a smooth-scroll library by default.

For a first-entry reveal, enhance only a section that is still offscreen after the page is usable. A starting trigger is when its top crosses roughly the lower 85% of the viewport. Trigger once and allow the reveal to complete independently of tiny scroll reversals. If the visitor scrolls quickly or the component gains keyboard focus, resolve it to a readable state rather than leaving it invisible.

Animate the meaningful contents, not the entire structural frame. The grid rails should remain steady while a photograph and its associated caption settle into place. Do not make borders draw themselves around every panel.

Returning from a project must not replay every section of the homepage or archive. Preserve visited/revealed state where appropriate. No scrubbed paragraph opacity, no letter-by-letter titles, and no section that remains pinned for multiple screens just to create drama. The supplied motion guide distinguishes scroll-triggered reveals from scroll-linked sequences. This design mainly uses the former. [M01: Website choreography](MOTION.md#websites)

### 14.5 Interruption and failure

A second input is accepted immediately. If a menu is opening and the user closes it, reverse from the displayed state. If they move through several preview categories, the most recent valid category wins. If a card route is requested, begin navigation without waiting for an exit flourish.

Assign each animated property one owner. For example, the image-hover layer must not also be the shared-layout transform layer. Separate those layers only where necessary, not by wrapping every label in several animation components.

Keep text at its natural size during menu resizing. Animate a surface or clipping boundary independently and crossfade new content. Avoid a scale-based illusion that makes text appear stretched in mid-transition.

A failed animation import, rejected video playback, missing image, or canceled route transition must not leave a blocker, invisible content, or duplicate controls.

### 14.6 Reduced and Off modes

Follow the motion file's effective Full / Reduced / Off policy. Honor the system preference before starting optional movement and respond when that preference changes during the session. The web media feature exposes the user's reduced-motion preference, but the application still has to stop its own discretionary loops. [S08]

In Reduced mode, remove travel, image zoom, animated layout, and automatic background playback. Use direct updates or a short permitted opacity change. In Off mode, use direct states. Preserve the selected filter, keyboard focus, content hierarchy, and useful poster image.

Do not merely make every animation very fast. Do not continue rendering an invisible video or animated background. Reduced motion and reduced transparency are separate concerns.

### 14.7 Explicitly excluded effects

No custom cursor, pointer-follow lighting, magnetic buttons, card tilt, page-wide parallax, full-screen animated blur, rotating logos, marquee text, automatic counters, confetti, bouncing navigation, or mandatory route curtain. No added particles or topographic animation behind the hero video. The actual video is already the hero's continuous moving element.

## 15. Responsive behavior and device coverage

### Desktop

At 1440px and 1536px widths, the main visual target is the supplied references with slightly more real-world breathing room and readable text. Keep the three-column archive and full navigation. At 1920px and wider, center the capped frame while the video fills the screen.

Do not make the site look like a narrow phone interface floating in a wide desktop. Conversely, do not stretch project names, paragraphs, or navigation across the entire ultrawide display.

### Tablet and compact desktop

Use the compact header before links collide. The Menu control exposes the real navigation, not an incomplete substitute. The project grid becomes two columns. Narrative sections stack below 1024px. Keep image proportions and text sizes deliberate.

A tablet can have touch and a pointer. Hover previews must be an enhancement, not the only way to discover or follow links. Switching input methods must not close content unexpectedly or permanently leave hover styles active.

### Mobile

The header contains the wordmark and a plainly labeled Menu control. The hero uses the same original video or its matching poster with a crop chosen for a vertical viewport. Do not zoom into an irrelevant patch of lawn merely to fill the height. Where the crop cannot show the work clearly, choose a better still from the same clip for the mobile fallback.

Use one project column. Keep service names complete. Move secondary content below headings rather than shrinking it. On the contact section, prioritize the heading, short explanation, and action before optional photography.

Maintain at least 16px form text and the specified button targets. Make media and menu controls reachable without precise tapping. Account for safe areas and browser interface changes. Avoid making an absolutely positioned hero caption collide with the CTA at short heights.

### Reflow and zoom

Test a 320 CSS-pixel-wide effective layout, including an enlarged desktop page. Ordinary text and navigation should reflow without two-dimensional page scrolling. The accessibility reflow requirement has exceptions for inherently two-dimensional content, but that is not a reason to let a normal portfolio page overflow. [S09]

Test 200% text enlargement, 400% browser zoom, long project names, long email addresses, and service headings with several lines. Do not repair overflow with `overflow-x: hidden` on the whole site. Find and fix the responsible component.

## 16. Photography, video, and other assets

### Selection priorities

Use real, owner-approved completed-project photography first. Make the landscape intervention visible: planting, circulation, edges, seating, shared space, materials, and the relationship to buildings. A facade-only image may be legitimate, but it should not dominate a landscape portfolio when stronger documentation exists.

Use renderings when the project is not built or when they explain a design clearly. Label them accurately. Preserve required collaborator credits. Do not use the generated concept photographs as evidence of completed work.

Keep natural color and exposure. Avoid applying one dramatic warm filter to every project to match the concepts. Consistency comes from editing and cropping, not altering the truth of the work.

### Asset roles

| Role | Starting ratio or behavior | Crop policy |
|---|---|---|
| Homepage / archive cover | 3:2 | Owner-selected focal point |
| Dropdown project preview | 5:4 | Same project, separate deliberate crop |
| Services preview | Approximately 4:3 | Representative and correctly attributed |
| Hero video | Cover within hero | Per-breakpoint focal point, no stretching |
| Featured project | Flexible landscape frame, approximately 16:9 to 2.2:1 | Preserve the designed space |
| Detail photography | Native ratio or approved editorial pairing | No automatic strip crop |
| Plans and diagrams | Contain | Show complete relevant drawing |
| Mobile fallback poster | Frame from the actual clip | Explicit crop check |

Store the source image, an archive cover crop or focal point, alt text, media type, credit, rights/approval status, and project association. Do not infer a project association from a filename alone when the archive is ambiguous.

Prepare responsive image variants and reserve dimensions before loading. Menu previews should not download enormous originals. Below-the-fold galleries should not compete with the hero poster and initial content for network resources.

### Alt text and captions

Use concise descriptions of what a meaningful image shows. Avoid unverified claims about the project's performance or authorship. Do not repeat a long project title and category word-for-word in every image's alt text.

If an image is purely redundant inside a well-labeled project link, an empty alt may be appropriate to avoid repeated announcements. Detailed gallery images usually need distinct useful descriptions. A drawing caption should explain its type and context rather than merely say `image`.

### Source-video preservation

Keep an untouched master of the existing clip. Produce web-optimized variants from it rather than repeatedly recompressing a downloaded preview. Confirm the clip's duration, resolution, ownership, permitted use, and best poster frame in the repository audit. The current specification does not claim those properties have been inspected.

Do not put the full source video in this design reference package or use an external social video player as the background. Production delivery should follow the site's actual hosting setup.

## 17. Content model and migration rules

### 17.1 One source of truth

Use one project inventory for the homepage cards, dropdowns, archive, search, related projects, and detail pages. Separate content from component markup. A corrected title or location must not require editing six hard-coded arrays.

A practical content model is illustrated below. Adapt it to the existing CMS rather than migrating solely to match these names. The code is a schema example, not a verified database.

```ts
type ApprovalState = "draft" | "owner-approved"
type MediaKind = "photograph" | "rendering" | "drawing" | "video"

type ProjectMedia = {
  id: string
  src: string
  kind: MediaKind
  alt: string
  width: number
  height: number
  credit?: string
  focalPoint?: { x: number, y: number }
  approval: ApprovalState
}

type Project = {
  id: string
  title: string
  canonicalPath: string
  legacyPaths: string[]
  primaryCategoryId: string
  secondaryTagIds: string[]
  location?: { city: string, region?: string, country?: string }
  status?: "concept" | "in-progress" | "completed"
  year?: { value: number, meaning: "design" | "completion" | "publication" }
  client?: string
  piScope: string[]
  summary: string
  description?: string
  coverMediaId: string
  gallery: ProjectMedia[]
  collaborators?: { name: string, role: string }[]
  approval: ApprovalState
  selectedForHome: boolean
  selectedForMenu: boolean
  featuredRank?: number
  sortOrder: number
}
```

Validate the cover reference, canonical path uniqueness, category existence, image dimensions, approval state, and route resolution. The example's focal-point values are normalized from 0 to 1. They are not screen coordinates.

### 17.2 Publication gates

A project can be designed in a local preview while its content is still a draft. It must not become public merely because the layout looks complete. Keep local placeholders clearly identified as drafts, exclude them from the production archive and search, and compute counts from approved records.

Do not use `TBD` or obviously fabricated statistics on the public site. Omit an optional unknown field. A missing essential field should block that project's publication and appear in an internal report.

Real names appearing in the current PI navigation, including Redstone, Skyview, Evanston, D'Arcy, Seton Crossing, and Summit 77 Apartments, are candidate records for migration. Their presence does not independently verify every description, category, image pairing, or completion status. [S01]

### 17.3 Link audit

The owner's discussion identified a project link that led to the wrong commission. Explicitly test every card against its destination, especially similarly named apartment and rowhome projects.

Audit title, URL, cover image, gallery, category, location, description, credits, and selected-project order together. Do not assume that a 200 response proves the link points to the correct project.

Preserve existing inbound URLs when possible. Where a route changes, create a deliberate redirect and test it. Never send all retired project URLs to one unrelated detail page.

### 17.4 Business claims and scope

Keep a short approval record for founding date, years of experience, team size, professional descriptions, client identities, awards, metrics, service offerings, geographic coverage, testimonials, and contact details.

The layout must not imply PI designed the buildings when its role was the landscape. A photograph that includes a building does not establish authorship of that building. Likewise, work done within a broader practice must carry the appropriate role and credit rather than being presented as an unqualified PI commission.

Do not silently rewrite the owner's terminology to match a generic design agency. Request a content decision where the correct professional category is uncertain.

## 18. Accessibility requirements

Target WCAG 2.2 AA for the implemented site and apply the stronger motion alternatives specified by the owner's motion file. The following checks are design requirements, not a claim that the current concept or starter code is already compliant.

**Text contrast:** normal text needs at least 4.5:1 contrast and qualifying large text at least 3:1. Test actual rendered foreground/background combinations, including hover and video states. The gray body color is not permission to use low-opacity text over arbitrary imagery. [S04]

**Control contrast:** essential visual boundaries and state indicators need appropriate non-text contrast, commonly 3:1 against adjacent colors under the applicable criterion. Decorative rails do not need to be made dark merely to resemble form controls. Keep focus and selection visibly distinct. [S05]

**Targets:** this design uses at least 44 by 44 CSS pixels for compact standalone controls. That is the project's comfort target, not a claim that WCAG 2.2 AA universally requires 44px. Its minimum-target criterion uses 24px with defined conditions and exceptions. [S10]

**Navigation:** use a navigation landmark, meaningful links, disclosure buttons, correct expanded state, and immediate visible focus. Desktop dropdowns are nonmodal. Mobile navigation and image viewers, when modal, require contained focus, background interaction control, a close path, and appropriate focus restoration. [S02] [S11]

**Reading structure:** use one page-level heading and a logical hierarchy. Do not choose an `h4` solely because it looks smaller. Label form fields, controls, and repeated links meaningfully. Keep decorative arrows and rules out of the accessibility tree where appropriate.

**Motion and video:** provide the specified Reduced and Off presentations and a real playback control. Do not leave a hidden moving layer running or make content disappear when motion is disabled. [M01: Accessibility](MOTION.md#accessibility)

**Reflow:** test narrow effective widths and enlarged text. Do not clip a service title or force a project index into a wide desktop table on mobile. [S09]

**Forced colors and print:** retain understandable borders, current state, and link labels without dependence on image backgrounds or shadows. Print should show complete project text and relevant still images, with videos represented by a useful still. Resolve reveal states before static capture.

## 19. Performance and implementation boundaries

The website should feel smooth because it remains responsive while displaying real media, not because a powerful development machine hides expensive effects.

### Asset and runtime policy

Use a high-quality compressed hero poster as the immediate visual. Load the optimized video without delaying text or navigation. Prepare appropriately sized card images rather than sending a full-resolution original to every menu preview.

Keep blur limited to the header and active dropdown. Do not blur every card, animate large shadows, promote the entire archive into permanent compositing layers, or add a background canvas. The supplied motion guide prioritizes useful content and constrained resource use over decorative complexity. [M01: Performance](MOTION.md#performance)

Use one motion engine where complex coordination is justified, and CSS for simple local states when that fits the existing stack. Do not add GSAP, Motion, a smooth-scroll library, and a custom animation loop to solve the same navigation problem. If the repository already has a supported motion system, use it.

The particular framework, rendering mode, CMS, and package versions remain unverified until the repository is inspected. No statement in this file assumes a required React, Next.js, Squarespace, or static-site rewrite.

### Measurement targets

Use the published Core Web Vitals good thresholds as performance targets: LCP at or below 2.5 seconds, INP at or below 200ms, and CLS at or below 0.1 at the 75th percentile, assessed separately for relevant desktop and mobile traffic. These are targets, not results achieved by this document. A laboratory page-load score alone does not establish field INP. [S12]

Additionally test menu interaction while the video is playing, initial image decoding, repeated dropdown switching, mobile menu scrolling, filter changes, and returning to the archive. Look for visible hitches and layout jumps rather than relying on an average frame rate.

Prefer reducing blur complexity and optional image motion before reducing the responsiveness of navigation. Do not sacrifice text quality or show visibly degraded project imagery simply to achieve an arbitrary score without reviewing the tradeoff.

### Behavior independent of animation

Project links, form delivery, browser history, filters, and playback state must not depend on an animation's completion callback. An animation failure is a presentation problem, not permission to lose an action.

Feature-detect optional browser transition capabilities. If a shared-image route effect cannot run, navigate directly. Do not use a forced full-page fade as a universal fallback.

## 20. Implementation sequence and acceptance gates

### 20.1 Repository audit before changes

Read existing agent instructions, inspect the actual framework and component system, locate the hero clip and poster, identify the rendered font, inspect content storage, and list the current project routes. Record what is missing. Do not use the design exercise as an excuse to rebuild unrelated functionality.

Create a reference map linking the sections in this file to the supplied images. Confirm which assets are approved production assets and which are design references only.

### 20.2 Build the representative slice

Build the header in light and dark states, the Projects dropdown, the Services preview variant, the hero with its real poster/video behavior, one complete project card, and the first white section. Match R01 and R02 before extending to every page.

Then build the rest of the homepage, the archive in both views, and one project detail page. Use those components for the remaining projects. Finish supporting pages only when their content and route decisions are ready.

Add motion to the approved components using Section 14 and `MOTION.md`. Then test the intermediate states, not merely the final screenshots.

### 20.3 Required reusable components

The following names are conceptual and may be adapted to repository conventions:

```text
SiteHeader
DesktopNavigation
NavigationSurface
ProjectsMenu
ServicesMenu
MobileNavigation
PageFrame
SectionBand
HeroVideo
MediaPlaybackControl
ProjectCard
ProjectGrid
ProjectFilters
ProjectIndex
ServicePanel
EditorialSplit
FeaturedProject
ApproachStep
ContactInvitation
ContactForm
ProjectGallery
ImageViewer
SiteFooter
```

Do not build a single page-sized component with repeated inline styles and duplicated content arrays. Centralize tokens and share the project record model.

### 20.4 Visual acceptance checklist

- [ ] R01's hero composition is preserved with the actual existing video or its matching fallback.
- [ ] The desktop header is full width, not a floating pill from an earlier alternative.
- [ ] The same wordmark appears across dark and light states.
- [ ] Body text, header content, project cells, and footer follow one consistent frame.
- [ ] Shared border seams remain one pixel, without double-thickness intersections.
- [ ] The white sections have real breathing room, not tiny text compressed into a concept sheet.
- [ ] The archive images use consistent proportions in every row.
- [ ] There are no decorative gradients, card shadows, or unsolicited color accents.
- [ ] Full service names remain readable and complete.
- [ ] Images, captions, and project routes match the same commission.
- [ ] The site still looks deliberate with an incomplete final archive row.
- [ ] No sample facts or generated portfolio images have reached production content.

### 20.5 Interaction acceptance checklist

- [ ] Hover, click, keyboard, and touch can reach all primary destinations.
- [ ] A pointer can move diagonally from a trigger into the menu without accidental closure.
- [ ] Escape, outside click, and focus leaving the desktop navigation behave correctly.
- [ ] Switching menus preserves a coherent shared surface without stretching text.
- [ ] Rapid open-close-open input does not queue stale animation.
- [ ] Preview images do not flash blank or show an obsolete selected category.
- [ ] Hero playback control reflects actual state and survives autoplay rejection.
- [ ] Pausing the video is respected after scrolling away and returning.
- [ ] Offscreen reveals do not hide focused content or replay unnecessarily on Back.
- [ ] The archive restores filters, view mode, and position after a project visit.
- [ ] A failed image or optional animation dependency leaves useful content.
- [ ] Contact success is shown only after a real successful request.

### 20.6 Test matrix

Use at least representative widths of 320, 390, 768, 1024, 1440, and 1920 CSS pixels. Check desktop Chrome, Safari, and Firefox where available, plus actual iOS Safari and Android Chrome where the team can test. Report untested environments honestly.

Test keyboard-only navigation, screen-reader behavior for menus and forms, enlarged text, Reduced motion, Off mode when provided, reduced-transparency fallback, slow or blocked video, failed images, long titles, empty categories, and resizing while a dropdown or viewer is open.

Capture at least these static states: hero with menu closed, Projects menu open, Services menu with a different preview selected, white header after the hero, homepage body, archive grid, archive index, one project detail, and mobile navigation. Use motion-disabled captures for layout comparison and separate live recordings for animation review.

A mockup or passing screenshot test is not a claim of production readiness. Record what was actually executed, what failed, and what remains unverified.

## 21. Starter tokens and implementation files

The companion file `design/pi-design.tokens.css` translates the specified visual tokens into a small, framework-neutral starter. It includes colors, font scale, spacing, page frame, border ownership examples, header materials, and basic static component states.

It is not a finished theme or a complete navigation implementation. In particular, it does not implement dropdown focus management, routing, real video state, form delivery, or motion. Those belong in the site's actual components and the separate motion layer.

Use its values in the existing token system rather than loading a second competing design system. Preserve relative text sizing and review the chosen font in the real browser. The CSS is illustrative until it has been integrated and visually tested against the reference images.

Expected handoff structure:

```text
DESIGN.md
MOTION.md                         # supplied separately by the owner
CODEX_START.md
README.md
design/
  pi-design.tokens.css
  references/
    R01-hero-and-projects-menu.png
    R02-homepage-white-sections.png
    R03-homepage-lower-sections.png
    R04-all-projects-grid.png
    R05-dropdown-category-preview.png
    R06-dropdown-photo-panels.png
    R07-existing-video-frame.png
    R08-hairline-structure-reference.png
    manifest.json
```

The complete package does not include font binaries, a production hero video, a verified project database, or a copy of the owner's motion guide. Supply those through the actual project workflow as appropriate.

## 22. Decisions still requiring owner approval

The visual direction is ready to implement. The following content decisions remain separate from design approval:

| Decision | Safe interim treatment |
|---|---|
| Exact existing font and approved webfont delivery | Use the declared fallback stack in preview and record the actual rendered face |
| Final vector wordmark versus specified full-name text treatment | Use one consistent full-name text treatment, no alternate monogram |
| Final hero headline and supporting sentence | Keep clearly marked draft copy in preview |
| Exact service categories, including separate residential building design | Preserve full labels and withhold unsupported scope claims |
| Selected and featured projects | Choose only from approved records |
| Project names, locations, completion status, and credits | Audit current site and owner assets together |
| Actual hero clip, crop, poster, and project caption | Preserve the existing source and omit unverified captions |
| About, Insights, Search, and contact destination availability | Omit unavailable controls or use real homepage anchors |
| Contact details, social accounts, and legal pages | Publish only confirmed destinations |

Do not hold up the reusable layout work while waiting for these facts. Build a private preview with clear draft states, then replace or approve the content before launch. Do not mistake the absence of a final fact for permission to invent one.

## 23. Source and provenance ledger

The supplied concepts and owner discussion are the primary design basis. External documentation below supports narrow implementation and accessibility statements. It does not replace the approved visual direction. Public pages were consulted on 13 September 2026. Exact rendering, motion timing, font files, project ownership, and current code behavior have not been independently measured.

### Supplied materials

**R01 to R08:** The image files mapped in Section 1. Their filenames and SHA-256 hashes are recorded in the reference manifest. R01 to R04 are concept renderings, not project photography or a production site audit. R05 and R06 are screenshots of an external navigation example. Their source author and continuous playback behavior were not established, so this specification does not claim to reproduce a measured original animation.

**M01:** Owner-supplied `APPLE_MOTION_MASTER (2) - Copy.md`, titled *Apple-Inspired Motion Master*, version 1.0, dated 12 September 2026. Use as the separate `MOTION.md`. Relevant sections are the operating contract, profiles, original tokens, P007, P029, P040, P041, P057, P065, P066, P085, P086, P091, P092, P109 to P111, website choreography, accessibility, performance, and test requirements. This design specification borrows the file's recipes and constraints. It does not independently validate every external claim in that motion document.

### Public implementation references

[S01]: https://www.pidesigngroup.ca/
[S02]: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
[S03]: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
[S04]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
[S05]: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
[S06]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
[S07]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
[S08]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
[S09]: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
[S10]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
[S11]: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
[S12]: https://web.dev/articles/vitals

| Source | Supports | Does not establish |
|---|---|---|
| [S01] PI Design Group public homepage | Candidate project names, current service inventory, migration leads, contact audit, D'Arcy location lead | Exact font, verified project scope, ownership of every image, correctness of every existing link |
| [S02] W3C disclosure navigation example | Disclosure-based website navigation, expanded state, keyboard and dismissal model | A production-ready component or the Twitter example's timing |
| [S03] W3C Pause, Stop, Hide | User control for applicable automatically moving content | That a decorative play icon alone satisfies the requirement |
| [S04] W3C Contrast Minimum | Text contrast thresholds and relevant distinctions | Contrast compliance of the actual video frames |
| [S05] W3C Non-text Contrast | Contrast of necessary control and state visuals | A requirement to darken every decorative hairline |
| [S06] MDN backdrop-filter | Backdrop treatment and CSS behavior | Exact Apple optical rendering or a performance guarantee |
| [S07] MDN video element | Playback attributes, poster, and media behavior | Guaranteed autoplay on every device |
| [S08] MDN reduced-motion media feature | Detecting user preference | Automatic shutdown of every custom effect |
| [S09] W3C Reflow | Effective narrow-width layout and exceptions | That a screenshot proves reflow compliance |
| [S10] W3C Target Size Minimum | AA minimum-target framework and exceptions | A universal 44px AA rule |
| [S11] W3C modal dialog pattern | Modal focus, dismissal, and interaction responsibilities | That a visual backdrop makes a dialog accessible |
| [S12] web.dev Web Vitals | Loading, interaction, and stability targets and field measurement distinction | Achieved scores or performance of this unbuilt design |

## 24. Codex implementation contract

Read `DESIGN.md`, the supplied `MOTION.md`, and the repository's existing agent instructions before changing the interface. Inspect R01, R02, R03, and R04 before proposing any layout changes. Use R05 and R06 for the dropdown state relationships, not for their travel imagery or branding.

Preserve the approved identity and video hero. Use the shared frame, Helvetica-family treatment, white sections, and hairline rules. Implement the specified navigation, menu variants, homepage sections, project archive, and a reusable project detail template without introducing a different visual language.

Keep draft content separate from publication. Do not copy the generated concepts' unverified locations, project list, experience claim, or contact information. Preserve current routes and audit each real project-to-link mapping.

Build and review one representative slice before propagating the system. Add the relevant motion recipes without hiding initial content, delaying actions, or replacing normal browser scrolling. Test the actual interactions and their failure paths. Report changed files, tested states, visual mismatches, and remaining content decisions.

Do not finish by saying the design “should” look like the references. Compare the rendered result with them and correct visible differences in frame alignment, typography, image ratios, menu geometry, material opacity, and spacing.
