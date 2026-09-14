# Pi Design Group — September 13 revision

## Current design direction

The owner's latest written plan takes priority over earlier generated concepts and older section lists in DESIGN.md.

- **Hero:** keep R01's original video composition and “Shaping Places / People Belong.” Remove the repeated bottom slogan, extra brand labels and uppercase styling. Keep the existing footage, pause control and still photograph when video cannot play.
- **Visual mood:** [R12](references/R12-homepage-visual-mood.png) supplies the dark/light contrast, large photography and variation in section weight. The written plan replaces its four service cards and generic Why section.
- **Project pages:** [R13](references/R13-project-detail-direction.png) supplies the white opening, oversized photography, uneven galleries, drawings, project information and dark full-screen viewer.
- The requested design-taste-frontend skill informed the editorial layout, real-image emphasis and restrained controls. The existing Astro stack was retained. Icons use Lucide.
- The supplied MOTION.md remains the motion reference. The design blacklist remains applicable. Mobbin was consulted during planning; it did not replace the owner's references.

Homepage order:

1. Dark video hero.
2. White “What we do” with three expanding photographs: multifamily communities, commercial plazas and public parks.
3. White featured-project opening, a nearly full-width photograph, then a dark supporting panel with a second photograph and verified credits.
4. Pale “Design in the details”: Crestmont's actual landscape plan, an Evanston path and Crestmont stonework.
5. White archive containing all 27 entries, search, filters and Grid/Index views. Three columns on ordinary desktops, two on tablets and one on narrow phones.
6. Dark photographic contact section.
7. White footer.

## Implemented behaviour

The three service photographs always remain present. The selected desktop photograph expands to about half the available width. Hover intent, clicking and keyboard controls select it; mobile visitors can tap the photograph or title to expand or collapse its description.

One pair of fine gray side rules now runs from the hero through the footer, including on project pages. Header, photographs and text use the same 24px desktop or 16px phone inset. Short navigation and service titles use proper capitalization; all-caps styling is removed.

Projects now includes a hoverable All Projects catalogue with all 27 direct links and an image preview that follows the selected project. Services uses the same three names as the homepage: Multifamily Communities, Commercial Plazas and Public Parks. The compact menu exposes the same complete catalogue.

The featured Crestmont story has three selectable views: Shared Courtyard, Places to Play and Planted Frontage. Both photographs and the accompanying text update together after the images load. The Design in the Details section connects an Evanston path and Crestmont stone edge to each project's real landscape drawing. Visitors can open, zoom and pan the full drawing without leaving the homepage.

All 27 original project addresses now have local pages. Archive, navigation-preview and next-project links use these pages. The unusual legacy route spellings are retained so a later deployment can preserve existing links. Summit 77 Apartments has its corrected distinct address.

Each project uses genuine media from its existing PI portfolio entry. Galleries vary in length according to available material. Duplicate views and footer logos are excluded. Photographs, renderings and drawings are labelled separately. Residential collections are described as collections. Unknown clients, completion dates, areas, status and photography credits are omitted instead of copied from generated references.

The full-screen viewer supports next/previous buttons, arrow keys, Escape, Close, touch swipes, zoom and dragging a zoomed image. It keeps keyboard focus inside the viewer and returns focus to the original image after closing. Failed images leave a useful message and the previous good image. A newer selection prevents an older loading response from replacing it.

The latest project-page brief uses a compact white opening, normal-case project names and a large opening photograph that is visible on the first screen. Manual image arrows change that photograph without resizing its frame. Drawings fit fully within the same opening frame. Essential titles, introductions and project information do not wait for scroll animation.

Crestmont, D’Arcy, Evanston and Seton have individual editorial sequences. Wide views, unequal image pairs and smaller details retain their natural image proportions. Their real landscape plans sit beside relevant built photographs, followed by a final broad view. Shorter, rendering-led, drawing-led and residential collection pages use the material available to them. See [Project page content](PROJECT_PAGE_CONTENT.md) for the reviewed image pairings and caption evidence.

The closing area contains one substantial next-project link, a second Back to projects link, a compact contact line and the shared white footer. The latest written brief takes priority over the generated reference's larger photographic contact panel.

“Back to projects” returns to the visitor's search, filter, Grid/Index choice and browsing position. Search from a project-page header opens and focuses the homepage search. Direct visits have a working return link.

## Motion behaviour

| Interaction | Behaviour |
|---|---|
| Sections | Offscreen groups fade from transparent to visible with 16px of upward travel over 520ms, once per visit. Content starts visible without JavaScript. Already visible content and browser-back restoration do not wait for an entrance. |
| Archive | New rows reveal together over 480ms. No 27-card waiting sequence. Filtering and Index view immediately expose usable results. |
| Services | 420ms width change and 240ms description fade. New input replaces pending hover intent. Phone panel height changes smoothly. |
| Navigation | Existing 120ms hover intent, anchored opening, image-preview fades and reversible mobile disclosures remain. |
| Featured project | New selections crossfade both decoded photographs over 320ms and text over 240ms. Rapid selections resolve to the latest choice; a missing image retains the previous complete view. |
| Design details | Hover, focus or tap selects the corresponding real drawing and project information. Drawing selection and the full-screen viewer follow the shared motion preference, with keyboard controls and focus return. |
| Project navigation | Same-origin native page transitions carry a clicked project photograph into the matching opening image over 420ms in supporting browsers. Ordinary navigation is the fallback. |
| Project gallery | Offscreen image groups reveal together once. Gallery photos keep their natural proportions; text and factual information are immediately available. |
| Opening image controls | A decoded image crossfades over 240ms inside a fixed frame. The caption, count and full-screen target update to that exact image. There is no automatic carousel. |
| Image viewer | The actual clicked image expands from its measured crop into an uncropped view over 420ms. Closing returns it to the same visible image in 260ms; an unavailable or changed origin uses a 180ms fade. Image changes crossfade over 240ms without moving the frame. Interrupted opening and closing continue from their current positions. |
| Video | Starts only when permitted and relevant. Pauses away from the hero or in a hidden tab. Manual pause persists. |
| Motion preference | System, Reduced and Off apply across all pages. Reduced removes spatial travel; Off settles animation. Automatic video stops in both. |

These durations are choices based on the supplied guide, not measurements of an Apple product. Native scrolling is preserved.

## Media and maintenance

- src/data/projects.ts supplies the archive and verified credits.
- src/data/galleries.json stores source metadata; src/data/project-details.ts supplies reviewed selections, medium labels and captions.
- scripts/sync-media.py refreshes homepage assets and project covers. scripts/sync-project-galleries.mjs refreshes gallery sources. Run both when rebuilding media from scratch.
- design/site-audit.json, media-audit.json and project-media-audit.json retain provenance. The four gallery contact sheets record the visual review.
- The park service photograph is identified as a Crestmont play-space detail, not a verified named public-park commission.
- The footage's exact project is unverified, so its caption is simply “Pi Design Group.” The still poster is D’Arcy, Okotoks.
- Generated concept photography is not presented as completed PI work. The drawing's original PI watermark remains intact.

## Verification and review

The local draft is at http://127.0.0.1:4321/. The public website has not been changed. Draft pages retain noindex.

Browser checks cover navigation, all 27 destinations, search/filter state, desktop/phone layouts, mobile touch expansion, the viewer, keyboard focus, interrupted input, unavailable media, blocked storage, reduced motion and JavaScript-disabled content. Automated accessibility checks cover the homepage, project page and open viewer. Chrome was checked at widths from 320px to 1920px; actual Safari/iPhone hardware remains untested.

The static build contains 28 pages. Root and subfolder builds are checked by scripts/verify-build.mjs. npm run check reports no errors, warnings or hints.

The latest presentation audit passes all 59 browser checks. Root and `/pi-preview/` output also verify the new featured views, drawing viewer and complete project menu, with no browser or asset-response errors. See [Presentation audit](PREMIUM_AUDIT.md) for findings and corrections.

The current homepage interactions are recorded in `design/review/premium-motion.webm`, with 19 desktop/phone screenshots and `premium-motion-review.json`. This independent full-motion review found no blocking visual or interaction defects.

Desktop/phone screenshots and desktop-motion.webm are in design/review. The recorded page transition confirmed the matching project photograph; the recording produced no browser errors. Capture scripts use isolated browsers and do not change the owner's saved motion preference.

The project-page refinement also has a separate project-motion.webm recording, 25 layout reviews across five representative project types at 320–1920px, and full gallery coverage checks across all 27 pages. These found no horizontal overflow, missing images or repeated gallery placements. Viewer checks include transition reversal, motion preference changes during animation, delayed-image recovery, missing-origin fallback, and changing the opening image while another image is loading.

See [Next pages](NEXT_PAGES.md) for the remaining site plan.
