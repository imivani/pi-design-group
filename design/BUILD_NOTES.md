# Pi Design Group — September 14 revision

## Latest content update

The [USB photo and attribution update](USB_PHOTO_UPDATE.md) adds 70 photographs, 3 architect renderings and three individual project pages, bringing the live inventory to 30. It preserves the approved design and gallery ordering. The counts below describe earlier design stages.

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

## September 14: Three featured projects and interface polish

Featured Projects now rotates through Crestmont West, D’Arcy and Seton Crossing, with a seven-second pause between changes. Both photographs, the title, location, description and destinations update together after the images load. Numbered choices and playback controls sit above the feature; the old bottom view labels are removed. Hover, keyboard focus, hidden tabs and reduced-motion preferences retain their pause behaviour. The smaller photograph has a soft shadow and no border.

Archive cards have a #fafafa surface and a faint outline, preserving their rounded shape before hover. Gallery counts stay visible beside an Images icon. Grid/Index controls and contact methods have meaningful Lucide icons. Project names and smaller action labels have stronger weight; editorial headlines remain light. All rendering credits remain present.

Validation: the 17 existing focused browser checks passed (16 initially; the narrow-phone control check passed after a spacing fix). An additional end-to-end check passed for all three project identities, locations and destinations, including opening D’Arcy. Feature accessibility was checked at 320, 390, 1024, 1100 and 1440px. Desktop/mobile visual captures were reviewed. Type checking reported no errors, warnings or hints. Production build verification passed all 30 project destinations, search, navigation, drawings and project transitions across 31 pages.

Owner correction: archive project names retain their original weight; gallery counts use the label “Photos” beside the image icon.

Owner correction across the whole interface: reverted every font-weight increase from this polish pass, including expertise titles, design-detail choices, featured labels, search results, contact actions, archive filters and photo counts. Retained the new icons, Photos wording, rounded card surfaces and three-project slideshow.

## September 15: More expressive motion

- All Projects uses individual card transitions: retained cards glide from their previous visible positions, and incoming cards rise with a short 45ms stagger (capped at 180ms). Rapid changes cancel the old transition. Grid/Index, search and empty results continue to work immediately. Reduced motion keeps a brief fade; Off settles immediately.
- The light navigation bar uses 48px backdrop blur, up from 24px, with a slightly more opaque frosted surface. The hero header is unchanged.
- The contact photograph now makes a more visible 12-second alternating pan/zoom, while the text and controls remain still. It pauses offscreen and in hidden tabs; reduced/off preferences stop it.
- Featured projects now wait five seconds between the existing paired-photo transitions, retaining hover/focus pause and manual controls. Typography weights remain unchanged.

Motion skill best practices were applied to native browser animations. Mobbin still references reviewed: Lightship https://mobbin.com/sites/sections/0791334e-985a-4902-b866-3be56684576c and Zipline https://mobbin.com/sites/sections/db606a06-580c-4a2a-b326-96df0ce8b3e1. These informed photographic clarity, not measured motion timing; the animation treatment is original.

Validation: nine focused browser checks passed, covering rapid filtering, reduced motion, contact visibility, five-second autoplay, interruption and unavailable images. Desktop 1440px and phone 390px browser captures showed no horizontal overflow; contact start/end frames confirm the moving image and stable text. Type checking passed without errors, warnings or hints. The 31-page production build and all 30 project destinations passed the build verifier, with no browser errors.

Production follow-up: live verification exposed a prefixed-declaration ordering issue: the CSS minifier retained only `-webkit-backdrop-filter`, so Chrome did not apply the frost. Putting the standard declaration last preserves the working rule. The production-build verifier now explicitly checks the light header's computed 48px blur, and passes after the correction.

## September 15: Dedicated contact page

Built /contact from the owner's contact-page concept and pasted interaction advice, with the owner's requested white hero overriding the dark concept. Design read: editorial architecture portfolio for prospective clients; native CSS and existing Helvetica system; variance 7, motion 6, density 3. Existing font weights remain unchanged. The light hero, charcoal direct-contact strip and full-width photographic close follow the requested reference rhythm rather than the skill's default single-theme rule.

Four project-type choices preview real project photographs on hover/focus; choosing one expands the inline inquiry fields. The photo and caption update together after decoding, stale requests are ignored, and failed photos leave the form usable. Fields retain their contents when changing project type. On phones and tablets, the changing photograph follows the chooser and precedes the form. The closing photograph uses the existing visibility-aware camera animation. Links, selection indicators and field focus have restrained motion; Reduced/Off remain supported.

The form validates name, email, location and message, then prepares a mailto draft to peter@pidesigngroup.ca. The visitor reviews and sends in their own email app. The interface states this explicitly and never claims successful delivery. It includes a copy-details fallback. No server email provider, inbox, credentials, response-time promise, new office address or personal-data storage was invented. Direct phone and email remain available, and the form has a no-JavaScript fallback.

Navigation, footer, homepage contact CTA and project-page CTA now link to /contact. The current contact link is marked as the current page. Keyboard traversal between navigation menus was updated to the new destination.

Validation: five contact checks cover image preview, inline form, preserved input, email preparation and validation, keyboard/accessibility, responsive layout, no-script operation and image-error recovery. Existing rounded-home checks passed. Header/home regression checks passed after correcting one stale single-home count left over from the USB import. Reviewed actual 320, 390, 768, 1024 and 1440px layouts; no horizontal overflow or heading/photo collision. Type check passes with no diagnostics. Production verification now includes /contact alongside the existing 30 project destinations; build contains 32 pages.

## September 15 — Full-width homepage contact
- Extended the homepage contact photograph to both page edges, removed rounded corners and the gap above the footer, and kept text on the shared content rails.
- Preserved the moving photograph and contact links. Verified desktop and mobile layouts, contact accessibility, and the production build.


## September 15: Mobile glass navigation and photographic featured backdrop
- Mobile navigation is an inset frosted sheet with 32px blur, a 420ms entrance and a 220ms dismissal. Route selection remains immediate. Reduced motion uses fades; Off settles immediately. Closing during entrance or motion changes preserves focus and scrolling.
- Three photographic project shortcuts reduce browsing steps; catalogue rows and contact links have larger touch targets. The complete project catalogue remains available.
- Featured projects now have an edge-to-edge darkened, softly blurred photograph behind the existing composition. The backdrop changes with the same decoded project photographs and respects the existing slideshow pause and motion controls.
- Motion skill applied using native browser animation. Mobbin ClickUp navigation reference informed grouping and touch targets, not motion timing: https://mobbin.com/screens/a5d4ecb3-e59b-4cf5-a5e4-65215c8a5e8d.
- Verified phone/desktop screenshots, 24 navigation/slideshow checks, type checking and the 32-page production verification. Corrected the new width check to account for the browser's reserved scrollbar gutter.

## September 15: Three-second carousel and next-project atmosphere
- Next-project sections use the destination project's own image as a full-width dark blurred backdrop, matching Featured Projects. Foreground credits and navigation remain intact.
- Featured projects advance on a three-second rhythm with an 850ms directional slide/settle and 780ms crossfade across all three photographs. The old section-wide hover pause was making the carousel appear static; pointer hover no longer stops rotation, and pointer/touch focus no longer leaves it paused. Keyboard focus, explicit pause, reduced/off motion, offscreen state and hidden tabs still suspend autoplay.
- Ten focused autoplay/project-layout checks passed, including a complete carousel loop under pointer hover, image failure, interruption and motion preferences. Desktop/mobile visuals, type checking and the 32-page production verifier passed.

## September 15: Five-second featured carousel
- Changed the automatic interval from three seconds to five seconds at the owner's request. Preserved the slide/crossfade and pointer-hover behavior. All seven focused carousel checks pass.


## September 15: Editorial About page
- Added /about and linked it in desktop/mobile navigation and the footer. Preserved the shared white header, regular Helvetica weights, structural rails and native page transitions.
- Content is drawn from the owner-supplied PI Design Corporate Profile and PI Design Project Experience (dated May 5, 2026). The documents support 70+ completed projects, licensing in Alberta and British Columbia, an established practice of over a decade, Peter's 20+ Calgary years and 1996 master's degree, and Terry's 40+ years across Western Canada. No founding year, outcomes, clients or additional credentials were invented.
- Terry has a discipline description rather than an unconfirmed Partner/Principal title. Opening media is an unlabeled neutral placeholder; two large 4:5 warm-gray portrait slots are ready for approved photography, with no generated people.
- Selected experience contains 18 records with source years and categories. Only clear project matches link to existing routes; ambiguous Summit 77/Mahogany records and unreleased portfolio pages remain plain text. Source location discrepancies are not propagated. Responsibilities describe typical services; construction administration remains conditional on scope.
- Motion skill applied through native browser animations: staged opening groups, scroll reveals, animated experience filtering, portrait-adjacent rule expansion, interruptible native disclosures and the existing moving photographic close. Reduced/off and no-script content supported. No counters or portrait zoom.
- Reviewed the supplied visual and the actual Mobbin Pentagram two-column introduction (326ff8e0-1f06-4a08-a915-0e53b4967529). Used the user's written placeholders over the concept's generated photographs.
- Four About tests plus 11 shared-header tests pass. Filters, keyboard operation, fast changes, no-script disclosure, accessibility, and 320/390/768/1440px reflow checked. Fixed hidden filter enhancement and small-label contrast during QA. Type checks and the 33-page production verifier pass, including About navigation and interactions.

## September 15: About photography revision
- Replaced opening placeholder with real D'Arcy planting photography spanning exactly between the shared frame borders. Added the two owner-supplied portraits: light-background Terry Klassen, dark-background Peter Imshenetskyy. Optimized WebP files retain the supplied appearances.
- Experience now displays eight always-visible matched project thumbnails with rendering credits; the remaining ten documented records stay text-only because no confirmed matching imagery is available. Photographic entries lead the list and filters cover every record.
- What we do now pairs its service sequence with a changing real drawing/photograph, triggered by hover, keyboard focus or tapping. Images decode before swapping, captions follow selection, and stale requests are discarded. How we work becomes a large courtyard photograph beside expandable editorial statements, replacing the four-column grid.
- Removed the separate Practice credentials section. Kept credentials in the leadership biographies and factual licensing rail.
- About accessibility, responsive checks, all eight image loads, desktop/mobile visuals, type checks and the 33-page production verifier passed. No fabricated landscape imagery or unrelated images were assigned to project records.

## September 15: About hierarchy and interactive stages
- Replaced the active Crestmont drawing across the homepage, About page and project gallery with the owner-supplied September 15 drawing, optimized as landscape-plan-2026.webp. A new filename prevents stale cached imagery.
- Added a faint moving drawing behind The practice, paused offscreen and when the tab is hidden, with reduced/off motion support.
- Leadership now shows experience and credentials openly, with clearer name, experience and focus hierarchy.
- Replaced service disclosures with three illustrated, keyboard-accessible stages. How we work is a horizontal icon-led section without photography. Selected experience follows it immediately before the contact close.
- About, drawing interactions and project transition checks pass. Desktop/mobile review, accessibility/reflow, type checks, production build and the 33-page verifier passed. Updated drawing assertions and made an existing filter test wait for its entrance animation to finish.

## September 15: Compact experience and charcoal working section
- How we work now matches the neutral #1b1c1d charcoal used elsewhere, with a softly blurred grayscale Crestmont photograph behind the horizontal principles.
- Selected experience uses smaller thumbnails and a four/three/two-column desktop/tablet/mobile grid, with tighter spacing and regular-weight headings to reduce scrolling.
- Five About checks and the 33-page production verifier pass. Desktop and mobile imagery/layout reviewed after images decoded.

## September 15: Consistent logo return
- Extended the existing homepage hero return animation from project pages to About and Contact. Both click tracking and the storage-unavailable referrer fallback recognize these routes; animation timings remain unchanged.
- All 17 home-return tests pass, including both added routes with normal and reduced motion, mobile, native/fallback transitions, Back/reload and unavailable storage. Production build and verifier passed.

## September 15: Homepage text entrance
- Added a staggered opacity/translate entrance for the hero label, two headline lines, description and button on direct desktop/mobile visits. Runs for roughly one second, with smaller travel on phones.
- Preserves the existing logo-return dissolve without doubling animations; Back, anchored archive visits, reduced/off motion and no-JS content remain immediate. Interaction, pagehide and print settle the entrance.
- New desktop/mobile entrance checks pass, alongside 17 existing logo-return checks and the production verifier.
