# Project and navigation refinement — September 14, 2026

This pass follows the owner's requests after the cinematic refinement: make logo returns smooth, bring project facts near the opening photograph, distinguish Next Project with gray, give the light header more material depth, and make project-search fades clearly visible. It preserves the existing homepage video and project hero composition.

## Presentation

- Project information now sits immediately below the opening photograph, before the introduction and gallery. The compact fact band has only verified information; its column count adapts to available facts. Phones use two columns. The duplicate lower table is removed.
- Next Project has a full-width neutral gray background (`#e9e9e9`), fine borders, and the existing shared content frame. Dark text and large photography separate it from the white project narrative and contact/footer sections.
- The header's light state uses a frosted, neutral layer, a fine bright edge and a soft shadow. Its blur is 24px with mild saturation. This is a CSS approximation of glass, not an official Apple component. The hero's existing dark treatment remains. Reduced transparency receives a solid background; navigation geometry and text contrast stay stable.

## Motion inventory

| Interaction | Owner and behaviour | Interruption and alternatives |
|---|---|---|
| Project logo to homepage | MotionSetup and home-return script/style; a 480ms page dissolve with a gentle hero-title entrance. Pointer or keyboard follows the ordinary logo destination without an artificial navigation delay. | Native transition when available, one local entrance when unavailable. Back/reload and unrelated visits do not replay it. Reduced/Off show content directly. Missing enhancement code cannot leave the page hidden. Same-page logo navigation retains the existing smooth scroll. |
| Search query update | Search owns an opacity-only 460ms fade with an even easing curve, from 8% to full opacity when starting at rest. Matching results and their links update immediately. Refining a query also animates when the result set stays the same. | Further typing retargets the current opacity. Result focus or pointer interaction settles the fade so the destination stays legible. Reduced uses 100ms; Off updates directly. Empty results, closing, Escape and reopening settle cleanly. |
| Header material | Header CSS changes only the light-page material. Border highlights and a soft tinted shadow give the white-page header separation. | No resizing or pointer-following effect. Reduced transparency uses solid white; forced colors use system colors. |

These are project-specific recipes informed by MOTION.md, not measurements or claims about Apple's private animation constants. The design-taste-frontend skill informed the narrow editorial refinement; the owner's request for glass takes priority over generic anti-glass defaults.

## Verification

- The complete browser suite passed 108 checks after the layout, glass, search and logo-return changes. Final code checking passed with zero errors, warnings or hints.
- Verified the information band on all 27 project routes. At 1440, 390 and 320px, the facts and gray next-project section fit their shared frame without horizontal overflow; scoped accessibility checks found no violations. The desktop facts band is 162px high; narrow layouts are approximately 209px.
- Recorded the actual D’Arcy → logo → homepage return. It played one native 480ms dissolve, returned to the top, kept the video playing and removed temporary transition names.
- Independently reviewed the header on white home sections, project pages and hero footage at 1440/390/320px. Menus kept identical bounds across switches. The light header's frosted material remains readable over both white space and passing photography.
- Measured the D’Arc → D’Arcy fade: opacity .08 at its start, .527 midway and 1 when settled. Continued typing advanced from .291 to .352 without flashing back. Enter still opened the correct project during the fade. Reduced and Off worked as intended.
- The production check additionally exercises an immediate project-to-logo return in full motion, at the normal root and `/pi-preview/` hosting paths. A cold stylesheet load exposed a browser-transition race: the navigation opt-in arrived too late. The shared page head now declares that opt-in immediately and handles expected native-readiness cancellation. The destination retains its visible fallback. The exact subfolder reproduction then passed without browser errors.
- After that fix, three targeted early-click/normal-return/cancellation checks passed with zero browser errors. Both production hosting paths passed the full verification script, including animated logo return, and the final build was restored to the normal root path.

Evidence under `design/review/`: `project-information-{1440,390,320}.png`, `project-next-gray-{1440,390,320}.png`, `home-return-motion.webm`, `home-return-review.md`, `navigation-refinement-motion.webm`, `navigation-refinement-report.json` and the corresponding header/search screenshots. The navigation recording can be recreated with `scripts/record-navigation-refinement.mjs`.

Browser reviews use installed Chrome, including narrow touch layouts; actual Safari/iPhone hardware remains untested. This is a local draft, and no public deployment is part of this pass.
