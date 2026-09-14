# Calm portfolio refinement — September 14

The owner's latest edits take priority over the earlier rounded-panel audit and the pasted ChatGPT advice. The screenshots and advice support composition choices; they do not override the requested external Featured Project heading, split panel or retained expertise interaction.

## Design read

A photograph-led landscape architecture portfolio for prospective clients, with neutral surfaces, clearer practice copy and slower, useful interaction. This is a targeted refinement of the existing Astro site, retaining its typography, actual work, video hero, project routes and accessibility controls. Dials: variance 7, motion 5, density 4. The previous 8/7/4 treatment added too many competing controls and dark surfaces.

## Implemented direction

- A new practice introduction between Hero and Expertise: “A Calgary-Based Landscape Practice.” The copy explains outdoor connections, planting, pedestrian routes and site details without adding unsupported rankings, awards, dates or credentials.
- “Our Expertise in Three Areas.” replaces What We Do. The three expanding photographs remain; their overlapping dark gradients are lighter and neutral, with local shading behind the words.
- Featured Project is black text above the composition. The panel places factual Crestmont West information on neutral charcoal at left and one full-strength photograph at right. Three plain text choices crossfade the image over 500ms. Floating detail imagery, thumbnail cards and the full-image overlay are removed.
- “Our Design Comes in the Details.” replaces the old heading. White and pale gray replace green. The complete drawing, three interactive photo choices, zoom and meaningful project links remain, with fewer nested containers and repeated labels.
- The archive keeps its photographs in fixed frames. After a brief hover intent, images ease by only 2.5% over 720ms. Project-specific copy sits below the photograph; extra gallery information fades into that area. Touch visitors see the information directly. Search, category filters, Index view and all 27 routes remain.
- Continuous side rules use half their previous opacity. The hero playback button and repeated media caption are removed. The footage still follows viewport visibility, browser visibility and the saved System/Reduced/Off preference in the footer. A blocked video leaves the project photograph visible.
- The hero's scroll arrow now leads into the new introduction, so it does not skip the added section.

## Verification

- Code check: 44 files; zero errors, warnings or hints.
- Full browser suite: all 70 checks passed. Coverage includes the new introduction, hero without playback controls, saved motion preference, slow archive hover, extra information, first-tap touch navigation, fixed rows, filters, navigation, gallery failure recovery, keyboard operation and existing project-page transitions.
- Root and `/pi-preview/` production output: 28 pages and all 27 project destinations verified, including featured choices, drawing zoom, complete navigation catalogue and service links from a project page. No browser or failed-asset errors. Final `dist` is the root build.
- Fresh desktop 1440px and touch 390px/320px review found no unresolved layout or interaction defects. The larger suite also covers widths through 1920px. Real Safari/iPhone hardware has not been tested.
- The lighter service gradients were checked against the actual photographs: minimum large-heading contrast 4.06:1, body contrast 5.83:1 and caption contrast 7.91:1. White labels remain readable without restoring the old heavy black treatment.
- Screenshots, motion recording and measurements are in `design/review/calm-review*`, `calm-motion.webm` and `calm-review-report.json`. Recreate current review captures with `node scripts/record-calm-review.mjs`.
- The supplied split-card reference is retained as `design/references/R19-featured-split-reference.png`.

These edits update the local preview. They have not been uploaded to the existing GitHub repository or deployed to the public website. Earlier audits and recordings remain historical records of their respective layouts.
