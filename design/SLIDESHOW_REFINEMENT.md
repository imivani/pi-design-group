# Featured slideshow and darker project sections

September 14, 2026. This refinement preserves the accepted homepage and project-page compositions.

## Visual changes

- The video hero's vertical frame rules now use 25% opacity, half their previous 50%. The structural white header borders use 10% rather than 20%. The remaining page rules retain their established weight and line up exactly with the hero.
- Featured Project and the project page's Continue Exploring section both use neutral charcoal `#1b1c1d`, with light text. The white contact/footer area remains visually distinct. Print uses dark text on white.
- The original hero footage, title, project photographs, information placement and navigation treatments are retained.

## Featured photography

The three existing Crestmont West views now advance automatically in full motion mode. Each completed view remains still for seven seconds. The outgoing main and detail photographs dissolve over 620ms while the incoming photographs settle over 650ms with 6px of travel and a 2.5% scale change. The accompanying text fades over 520ms; the section and controls do not move.

Both photographs decode before the visible pair changes. The newest manual choice wins over an older loading response. A missing photograph preserves the previous complete pair and offers recovery. Automatic loading failures pause the slideshow.

The pause/resume control sits beside the previous/next arrows. Hovering, keyboard focus, leaving the visible section, a hidden browser tab and Reduced/Off motion settings pause automatic changes. Returning to the section starts a fresh reading interval. Tabs and arrows remain usable without automatic playback.

## Review evidence

Desktop and phone reviews cover 1440, 1100, 1024, 390 and 320px, plus an 844 × 390 landscape viewport and actual touch-mode browser contexts. The hero/body rules align, the dark text contrast remains readable, controls fit and no horizontal overflow was found.

An unaccelerated recording shows the full loop: Places to Play at 7.06 seconds, Planted Frontage at 14.78 seconds and Shared Courtyard at 22.45 seconds. Both real image sources remain synchronized, with no blank transition frames or browser errors.

Local review captures remain under the ignored `design/review/` directory: `featured-autoplay-real-timing.webm`, `featured-autoplay-report.json`, `featured-autoplay-layout-*.png`, `rail-dark-review.md` and `dark-next-*.png`. Recreate the featured recording with `node scripts/record-featured-autoplay.mjs` while the local preview is running.

The additional browser checks exercise the complete automatic loop, manual interruption during image loading, failure/retry, pause/resume, visibility and page restoration, motion preferences and narrow control layouts. Final whole-site verification is recorded in `BUILD_NOTES.md`.

The publication audit also caught an early-click return issue: using Back to projects before the gallery module loaded could lose the archive's search and filter. The small early navigation handler now validates and restores the saved homepage destination at click time. A regression deliberately delays that gallery module, reproduces the former failure and verifies the corrected return. The animation test now samples real in-progress frames after the animation is ready rather than assuming two browser frames are sufficient.
