import { renderingCredit } from './image-credit';
import rawGalleries from './galleries.json';
import additionalGalleries from './additional-galleries.json';
import type { Project } from './projects';

export type ProjectImage = { src: string; width: number; height: number; source: string; medium: 'photograph' | 'rendering' | 'drawing'; caption: string; attribution?: string };
export type ProjectEditorial = {
  openingNote?: string;
  introduction?: string;
  overallIndex?: number;
  pairIndices?: number[];
  quietIndex?: number;
  closingIndex?: number;
  detail?: { drawingIndex: number; photoIndex?: number; title: string; copy: string };
};
// Image numbers refer to the archived source order. Visually reviewed against
// design/review/gallery-audit-*.png; logo images and duplicate views are omitted.
const selections: Record<string, number[]> = {
  'darcy':[1,5,6,7,8,3], 'redstone':[1,5,6,7,8,2,3],
  'seton-crossing':[2,5,6,8,1,3], 'crestmont-west':[1,2,5,7,8,4,3],
  'arbour-lake':[1,2,4,5,3], 'central':[1,2,5,6,7,3],
  'crimson-ridge-zen':[1,3], 'arrive-at-darcy-ii':[1,4,5,6,7,3],
  'evanston':[1,2,4,5,6,7,8,3], 'drake-towns':[1,4,5,6,7,8,3],
  'journey':[1,2,4,5,6,7,3], 'lawrie-park':[1,4,5,3],
  'rona':[1,2,3], 'seton-mixed-use':[1,4,5,3], 'sirocco-rowtowns':[1,3],
  'skyview':[1,2,5,6,7,8,3], 'summit-77-apartments':[1,4,3],
  'mahogany-townhomes':[1,2,4,3], 'summit-77-rowhomes':[1,4,5,6,7,3],
  'symon':[1,2,7,8,3,5,6], 'wedderburn-22-rowgalows':[1,4,3],
  'thrive-by-partners':[1,4,3], 'zen-livingston':[1,3],
  'zen-belmont':[1,4,5,3], 'zen-mahogany':[1,2,3],
  'misc-residential':[1,2,4,5,6,7,8,3], 'single-homes':[1,2,4,6,7,8],
};
const overrides: Record<string, Partial<Record<number, ProjectImage['medium']>>> = {
  'seton-crossing':{1:'rendering'}, 'arbour-lake':{4:'photograph',5:'photograph'},
  'drake-towns':{7:'rendering'}, 'mahogany-townhomes':{2:'photograph',4:'photograph'},
  'summit-77-rowhomes':{4:'photograph'}, 'symon':{5:'drawing',6:'drawing',7:'photograph',8:'photograph'},
  'single-homes':{4:'drawing',6:'drawing',7:'drawing',8:'drawing'},
};
const captions: Record<string, Record<number,string>> = {
  'crestmont-west':{1:'Homes and planted frontage at Crestmont West.',2:'A shared path, timber seating and stone edging between the homes.',3:'Overall landscape plan: front entrances, common green space and play areas.',4:'Natural stone separates the planted bed from the gravel play surface.',5:'A curving path through trees, planting and shared outdoor space.',7:'The play area between the homes and commercial frontage.',8:'Trees, grasses and flowering plants along the commercial frontage.'},
  'seton-crossing':{1:'Architectural rendering of the commercial plaza.',2:'Seating and pedestrian space beneath the plaza pergola.',3:'Overall landscape plan: planted perimeter, pedestrian routes and gathering space.',5:'Planting and a pergola at the pedestrian entrance.',6:'Trees and shrubs between the building and the public sidewalk.',8:'The gathering space, viewed from the planted street edge.'},
  'darcy':{1:'Front gardens and homes along the street at D’Arcy.',3:'Landscape plan showing front gardens and planting along the residential streets.',5:'Individual front entrances meet the shared sidewalk.',6:'Trees rise above grasses and low planting along the curb.',7:'Layered planting beside the sidewalk at D’Arcy.',8:'A pedestrian route between front gardens and the street.'},
  'evanston':{1:'The shared play area and shelter within Evanston’s residential setting.',2:'Curving paths around the play area and covered shelter.',3:'Overall landscape plan, with central common space and planting schedules.',4:'The planted approach from the homes to the shared outdoor space.',5:'The shelter opens toward the play area and surrounding homes.',6:'A pedestrian route between individual front entrances.',7:'A gently curving path through the residential landscape.',8:'Homes, front gardens and street trees at Evanston.'},
  'rona':{1:'Existing and proposed landscape areas.',2:'Site layout and perimeter planting.',3:'Planting schedule and landscape details.'},
  'redstone':{1:'Stone entry signage and planting at Redstone.',2:'The residential street and front entrances.',3:'Landscape plan and planting schedules for Redstone.',5:'Trees and planting beside the walkway to the homes.',6:'A curving route through the shared green space.',7:'The gravel play area, bordered by the pedestrian path.',8:'Open lawn and planted edges between the homes.'},
  'central':{1:'The pedestrian path between the rows of homes.',2:'Front entrances, sidewalk and planted strips along the street.',3:'Overall landscape plan for Central.',5:'Trees and planting beside the residential street.',6:'A path bends through the planted entrance space.',7:'Planting separates the walkway from adjacent parking.'},
  'arrive-at-darcy-ii':{1:'Front gardens along the row of homes.',3:'Landscape plan and planting information for Arrive at D’Arcy II.',4:'Planting along the front of the homes.',5:'Front gardens, sidewalks and the residential street.',6:'The entrance steps and planted frontage.',7:'Planting below the covered front entrances.'},
  'arbour-lake':{1:'Architectural rendering of the homes and street frontage.',2:'Architectural rendering of the front entrances.',3:'Landscape site plan for Arbour Lake.',4:'The built frontage and entrance walkway.',5:'An aerial photograph during construction.'},
  'crimson-ridge-zen':{1:'Architectural rendering of the residential frontage.',3:'Landscape plan for Crimson Ridge Zen.'},
  'drake-towns':{1:'Homes, timber structures and the pedestrian approach.',3:'Landscape plan for Drake Towns.',4:'Play equipment within the gravel courtyard.',5:'A timber structure beside the courtyard path.',6:'Planting and the walkway along the building.',7:'Architectural rendering of the residential frontage.',8:'An aerial view of the homes and surrounding streets.'},
  'journey':{1:'The planted street edge and residential frontage.',2:'A sidewalk beside rock beds and planting.',3:'Landscape plan and planting information for Journey.',4:'Rock beds and trees along the street.',5:'A front entrance reached across the planted rock bed.',6:'The residential frontage and street-side path.',7:'Rock mulch, low planting and a front entrance.'},
  'lawrie-park':{1:'Architectural rendering of the buildings and shared outdoor space.',3:'Landscape plan for Lawrie Park.',4:'Architectural rendering across the central green space.',5:'Architectural rendering of the street frontage.'},
  'seton-mixed-use':{1:'Architectural rendering of the corner building and street.',3:'Landscape plan for the mixed-use site.',4:'Architectural rendering from the adjoining street.',5:'Architectural rendering of the building entrance and planted edge.'},
  'sirocco-rowtowns':{1:'Architectural rendering of the homes at dusk.',3:'Landscape plan for Sirocco Rowtowns.'},
  'skyview':{1:'The pedestrian entrance beneath the pergola.',2:'Curved seating edges around the shared courtyard.',3:'Landscape plan for Skyview.',5:'A path and lawn between the rows of homes.',6:'Planting enclosed by the curved courtyard edges.',7:'A pergola marks the entrance from the street.',8:'Homes, planting and the shared outdoor space.'},
  'summit-77-apartments':{1:'Architectural rendering of the apartments and shared landscape.',3:'Landscape site plan for Summit 77 Apartments.',4:'Architectural rendering across the central outdoor space.'},
  'mahogany-townhomes':{1:'Architectural rendering of the pedestrian space between the homes.',2:'An aerial photograph of the homes during construction.',3:'Landscape site plan for Mahogany Townhomes.',4:'The residential frontage during construction.'},
  'summit-77-rowhomes':{1:'Architectural rendering of the residential frontage.',3:'Landscape site plan for Summit 77 Rowhomes.',4:'A photograph of the homes and site during construction.',5:'Architectural rendering of the gardens between the buildings.',6:'Architectural rendering of the homes and planted frontage.',7:'Architectural rendering from the street.'},
  'symon':{1:'Architectural rendering of the homes and street planting.',2:'Architectural rendering of the front entrances.',3:'Overall landscape plan for Symon.',5:'Landscape plan shown in perspective.',6:'Landscape drawing and planting information.',7:'An aerial photograph of the homes.',8:'A photograph along the central path between the homes.'},
  'wedderburn-22-rowgalows':{1:'Front gardens along the row of homes.',3:'Landscape plan and planting information for Wedderburn 22 Rowgalows.',4:'An entrance beneath the porch canopy.'},
  'thrive-by-partners':{1:'Architectural rendering of the residential street at dusk.',3:'Landscape site plan for Thrive by Partners.',4:'Architectural rendering of the corner building and planted frontage.'},
  'zen-livingston':{1:'Architectural rendering of the homes and front gardens.',3:'Landscape site plan for Zen Livingston.'},
  'zen-belmont':{1:'Architectural rendering of the homes around the internal street.',3:'Landscape site plan for Zen Belmont.',4:'Architectural rendering of the street frontage.',5:'Architectural rendering of the corner homes.'},
  'zen-mahogany':{1:'Architectural rendering of the homes and internal street.',2:'Architectural rendering of the pedestrian and vehicle areas.',3:'Landscape site plan for Zen Mahogany.'},
  'misc-residential':{1:'A row of homes from the residential collection.',2:'A corner home and its street frontage.',3:'Landscape drawing from the residential collection.',4:'Homes at the corner of two residential streets.',5:'A home, driveway and front entrance.',6:'The street frontage of an individual home.',7:'Front entrances and sidewalks along the street.',8:'A wider street view from the residential collection.'},
  'single-homes':{1:'Homes at a residential street corner.',2:'A corner home and its street frontage.',4:'Landscape elevations and planting information from the collection.',6:'Landscape site plan from an individual home project.',7:'Landscape plan for a corner site.',8:'Landscape layout and details from the home collection.'},
};
const descriptions: Record<string,string> = {
  'crestmont-west':'At Crestmont West, shared paths weave between the homes and outdoor play spaces. Timber seating, natural stone edges and layers of planting bring detail to the spaces residents pass through every day.',
  'darcy':'Front gardens, planted verges and a continuous sidewalk shape the street at D’Arcy. The landscape connects individual entrances with the wider residential setting.',
  'seton-crossing':'A sheltered gathering area sits within the commercial plaza. Trees, planted edges and pedestrian routes connect the seating spaces with shops and the surrounding sidewalk.',
  'evanston':'Shared paths connect front entrances, planted spaces and a covered gathering place. The photographs follow these connections through Evanston’s residential landscape.',
  'rona':'Landscape drawings bring together site layout, existing and proposed planted areas, plant schedules and construction details.',
};

// Editorial indexes are zero-based positions in the curated gallery returned
// below, not the one-based source image numbers used by selections/captions.
// Keep each image in one page position; the viewer preserves the stable order.
const editorial: Record<string, ProjectEditorial> = {
  'homestead-townhomes': { openingNote: 'Front gardens and individual entrances along a residential street.', introduction: 'The landscape at Homestead Townhomes brings lawn, planting beds and entrance paths together along the street.' },
  'pickel-residence': { openingNote: 'A paved outdoor room with a contrasting stone border.', introduction: 'Large paving slabs and darker border stones define a compact patio enclosed by timber fencing.' },
  'ryan-residence': { openingNote: 'A garden arranged around lawn, planting and a paved terrace.', introduction: 'Stepping stones connect the lawn to the terrace, with planting along the timber-fenced boundary.' },
  'crestmont-west': {
    openingNote: 'Landscape design linking homes, shared play space and the commercial frontage.',
    introduction: 'The site plan brings individual front entrances, common green space and a small commercial cluster into one connected layout. Within the residential areas, paths bend around planting and open into places to sit and play. Stone edging separates the gravel play surface from planted beds; closer to the shops, grasses and trees form a continuous edge along the sidewalk.',
    overallIndex: 1,
    pairIndices: [2,3],
    closingIndex: 4,
    detail: {
      drawingIndex: 6,
      photoIndex: 5,
      title: 'Shared space, from plan to ground',
      copy: 'The overall plan places paths, planting and play areas between the homes and commercial frontage. At ground level, a low stone edge separates the planted bed from the gravel play space. The drawing describes the wider arrangement; the photograph brings one of its shared spaces into view.',
    },
  },
  'evanston': {
    openingNote: 'Shared outdoor space and pedestrian connections between the homes.',
    introduction: 'A central play area and covered shelter sit within the residential blocks. Paths curve around this common space, then continue toward the homes as smaller walks between front gardens. The landscape plan shows how the shared area sits within the wider network of entrances, streets and planting. The photographs move from this overall arrangement to the paths and shelter at ground level.',
    overallIndex: 1,
    pairIndices: [2,4],
    quietIndex: 5,
    closingIndex: 6,
    detail: {
      drawingIndex: 7,
      photoIndex: 3,
      title: 'A common space at the centre',
      copy: 'The plan locates the shared outdoor area among the residential blocks, with paths reaching it from several directions. Beneath the shelter, the photograph shows its relationship to the play equipment, surrounding planting and nearby homes.',
    },
  },
  'darcy': {
    openingNote: 'Front gardens and street planting connect individual homes to the neighbourhood.',
    introduction: 'The landscape is experienced along the street: through the front gardens, beside the curb and on the walk to each entrance. Taller grasses and trees rise above lower planting, while short paths cross these planted edges to reach the homes. The site plan records the repeated garden plots and pedestrian routes that give the residential frontage its continuity.',
    overallIndex: 1,
    quietIndex: 2,
    closingIndex: 4,
    detail: {
      drawingIndex: 5,
      photoIndex: 3,
      title: 'The planted street edge',
      copy: 'The landscape plan sets out garden plots and planting along the rows of homes. The street photograph shows this repeated edge at ground level, with trees, tall grasses and lower planting beside the sidewalk.',
    },
  },
  'seton-crossing': {
    openingNote: 'A planted pedestrian setting for shops, seating and everyday visits.',
    introduction: 'At the plaza entrance, a pergola, benches and trees form a gathering space beside the shops. Curving pedestrian routes connect this space with the public sidewalk. Beyond the entrance, planted strips continue around the buildings. The overall plan shows these smaller pedestrian areas within the larger arrangement of shops, parking and street edges.',
    pairIndices: [1,4],
    closingIndex: 3,
    detail: {
      drawingIndex: 5,
      photoIndex: 2,
      title: 'A continuous planted perimeter',
      copy: 'The plan carries planting around the commercial buildings and along the site boundary. The photograph shows one of these edges: trees and shrubs between the building and the public sidewalk, with a strip of lawn alongside the route.',
    },
  },
};

export function projectDetails(project: Project) {
  const source = (rawGalleries as Record<string, Array<Omit<ProjectImage,'medium'> & {medium:string}>>)[project.id];
  const gallery = (selections[project.id] || []).map(number => {
    const item = source[number - 1];
    const medium = overrides[project.id]?.[number] || (number === 3 || project.id === 'rona' ? 'drawing' : project.imageKind);
    return { ...item, medium, attribution: medium === 'rendering' ? renderingCredit(project) : undefined, caption: captions[project.id]?.[number] || (medium === 'drawing' ? `${project.name}. Landscape drawing.` : medium === 'rendering' ? `${project.name}. Architectural rendering.` : `${project.name}. ${project.type === 'Residential collection' ? 'Residential view' : 'Landscape and building context'}.`) } as ProjectImage;
  });
  const additional = (additionalGalleries as Record<string, ProjectImage[]>)[project.id] || [];
  gallery.push(...additional.map(image => ({ ...image, attribution: image.medium === 'rendering' ? renderingCredit(project) : undefined })));
  const collection = project.type === 'Residential collection';
  return { gallery, collection, editorial: editorial[project.id], description: descriptions[project.id] || (collection ? 'A collection of residential work, with photographs and drawings from individual home projects.' : undefined) };
}
