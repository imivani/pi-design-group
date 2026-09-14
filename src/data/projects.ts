// Local media is sourced from the existing PI Design Group public portfolio.
// Keep source credits and legacy project links intact when adding detail pages.
export type Project = {
  id: string;
  name: string;
  url: string;
  category: 'multifamily' | 'commercial' | 'single-homes';
  type: string;
  location?: string;
  image: string;
  alt: string;
  credit?: string;
  imageKind: 'photograph' | 'rendering' | 'drawing';
};

export const projects: Project[] = [
  {
    "id": "darcy",
    "name": "D’Arcy",
    "url": "https://www.pidesigngroup.ca/darcy",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/darcy.webp",
    "alt": "Landscape and building context at D’Arcy",
    "imageKind": "photograph",
    "location": "Okotoks, Alberta",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "redstone",
    "name": "Redstone",
    "url": "https://www.pidesigngroup.ca/redstone",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/redstone.webp",
    "alt": "Landscape and building context at Redstone",
    "imageKind": "photograph",
    "location": "Calgary, Alberta"
  },
  {
    "id": "seton-crossing",
    "name": "Seton Crossing",
    "url": "https://www.pidesigngroup.ca/seton",
    "category": "commercial",
    "type": "Commercial",
    "image": "/media/projects/seton-crossing.webp",
    "alt": "Landscape and building context at Seton Crossing",
    "imageKind": "photograph",
    "location": "Calgary, Alberta",
    "credit": "Architecture by RTM"
  },
  {
    "id": "crestmont-west",
    "name": "Crestmont West",
    "url": "https://www.pidesigngroup.ca/crestmontwest",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/crestmont-west.webp",
    "alt": "Landscape and building context at Crestmont West",
    "imageKind": "photograph",
    "location": "Calgary, Alberta",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "arbour-lake",
    "name": "Arbour Lake",
    "url": "https://www.pidesigngroup.ca/arbourlake",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/arbour-lake.webp",
    "alt": "Architectural rendering of Arbour Lake",
    "imageKind": "rendering"
  },
  {
    "id": "central",
    "name": "Central (Skyview II)",
    "url": "https://www.pidesigngroup.ca/central",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/central.webp",
    "alt": "Landscape and building context at Central (Skyview II)",
    "imageKind": "photograph",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "crimson-ridge-zen",
    "name": "Crimson Ridge - Zen",
    "url": "https://www.pidesigngroup.ca/crimsonridgezen",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/crimson-ridge-zen.webp",
    "alt": "Architectural rendering of Crimson Ridge - Zen",
    "imageKind": "rendering",
    "credit": "Architecture by Davignon Martin"
  },
  {
    "id": "arrive-at-darcy-ii",
    "name": "Arrive at D’Arcy II",
    "url": "https://www.pidesigngroup.ca/darcy2",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/arrive-at-darcy-ii.webp",
    "alt": "Landscape and building context at Arrive at D’Arcy II",
    "imageKind": "photograph",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "drake-towns",
    "name": "Drake Towns",
    "url": "https://www.pidesigngroup.ca/drake",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/drake-towns.webp",
    "alt": "Landscape and building context at Drake Towns",
    "imageKind": "photograph",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "evanston",
    "name": "Evanston",
    "url": "https://www.pidesigngroup.ca/evanston",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/evanston.webp",
    "alt": "Landscape and building context at Evanston",
    "imageKind": "photograph"
  },
  {
    "id": "journey",
    "name": "Journey",
    "url": "https://www.pidesigngroup.ca/journey",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/journey.webp",
    "alt": "Landscape and building context at Journey",
    "imageKind": "photograph",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "lawrie-park",
    "name": "Lawrie Park",
    "url": "https://www.pidesigngroup.ca/lawriepark",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/lawrie-park.webp",
    "alt": "Architectural rendering of Lawrie Park",
    "imageKind": "rendering",
    "credit": "Architecture by Systemic"
  },
  {
    "id": "rona",
    "name": "Rona Replacement Warehouse",
    "url": "https://www.pidesigngroup.ca/rona",
    "category": "commercial",
    "type": "Commercial",
    "image": "/media/projects/rona.webp",
    "alt": "Landscape plan for Rona Replacement Warehouse",
    "imageKind": "drawing"
  },
  {
    "id": "seton-mixed-use",
    "name": "Seton Mixed Use",
    "url": "https://www.pidesigngroup.ca/setonmixeduse",
    "category": "commercial",
    "type": "Commercial",
    "image": "/media/projects/seton-mixed-use.webp",
    "alt": "Architectural rendering of Seton Mixed Use",
    "imageKind": "rendering",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "sirocco-rowtowns",
    "name": "Sirocco Rowtowns",
    "url": "https://www.pidesigngroup.ca/sirocco",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/sirocco-rowtowns.webp",
    "alt": "Architectural rendering of Sirocco Rowtowns",
    "imageKind": "rendering",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "skyview",
    "name": "Skyview",
    "url": "https://www.pidesigngroup.ca/skyview",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/skyview.webp",
    "alt": "Landscape and building context at Skyview",
    "imageKind": "photograph"
  },
  {
    "id": "mahogany-townhomes",
    "name": "Mahogany Townhomes",
    "url": "https://www.pidesigngroup.ca/summit77-1-1",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/mahogany-townhomes.webp",
    "alt": "Architectural rendering of Mahogany Townhomes",
    "imageKind": "rendering",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "summit-77-apartments",
    "name": "Summit 77 Apartments",
    "url": "https://www.pidesigngroup.ca/summit77apartments",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/summit-77-apartments.webp",
    "alt": "Architectural rendering of Summit 77 Apartments",
    "imageKind": "rendering"
  },
  {
    "id": "summit-77-rowhomes",
    "name": "Summit 77 Rowhomes",
    "url": "https://www.pidesigngroup.ca/summit77rowhomes",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/summit-77-rowhomes.webp",
    "alt": "Architectural rendering of Summit 77 Rowhomes",
    "imageKind": "rendering",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "symon",
    "name": "Symon",
    "url": "https://www.pidesigngroup.ca/symon",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/symon.webp",
    "alt": "Architectural rendering of Symon",
    "imageKind": "rendering",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "thrive-by-partners",
    "name": "Thrive by Partners",
    "url": "https://www.pidesigngroup.ca/thrive",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/thrive-by-partners.webp",
    "alt": "Architectural rendering of Thrive by Partners",
    "imageKind": "rendering",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "wedderburn-22-rowgalows",
    "name": "Wedderburn-22 Rowgalows",
    "url": "https://www.pidesigngroup.ca/wedderburn",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/wedderburn-22-rowgalows.webp",
    "alt": "Landscape and building context at Wedderburn-22 Rowgalows",
    "imageKind": "photograph",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "zen-belmont",
    "name": "Zen Belmont",
    "url": "https://www.pidesigngroup.ca/zenbelmonmt",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/zen-belmont.webp",
    "alt": "Architectural rendering of Zen Belmont",
    "imageKind": "rendering"
  },
  {
    "id": "zen-livingston",
    "name": "Zen Livingston",
    "url": "https://www.pidesigngroup.ca/zenlivingston",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/zen-livingston.webp",
    "alt": "Architectural rendering of Zen Livingston",
    "imageKind": "rendering",
    "credit": "Architecture by Farmor"
  },
  {
    "id": "zen-mahogany",
    "name": "Zen Mahogany",
    "url": "https://www.pidesigngroup.ca/zenmahogany",
    "category": "multifamily",
    "type": "Multifamily",
    "image": "/media/projects/zen-mahogany.webp",
    "alt": "Architectural rendering of Zen Mahogany",
    "imageKind": "rendering",
    "credit": "Architecture by Gravity"
  },
  {
    "id": "single-homes",
    "name": "Single Homes",
    "url": "https://www.pidesigngroup.ca/homes",
    "category": "single-homes",
    "type": "Residential collection",
    "image": "/media/projects/single-homes.webp",
    "alt": "Landscape and building context at Single Homes",
    "imageKind": "photograph"
  },
  {
    "id": "misc-residential",
    "name": "Misc. Residential Single Family",
    "url": "https://www.pidesigngroup.ca/miscresidential",
    "category": "single-homes",
    "type": "Residential collection",
    "image": "/media/projects/misc-residential.webp",
    "alt": "Landscape and building context at Misc. Residential Single Family",
    "imageKind": "photograph"
  }
];

export const media = {
  "heroPoster": "/media/hero-poster.webp",
  "heroVideo": "/media/hero.mp4",
  "services": {
    "multifamily": "/media/service-multifamily.webp",
    "commercial": "/media/service-commercial.webp",
    "parks": "/media/img_2301.webp"
  },
  "featured": "/media/featured-crestmont.webp",
  "detail": "/media/material-detail.webp",
  "why": "/media/why-evening.webp",
  "featuredDetail": "/media/img_2304.webp",
  "pathDetail": "/media/gallery/evanston/6.webp",
  "drawing": "/media/gallery/crestmont-west/3.webp",
  "contact": "/media/gallery/darcy/5.webp"
} as const;

export const projectPath = (project: Project, base = '/') => base + new URL(project.url).pathname.replace(/^\//, '');
