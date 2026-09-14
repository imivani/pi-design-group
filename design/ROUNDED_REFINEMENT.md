# Rounded photographic refinement

The September 14 request evolves the homepage using the owner's Mintlify panel screenshots and the supplied landscape references. It preserves the video hero, expanding services, existing navigation, genuine work and all project routes.

## Design read and audit

A landscape architecture portfolio for prospective clients, with photographic depth, rounded panels between continuous structural lines and direct image interactions. This is a targeted visual overhaul of Featured Project, Design in the Details and the closing contact area. Existing variance/motion/density: 8/6/4. Revised: 8/7/4, with the additional motion confined to visitor interactions.

| Current issue | Concrete change |
| --- | --- |
| Featured Project is a small label above a much larger project name; imagery is split into separate rectangular blocks. | One large, rounded photographic story. Featured Project becomes the main heading; Crestmont West is secondary. Integrated image choices change the photograph and relevant copy. |
| The drawing desk and two photographs read as separate simple blocks. | A unified drawing explorer and three photographic detail choices with useful selection/expansion, a complete plan and a zoomable drawing viewer. |
| Archive hover feedback is only a slight image tint and underline. | The photograph extends behind the project information within the fixed card footprint. The name and destination remain available at rest, on touch and by keyboard. |
| The contact strip and narrow footer lack a distinct closing composition. | A rounded landscape photograph with a clear invitation and real contact details, followed by a more generous structured footer. |
| Section headings use several unrelated sizes. | One shared heading scale for What We Do, Featured Project, Design in the Details, All Projects and the closing invitation. |

## Retained system and explicit overrides

- Native Astro/CSS/TypeScript, Helvetica-family typography, Lucide icons, white/pale neutral surfaces and charcoal photograph overlays remain.
- Outer photographic panels use 24px corners (18px on phones), project photographs 14px and small controls 6px. Structural border lines stay square. The user explicitly requested rounded panels and more expressive hover movement; those requests override generic skill defaults against rounded cards and image scaling.
- The original hero stays at the top. The new Crestmont panel remains the Featured Project section after What We Do.
- Image expansion reveals or emphasizes the actual project being selected. No pointer chasing, ornamental loops, new fake metrics or invented project facts.
- Preserve native scrolling, complete Reduced/Off behavior, reversal during repeated input, working keyboard focus and all existing failure recovery.
- Supplied Mintlify screenshots guide shape and panel composition. The current official homepage was also consulted at https://www.mintlify.com/. Its product claims, illustrations and branding are not reused.
- The five supplied images are retained as R14–R18 in `design/references/`. Mobbin also supplied a Lightship contact example with rounded real photography and a clear contact area. Its form-based composition was not adopted because Pi uses direct email and telephone contact.
- The new contact photograph is the genuine D’Arcy pedestrian frontage (`public/media/gallery/darcy/5.webp`), replacing the previous evening play-space image. Source galleries and attribution remain intact.
- The main heading scale is shared: 64px maximum, 40px on phones, 36px below 360px. Project names and detail-row names sit below that level. Small caption counters remain available to assistive technology; decorative numbered photograph badges are omitted.

## Verification

- `npm run check`: 40 files, zero errors, warnings or hints.
- Complete browser suite: 69 checks passed. Three focused archive/contact checks passed again after the final mobile heading adjustment. Existing navigation, all project destinations, gallery failure recovery, keyboard access, Reduced/Off settings and no-JavaScript fallbacks remain covered.
- Production output: 28 pages and all 27 project links verified at `/` and `/pi-preview/`. Featured selections, drawing zoom, complete navigation catalogue and cross-page service links passed with no browser or asset-response errors. The final `dist` is the root build.
- Independent live review: desktop 1440px plus 390px and 320px touch layouts, with an 18-second full-motion recording and 32 screenshots in `design/review/`. The supplied references were compared with the actual page, not source code alone.
- Corrected three mobile findings: stronger photo shading behind featured text; filters wrap inside the frame; result counts no longer change heading height. The final mobile featured narrative measures at least 5.64:1 contrast across all three views.
- Fixed an intermittent desktop-to-mobile navigation focus race, verified with 25 repeated resize checks. Fixed the native project transition starting before its image element existed, verified with 20 repeated checks and a delayed-parsing regression.
- Hovered archive photographs grow inside unchanged card bounds. Touch keeps a visible action; keyboard focus receives the same visual feedback. The drawing choices, featured controls and contact links remain directly usable without animation.
- The latest preview was refreshed in the in-app browser. This refinement is local; the previously created GitHub repository and public website were not updated by this implementation task. Actual Safari/iPhone hardware remains untested.

Review evidence: `design/review/rounded-review-notes.md`, `rounded-review-report.json`, `rounded-review-mobile-resolution.json` and `rounded-motion.webm`. Recreate the main capture with `node scripts/record-rounded-review.mjs` while the local preview is running.
