# Pi Design Group — September 14 revision

## Current design direction

The owner's latest written plan takes priority over earlier generated concepts and older section lists in DESIGN.md.

The latest September 14 edits soften only the hero's frame lines, deepen Featured Project and Next Project to charcoal, and add controlled automatic featured views. See [Slideshow refinement](SLIDESHOW_REFINEMENT.md) for the latest behavior and visual evidence. [Project and navigation refinement](PROJECT_NAVIGATION_REFINEMENT.md) records the preceding smooth logo returns, early project information, frosted light-page header and search fades. [Cinematic refinement](CINEMATIC_REFINEMENT.md) records the preceding Featured Project, search and archive work.

- **Hero:** keep R01's original video composition and “Shaping Places / People Belong.” Remove the repeated bottom slogan, extra brand labels, playback button and uppercase styling. Keep the footage and still photograph when video cannot play.
- **Visual mood:** [R12](references/R12-homepage-visual-mood.png) supplies the dark/light contrast, large photography and variation in section weight. The written plan replaces its four service cards and generic Why section.
- **Project pages:** [R13](references/R13-project-detail-direction.png) supplies the white opening, oversized photography, uneven galleries, drawings, project information and dark full-screen viewer.
- **Latest Featured Project:** R20 supplies the dark section, large project title, dominant photograph and overlapping secondary photograph. The owner's request removes its uppercase microcopy and decorative slogans. R14–R18 remain references for rounded contact/archive panels and the drawing explorer.
- The requested design-taste-frontend skill informed the editorial layout, real-image emphasis and restrained controls. The existing Astro stack was retained. Icons use Lucide.
- The supplied MOTION.md remains the motion reference. The design blacklist remains applicable. Mobbin was consulted during planning; it did not replace the owner's references.

Homepage order:

1. Original video hero, without a playback button or repeated media caption. The scroll link reaches the introduction.
2. White practice introduction: “A Calgary-Based Landscape Practice.”
3. “Our Expertise in Three Areas.” with the existing expanding photographs and lighter local text shading.
4. Dark Featured Project section with a large Crestmont West title, main photograph and overlapping detail photograph. Three plain view choices and previous/next controls change both photographs and their description together.
5. “Our Design Comes in the Details.” with a neutral white/gray drawing explorer, complete real plan and three built-detail choices.
6. White archive containing all 27 entries, project-specific descriptions, search, filters and Grid/Index views. Three columns on ordinary desktops, two on tablets and one on narrow phones. Hover expands the photograph across its entire rounded card with local shading behind readable text. Category and view changes fade into place.
7. Rounded D’Arcy photographic contact panel with a slow camera move, a large invitation, direct email and telephone links.
8. Spacious white footer with navigation, a return-to-top link and motion preference control.

## Implemented behaviour

The three service photographs always remain present. The selected desktop photograph expands to about half the available width. Hover intent, clicking and keyboard controls select it; mobile visitors can tap the photograph or title to expand or collapse its description.

One pair of aligned gray side rules runs from the hero through the footer, including on project pages. The hero's rules use half the opacity of the remaining page frame (25% versus 50%), and the structural white header lines over the hero use 10% opacity. Header, photographs and text use the same 24px desktop or 16px phone inset. Short navigation and service titles use proper capitalization; all-caps styling is removed.

Projects includes a hoverable All Projects catalogue with all 27 direct links and a preview that follows the selected project. Projects and Services use the same stable outer frame rather than resizing during a hover handoff. A slightly stronger shadow separates the navigation from the page. Services uses the same three names as the homepage: Multifamily Communities, Commercial Plazas and Public Parks. The compact menu exposes the same complete catalogue.

The search icon opens a dedicated white dialog over the current page. It contains photographic suggestions, matches across all 27 names/types/locations, a useful empty state and complete-project browsing. Apostrophe variants and accents are normalized. Arrow keys, Enter, Escape and Tab work; focus returns to the opener. Mobile search fills the screen and replaces the open navigation. Without JavaScript, the icon retains its archive destination. Directly inspected Telescope and Whop screens in Mobbin informed the visual treatment; the latest refinement document records those sources.

The featured Crestmont story has three selectable views: Shared Courtyard, Places to Play and Planted Frontage. The main photograph, overlapping detail photograph and accompanying text update together after both images load. The details section connects Crestmont planting, an Evanston path and a Crestmont stone edge to each project's real landscape drawing. The active detail row expands its photograph and updates the complete drawing and project link. Visitors can open, zoom and pan the full drawing without leaving the homepage.

All 27 original project addresses now have local pages. Archive, navigation-preview and next-project links use these pages. The unusual legacy route spellings are retained so a later deployment can preserve existing links. Summit 77 Apartments has its corrected distinct address.

Each project uses genuine media from its existing PI portfolio entry. Galleries vary in length according to available material. Duplicate views and footer logos are excluded. Photographs, renderings and drawings are labelled separately. Residential collections are described as collections. Unknown clients, completion dates, areas, status and photography credits are omitted instead of copied from generated references.

The full-screen viewer supports next/previous buttons, arrow keys, Escape, Close, touch swipes, zoom and dragging a zoomed image. It keeps keyboard focus inside the viewer and returns focus to the original image after closing. Failed images leave a useful message and the previous good image. A newer selection prevents an older loading response from replacing it.

The project-page brief uses a compact white opening, normal-case project names and a large first-screen photograph. A fresh visit receives a short title/photo entrance; browser Back, Reduced and Off present the opening immediately. Manual image arrows change the photograph without resizing its frame. Drawings fit fully within that frame. A compact information band sits immediately below the photograph, before the introduction and gallery. It contains all verified project facts and uses two columns on phones; the old lower table is removed.

Crestmont, D’Arcy, Evanston and Seton have individual editorial sequences. Wide views, unequal image pairs and smaller details retain their natural image proportions. Their real landscape plans sit beside relevant built photographs, followed by a final broad view. Shorter, rendering-led, drawing-led and residential collection pages use the material available to them. See [Project page content](PROJECT_PAGE_CONTENT.md) for the reviewed image pairings and caption evidence.

The closing area contains one substantial next-project link on a full-width deep charcoal section (#1b1c1d), a second Back to projects link, a compact contact line and the shared white footer. Its content follows the existing side borders. Light headings and secondary text keep the dark section readable; print uses dark text on white. The latest written brief takes priority over the generated reference's larger photographic contact panel.

“Back to projects” returns to the visitor's search, filter, Grid/Index choice and browsing position, even when clicked before the gallery module finishes loading. The early handler validates the saved homepage destination before following it. Header search opens over the current project page and can navigate directly to another project. Direct visits have a working return link.

## Motion behaviour

| Interaction | Behaviour |
|---|---|
| Sections | Offscreen groups fade from transparent to visible with 16px of upward travel over 520ms, once per visit. Content starts visible without JavaScript. Already visible content and browser-back restoration do not wait for an entrance. |
| Archive | New rows reveal together over 480ms. A 140ms hover intent precedes an 860ms photograph expansion across the card; a 680ms shade transition preserves text contrast. The card and adjacent rows stay fixed. Filters, search/reset and Grid/Index changes fade/lift the current results over 560ms. New input cancels stale motion. |
| Services | 420ms width change and 240ms description fade. New input replaces pending hover intent. Phone panel height changes smoothly. |
| Navigation and search | 120ms menu hover intent, a stable outer frame, image-preview fades and reversible mobile disclosures. Search enters over 280ms, results fade over 460ms with an even easing curve and closing takes 160ms. Query refinements animate even if the result set stays the same, and continued typing retargets current opacity. Keyboard focus or result pointer interaction settles the fade. The page width stays fixed, focus returns, and Escape closes immediately even with text entered. |
| Featured project | Three real photo pairs advance after seven seconds of settled viewing. Both decoded photographs crossfade over 620ms with a restrained 650ms camera settle; text fades over 520ms. Pause/resume, tabs and arrows remain available. Automatic changes pause during hover/focus, offscreen, in hidden tabs and in Reduced/Off. Interrupted loads cannot replace a manual choice, and either missing image retains the previous complete view. |
| Design details | Hover, focus or tap selects the corresponding real drawing and project information. Drawing selection and the full-screen viewer follow the shared motion preference, with keyboard controls and focus return. |
| Project navigation | Header, search and archive links can carry the clicked photograph into the matching project opening over 620ms. Identity and source scene are checked before sharing. A separate 560ms title entrance accompanies it. Unsupported or skipped native transitions receive one 560–620ms fade/lift entrance. Back, Reduced and Off do not replay it. Content remains visible without JavaScript. |
| Return through the logo | An intentional return from a project to the homepage receives one 480ms dissolve and gentle hero-title entrance. Normal links are retained without an artificial navigation delay. Back/reload and unrelated visits stay immediate; same-page logo clicks keep smooth scrolling. Reduced/Off remove the entrance. |
| Project gallery | Offscreen image groups reveal together once. Gallery photos keep their natural proportions; text and factual information are immediately available. |
| Opening image controls | A decoded image crossfades over 240ms inside a fixed frame. The caption, count and full-screen target update to that exact image. There is no automatic carousel. |
| Image viewer | The actual clicked image expands from its measured crop into an uncropped view over 420ms. Closing returns it to the same visible image in 260ms; an unavailable or changed origin uses a 180ms fade. Image changes crossfade over 240ms without moving the frame. Interrupted opening and closing continue from their current positions. |
| Video | Starts only when permitted and relevant. Pauses away from the hero or in a hidden tab. The saved Reduced/Off preference stops automatic playback. No hero playback button. |
| Contact and footer | The photograph alone moves through a slow 16-second alternating pan/zoom while visible; text and links remain steady. It pauses offscreen or in a hidden tab and stops in Reduced/Off. Contact/footer links retain small arrow movements. |
| Motion preference | System, Reduced and Off apply across all pages. Reduced removes spatial travel; Off settles animation. Automatic video stops in both. |

These durations are choices based on the supplied guide, not measurements of an Apple product. Native scrolling is preserved.

## Media and maintenance

- src/data/projects.ts supplies the archive and verified credits.
- src/data/galleries.json stores source metadata; src/data/project-details.ts supplies reviewed selections, medium labels and captions.
- scripts/sync-media.py refreshes homepage assets and project covers. scripts/sync-project-galleries.mjs refreshes gallery sources. Run both when rebuilding media from scratch.
- design/site-audit.json, media-audit.json and project-media-audit.json retain provenance. The four gallery contact sheets record the visual review.
- The park service photograph is identified as a Crestmont play-space detail, not a verified named public-park commission.
- The footage's exact project is unverified, so it has no project-specific caption. The still poster is D’Arcy, Okotoks.
- Generated concept photography is not presented as completed PI work. The drawing's original PI watermark remains intact.

## Verification and review

The local draft is at http://127.0.0.1:4321/. The public website has not been changed. Draft pages retain noindex.

Browser checks cover navigation, all 27 destinations, search/filter state, desktop/phone layouts, mobile touch expansion, the viewer, keyboard focus, interrupted input, unavailable media, blocked storage, reduced motion and JavaScript-disabled content. Automated accessibility checks cover the homepage, project page and open viewer. Chrome was checked at widths from 320px to 1920px; actual Safari/iPhone hardware remains untested.

The static build contains 28 pages. Root and subfolder builds are checked by scripts/verify-build.mjs. npm run check reports no errors, warnings or hints.

Final verification covers all 118 browser checks: 117 passed in the final whole-site run; the remaining complete-catalogue check exhausted its 30-second budget for sequential development requests. That check now validates the same 27 pages and 27 images in small parallel batches with a 60-second budget, and passed three consecutive focused runs. No application source changed after the whole-site run. The early Back to projects regression reproduced its former failure with the gallery module deliberately delayed, then passed after the correction. Production verification passed all 27 destinations, paired featured views, drawing viewer, complete navigation catalogue, project search, early project facts and animated logo return at root and `/pi-preview/`, with zero browser errors. The final type check reports zero errors, warnings or hints. Earlier audit documents preserve their respective results.

The current Featured Project, header search, project arrival and homepage interactions have fresh review captures under `design/review/`. See the latest refinement document for filenames. Earlier `calm-motion`, `rounded-motion` and `premium-motion` captures remain records of previous compositions.

Desktop/phone screenshots and desktop-motion.webm are in design/review. The recorded page transition confirmed the matching project photograph; the recording produced no browser errors. Capture scripts use isolated browsers and do not change the owner's saved motion preference.

The project-page refinement also has a separate project-motion.webm recording, 25 layout reviews across five representative project types at 320–1920px, and full gallery coverage checks across all 27 pages. These found no horizontal overflow, missing images or repeated gallery placements. Viewer checks include transition reversal, motion preference changes during animation, delayed-image recovery, missing-origin fallback, and changing the opening image while another image is loading.

See [Next pages](NEXT_PAGES.md) for the remaining site plan.
