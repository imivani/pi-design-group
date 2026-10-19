// The three areas of work. Each page only names projects whose photographs,
// captions or plans show that kind of work.
import { media } from './projects';

export type Service = {
  id: 'multifamily' | 'commercial' | 'parks';
  slug: string;
  name: string;
  menuCopy: string;
  homeCopy: string;
  intro: string;
  image: string;
  alt: string;
  caption: string;
  captionProject: string;
  focus: [string, string][];
  related: string[];
  contactType: string;
};

export const services: Service[] = [
  {
    id: 'multifamily', slug: 'multifamily', name: 'Multifamily Communities',
    menuCopy: 'Shared gardens. Everyday connections.',
    homeCopy: 'Landscape design for multifamily communities. Planting, pedestrian routes and shared outdoor spaces, considered together.',
    intro: 'Landscape design for townhome, rowhouse and apartment communities. Front gardens, walks and shared outdoor spaces are planned together, so every entrance connects to the neighbourhood around it.',
    image: media.services.multifamily, alt: 'A planted courtyard framed by residences at Crestmont West', caption: 'Courtyard at Crestmont West', captionProject: 'crestmont-west',
    focus: [
      ['Front gardens and street planting', 'Planting that gives each home a front garden and carries the street edge from door to door.'],
      ['Routes between homes', 'Walks and shared paths that link front entrances, parking and common space.'],
      ['Shared courtyards', 'Gathering, seating and planting within the blocks, where residents spend time outside.'],
      ['Entries and signage', 'Stone, signage and planting that mark the arrival into a community.'],
    ],
    related: ['darcy', 'crestmont-west', 'redstone', 'central', 'arrive-at-darcy-ii', 'wedderburn-22-rowgalows'],
    contactType: 'multifamily',
  },
  {
    id: 'commercial', slug: 'commercial', name: 'Commercial Plazas',
    menuCopy: 'Welcoming landscapes for work and daily life.',
    homeCopy: 'Landscape design for commercial plazas. Planting, seating and pedestrian connections around shops and building entrances.',
    intro: 'Landscape design for commercial plazas and mixed-use frontages. Planting, seating and pedestrian connections help people arrive, pause and move between shops and building entrances.',
    image: media.services.commercial, alt: 'Outdoor seating and landscaped pedestrian areas at Seton Crossing', caption: 'Seton Crossing, Calgary', captionProject: 'seton-crossing',
    focus: [
      ['Plazas and seating', 'Places to sit and wait between errands, shaded and framed by planting.'],
      ['Pedestrian connections', 'Clear walking routes between parking, sidewalks and building entrances.'],
      ['Planted frontages', 'Planting along storefronts and edges that softens hard surfaces.'],
      ['Shade structures', 'Pergolas and site structures coordinated with the architecture.'],
    ],
    related: ['seton-crossing', 'seton-mixed-use', 'rona', 'crestmont-west'],
    contactType: 'commercial',
  },
  {
    id: 'parks', slug: 'play-open-spaces', name: 'Play & Open Spaces',
    menuCopy: 'Room to gather, explore and play.',
    homeCopy: 'Play areas, pathways and green space within the communities we design. Places to walk, play and spend time outside.',
    intro: 'Play areas, pathways and green space within the communities we design. Shared outdoor places sit where residents already pass, with paths, seating and planting around them.',
    image: media.services.parks, alt: 'A play space and planted pedestrian path at Crestmont West', caption: 'Play space detail at Crestmont West', captionProject: 'crestmont-west',
    focus: [
      ['Play areas', 'Play equipment set within gravel courts and planted surroundings.'],
      ['Shelters and seating', 'Covered shelters, pergolas and benches beside the places children play.'],
      ['Paths around green space', 'Curving routes that reach common space from several directions.'],
      ['Defined edges', 'Natural stone and low planting that frame each play space.'],
    ],
    related: ['crestmont-west', 'evanston', 'skyview', 'drake-towns'],
    contactType: 'parks',
  },
];

export const servicePath = (service: Service, base = '/') => `${base}services/${service.slug}`;
