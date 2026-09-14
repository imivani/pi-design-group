# Project page content and gallery choices

Updated September 13, 2026 for the project-page reference and written brief supplied in `8139d5a6-4b70-4980-9ec5-1d2be40bc87e/pasted-text.txt`.

The pages use photographs, renderings and drawings already published in the Pi Design Group portfolio. The generated reference supplies the visual direction, not project facts or substitute images. The retained media and original source URLs are recorded in `src/data/galleries.json` and `design/project-media-audit.json`.

## What changed

- Added individual gallery captions across all 27 entries. They identify visible subjects such as entrances, planting, a play space or a construction photograph, rather than repeating the project name under every image.
- Added four short editorial treatments where the retained material supports a useful explanation: Crestmont West, Evanston, D’Arcy and Seton Crossing.
- Kept the curated gallery order unchanged so image controls, direct image selection and existing references remain stable.
- Kept every photograph, rendering and drawing label unchanged. Construction photographs are described as construction views. Renderings do not establish a project's current completion status.
- Left the other pages shorter. The two residential collections remain collections, and drawing-led pages do not pretend to show a completed landscape.

No new client, contract scope, completion date, status or photography credit has been inferred. The introductions describe the visible arrangement of the site and the published drawing. They are not substitutes for a confirmed account of the commission from Pi.

## Content structure

`projectDetails(project)` now returns optional `editorial` alongside the existing `gallery`, `collection` and `description` fields.

```ts
type ProjectEditorial = {
  openingNote?: string;
  introduction?: string;
  overallIndex?: number;
  pairIndices?: number[];
  quietIndex?: number;
  closingIndex?: number;
  detail?: {
    drawingIndex: number;
    photoIndex?: number;
    title: string;
    copy: string;
  };
};
```

All editorial indexes are **zero-based positions in the curated gallery**, after the existing source selections have been applied. The `selections` and `captions` maps in the same file still use one-based original source image numbers. The opening image remains curated index `0` on every page, matching the original project card where that transition is available.

| Project | Overall | Unequal pair | Quiet photograph | Design drawing / photograph | Closing |
| --- | --- | --- | --- | --- | --- |
| Crestmont West | 1 | 2, 3 | Within design details | 6 / 5 | 4 |
| Evanston | 1 | 2, 4 | 5 | 7 / 3 | 6 |
| D’Arcy | 1 | Omitted | 2 | 5 / 3 | 4 |
| Seton Crossing | Omitted | 1, 4 | Omitted | 5 / 2 | 3 |

Seton Crossing pairs the built entrance photograph at index `1` with the clearly labelled rendering at index `4` in a smaller unequal row. The rendering contains white margins and works better at this supporting scale than as a full-width interruption. The pairing does not suggest a before-and-after comparison. The available photography supports a shorter feature; there is no need to repeat an image to populate every optional arrangement.

Each chosen editorial position is unique within that project's sequence. A photograph should be shown once on the page, while remaining available in the full-screen viewer.

## Evidence for the design-detail pairings

**Crestmont West.** Original source image `3.webp` is explicitly titled *Landscape Site Plan (Overall)*. It shows residential blocks, common green spaces, playground and commercial site. Original `4.webp` shows the low natural-stone edge, planted bed and gravel play surface between the same residential and commercial buildings. The copy connects the overall arrangement to a visible built condition. It does not describe the overall plan as a construction detail for the stone edge.

**Evanston.** Original `3.webp` is the overall landscape plan, with the common space among the residential blocks and planting schedules below. Original `5.webp` looks from under the shelter toward the play equipment and surrounding homes. The explanation concerns the shared area's position and connections, not unverified performance claims.

**D’Arcy.** Original `3.webp` shows repeated residential plots, front walks and planting along the streets. Original `7.webp` shows layered frontage planting beside the sidewalk. The plan also distinguishes some planting by others; the page therefore describes the site arrangement without assigning every visible element or boulevard planting to Pi.

**Seton Crossing.** Original `3.webp` is the *Overall Landscape Site Plan, Site Statistic*. It shows perimeter planting and pedestrian space around the commercial buildings. Original `6.webp` is a photograph of the trees and shrubs between the building and public sidewalk. This supports the explanation of the planted perimeter.

## Review basis and limits

All four retained gallery contact sheets were visually reviewed. The Crestmont, Evanston, D’Arcy and Seton drawings were also inspected individually, along with their relevant photographs. Embedded source watermarks, title blocks and existing image lettering were preserved.

The reference's example client names, dates, project status and photography credit were not copied into project data. The reference's generic golden-hour images were not used as evidence of actual Pi work. Project-specific constraints, exact contracted services and outcomes can be added later when Pi supplies confirmed information; the current pages do not pad that gap with invented narrative.
