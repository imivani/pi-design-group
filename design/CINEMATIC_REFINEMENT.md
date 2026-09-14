# Cinematic refinement — September 14, 2026

This pass implements the owner's latest dark Featured Project reference and specific requests for smoother navigation, project arrivals, archive changes and contact photography. It supersedes the split featured composition in CALM_REFINEMENT.md. The video hero, Calgary introduction, three expanding expertise photographs and neutral drawing explorer retain the previously accepted direction.

## References and decisions

- **Owner's reference:** `references/R20-dark-featured-reference.png`, copied from “ChatGPT Image Sep 14, 2026, 01_36_01 AM.png.” Observed composition: charcoal background, large project name on the left, large photograph on the right, overlapping secondary photograph and a simple three-choice view selector. Implemented with real Crestmont West images. Uppercase labels, corner slogans and decorative footer text were explicitly excluded by the owner's written request.
- **Mobbin search research:** directly inspected the [Telescope search screen](https://mobbin.com/screens/025d8501-79f4-46a9-b5a1-c5ac4316182e). Observed a centered light dialog, prominent search field, photographic result rows, clear title and close control. These informed the search composition, adapted to the site's restrained typography and project catalogue.
- **Keyboard treatment:** directly inspected the [Whop search screen](https://mobbin.com/screens/8ffa040d-6149-41b5-97fc-d6fbf668bfee). Observed an active result row and compact arrow/Enter/Escape guidance; adapted to ordinary links with keyboard focus. No reference branding or imagery was copied into the website.
- **Skill and motion:** used the requested design-taste-frontend skill and existing MOTION.md. The user's explicit dark composition and overlapping photograph take priority over generic layout defaults. Existing native browser motion remains the implementation approach.

## What changed

**Featured Project.** A full dark section follows the existing page frame. The desktop project title is 72px, with a 24px section label, 560px main photograph and a smaller overlapping real photograph. Three views—Shared Courtyard, Places to Play, Planted Frontage—change both photographs and concise descriptive copy. Previous/next controls cycle those same views. Both images decode before a 620ms crossfade; copy fades over 520ms. A failed image preserves the previous complete view. Mobile stacks the text and photograph, keeps the inset detail, and gives the controls their own row.

**Navigation.** The header has a slightly stronger shadow. Projects and Services share a stable 1024px outer frame; natural panel sizing replaces observer-driven width/height updates. Preview captions reserve enough space for two lines. This removes the visible resizing feedback during hover handoffs and changing project names.

**Search.** The search icon opens a photographic dialog over the current page. It searches all 27 project names, types and known locations, tolerates apostrophe variants and accents, offers three starting suggestions, and can browse the entire catalogue. Results update immediately with a 200ms opacity fade; rapid typing replaces stale motion. Empty results have a useful recovery button. Arrow keys, Enter, Escape and a contained Tab sequence work. Escape closes on the first press even with text in the field. Mobile search replaces the open navigation; closing returns focus to a visible control. The scrollbar track remains reserved so opening the dialog does not shift the page. Search retains an ordinary archive link without JavaScript.

**Project openings.** Archive, header and search links can share a matching photograph with the destination in supporting browsers. The project identity, actual source image and opening scene are validated first. The photo moves for 620ms and the title enters for 560ms. Direct visits or unsupported/skipped transitions receive one equivalent fade/lift entrance. Back navigation and Reduced/Off settings show the content immediately. An enhancement failure cannot leave the title or photograph hidden.

**All Projects.** After a 140ms hover intent, the photograph expands over 860ms to fill the entire rounded card, including the information area. A 680ms local shade transition maintains readable white text; the card and its neighbouring rows do not move. Project-specific descriptions remain readable at rest, and extra gallery information appears on hover/focus. Touch opens the project on the first tap. Filters, text search/reset and Grid/Index changes receive a 560ms fade/lift; new input cancels stale animation and preserves the latest result set.

**Contact.** The same real photograph receives a slow alternating 16-second pan/zoom. Only the photograph moves; copy and contact links stay steady. Motion pauses offscreen and in a hidden tab, and stops with Reduced or Off. The existing rounded panel and working email/phone links remain.

## Verification

The review covers desktop and phone layouts, all project destinations, search/keyboard controls, menu geometry, paired-image failures, rapid filters, project arrival, gallery controls, motion preferences and ordinary content without JavaScript.

- Code check: 52 files, zero errors, warnings or hints.
- Browser suite: all 93 tests passed on the final source. The existing carousel-position assertion now waits for the newly requested project entrance to finish before measuring the resting frame.
- Production output: 28 pages; all 27 destinations, paired featured images, drawing viewer, complete navigation catalogue and project-page search pass at both `/` and `/pi-preview/`. No browser or asset-response errors. The build was restored to the normal root path afterward.
- Independent archive/contact review at 1440, 390 and 320px: no horizontal overflow, failed loaded images or page errors. All tested filters/search/view changes ended on the latest choice. The photograph expanded inside the unchanged desktop card; contact text stayed still during the 16-second camera move.
- Actual header-to-D’Arcy recording: one native 620ms photograph transition and a 560ms title entrance, with temporary image identities removed afterward. Direct-entry, Back, motion settings and narrow project layouts were checked separately.
- Automated accessibility checks of Featured Project and contact at 1440/390/320px found zero violations; search, homepage, project and viewer checks are also included in the browser suite.

Review captures in `design/review/`:

- `cinematic-featured-{1440,390,320}.png` and `cinematic-featured-motion.webm`.
- `search-desktop-initial.png`, `search-desktop-results.png`, `search-mobile-initial.png`, `search-mobile-results.png`, `header-steady-services.png`.
- `project-arrival-motion.webm`, `project-arrival-review.md` and `project-arrival-report.json`.
- `cinematic-homepage-walkthrough.webm`, `cinematic-review-report.json`, and `cinematic-archive-card-*` / `cinematic-contact-*` screenshots.

The homepage review can be recreated with `node scripts/record-cinematic-review.mjs`. Temporary screenshots, recordings and generated builds remain outside Git.

Draft pages remain local-review pages with `noindex`. This refinement does not deploy the public website. Actual Safari/iPhone hardware has not been tested; phone checks use the installed Chrome browser at narrow widths and with touch input.
