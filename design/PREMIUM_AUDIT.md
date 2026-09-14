# Client presentation audit

The current request is a targeted refinement of the existing landscape architecture portfolio. Preserve the original video hero, actual project photography, 27 legacy project addresses and the expanding service gallery. Follow the supplied reference's fine framing and photographic scale.

Design read: a landscape architecture portfolio for clients and investors, with precise framing, large photography and useful image interactions. Existing variance/motion/density is approximately 7/6/4; this refinement uses 8/6/4. The additional variation comes from how visitors explore actual work, not decorative animation.

## Baseline findings

| Area | Finding | Action |
| --- | --- | --- |
| Framing | Header and hero use side rules, but the rules stop at the hero. Content edges vary between sections. | Carry one pair of fine gray rules down the page and align content to a consistent inset. |
| Services navigation | Long labels read as descriptions; the service names differ from the homepage. | Use Multifamily Communities, Commercial Plazas and Public Parks consistently. |
| Projects navigation | Categories and three previews do not let a visitor browse all 27 entries. | Add a complete project catalogue with a changing image preview in the same navigation surface. |
| Featured project | Strong photographs but no way to explore different aspects without leaving the homepage. | Add three deliberate views of Crestmont's courtyard, play space and planted frontage. |
| Design details | Plans and photographs are informative but disconnected; Open Drawing opens a raw image tab. | Connect the photographs to their own project's drawing and provide an accessible drawing viewer. |
| Project pages | Richer editorial pages already exist. | Audit stable image controls, full-screen viewer interruption, typography and responsive framing. |
| Copy and facts | Verified locations/architecture credits exist; unknown clients, dates and status are omitted. | Retain that boundary and proper names; use Title Case for short navigation/service labels at the owner's request. |
| Delivery | A local draft with noindex is running. | Verify the local presentation; do not change the public website or claim unbuilt company/services/contact pages exist. |

## Design and motion rules

- Helvetica Neue/Helvetica/Arial, white and pale neutral surfaces, charcoal photographic sections, fine square borders. No new palette or icon family.
- One shared frame with a 24px desktop and 16px phone content inset. Border lines organize real content and continue the user's hero reference; they are not a decorative background grid.
- No all-caps styling. Short UI titles use normal Title Case by explicit request, while paragraphs remain sentence case.
- Preserve the requested dark/light section rhythm and original hero. These explicit user choices override the taste skill's generic one-theme and hero-layout defaults.
- Service expansion, featured-image selection, plan/photo selection and navigation preview each explain a real choice. No autoplay carousels, cursor tricks, ornamental loops or scroll hijacking.
- Keep the existing Reduced and Off choices, native scrolling, keyboard focus, image-error recovery and useful no-JavaScript content.
- No invented metrics, awards, testimonials, client logos or generated photographs presented as completed work.

Mobbin was consulted for supplementary portfolio navigation examples. The supplied Pi references remain the primary visual authority. The returned MOUTHWASH Studio archive supports clear category grouping with large imagery; the Studio Freight result was empty and supplied no usable layout evidence.

## Final verification

- All 59 browser checks pass. Coverage includes the complete catalogue, the new featured views and drawing explorer, project galleries, mobile navigation, keyboard focus, interrupted input, unavailable media, blocked storage and Reduced/Off motion.
- Automated accessibility checks report no violations in the tested homepage, project page, navigation catalogue and open image/drawing viewers.
- The shared frame and normal-case headings were checked at 320, 390, 768, 1440 and 1920px. Wider site tests also cover 1024px and compact 1100px navigation. The small-screen header now shares the content inset.
- Corrected an integration conflict in stylesheet layer ordering that had overridden mobile spacing and image sizing. Each newly separated style file declares the same layer order before its own rules.
- All requested assets with a source load in the homepage check. The drawing viewer's unused image has no source until opened; its separate checks verify the actual selected drawing and failure recovery.
- The static build contains 28 pages. Both `/` and `/pi-preview/` builds pass all 27 project-link checks plus featured image selection, drawing selection/zoom, the full navigation catalogue, project viewer and cross-page Services navigation. No browser or asset-response errors were recorded.
- The final output in `dist` uses the root path. The source check reports zero errors, warnings or hints.
- A separate presentation review at 1440px and 390px captured 19 screenshots and the 19-second `review/premium-motion.webm` recording with full motion enabled. It exercised both menus, service expansion, featured views, drawing selection/viewer and Grid/Index switching. It found no blocking visual defects, browser errors, horizontal overflow or uppercase labels. The machine-readable result is `review/premium-motion-review.json`.

This is a reviewed local presentation of the homepage and 27 project pages. The public website remains unchanged. Actual Safari/iPhone hardware has not been tested. Dedicated company, service and contact pages remain in the next-page plan; current navigation uses real homepage sections and working email/telephone links.
