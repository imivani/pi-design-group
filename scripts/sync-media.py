"""Refresh the local PI image library from the retained public-site audit.

Requires Pillow. The optional --video flag requires imageio-ffmpeg.
Production files always come from the actual PI site, never the mockups.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import io
import json
import subprocess
import sys
import urllib.request

from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'public' / 'media'
MEDIA.mkdir(parents=True, exist_ok=True)
AUDIT = json.loads((ROOT / 'design' / 'site-audit.json').read_text(encoding='utf-8-sig'))
PAGES = {p['url'].rstrip('/').split('/')[-1]: p for p in AUDIT['pages']}
BASE = 'https://images.squarespace-cdn.com/content/v1/66b23eada2c9fc0f4959b860/'
HLS = 'https://video.squarespace-cdn.com/content/v1/66b23eada2c9fc0f4959b860/c0296420-4bbf-4142-be95-3cb9027ca001/playlist.m3u8'

# The route is deliberately independent of the stable local id. Several legacy
# Squarespace addresses are unusual, but they are the real project destinations.
ROSTER = [
    ('darcy', 'darcy', 'D’Arcy'),
    ('redstone', 'redstone', 'Redstone'),
    ('seton-crossing', 'seton', 'Seton Crossing'),
    ('crestmont-west', 'crestmontwest', 'Crestmont West'),
    ('arbour-lake', 'arbourlake', 'Arbour Lake'),
    ('central', 'central', 'Central (Skyview II)'),
    ('crimson-ridge-zen', 'crimsonridgezen', 'Crimson Ridge - Zen'),
    ('arrive-at-darcy-ii', 'darcy2', 'Arrive at D’Arcy II'),
    ('drake-towns', 'drake', 'Drake Towns'),
    ('evanston', 'evanston', 'Evanston'),
    ('journey', 'journey', 'Journey'),
    ('lawrie-park', 'lawriepark', 'Lawrie Park'),
    ('rona', 'rona', 'Rona Replacement Warehouse'),
    ('seton-mixed-use', 'setonmixeduse', 'Seton Mixed Use'),
    ('sirocco-rowtowns', 'sirocco', 'Sirocco Rowtowns'),
    ('skyview', 'skyview', 'Skyview'),
    ('mahogany-townhomes', 'summit77-1-1', 'Mahogany Townhomes'),
    ('summit-77-apartments', 'summit77apartments', 'Summit 77 Apartments'),
    ('summit-77-rowhomes', 'summit77rowhomes', 'Summit 77 Rowhomes'),
    ('symon', 'symon', 'Symon'),
    ('thrive-by-partners', 'thrive', 'Thrive by Partners'),
    ('wedderburn-22-rowgalows', 'wedderburn', 'Wedderburn-22 Rowgalows'),
    ('zen-belmont', 'zenbelmonmt', 'Zen Belmont'),
    ('zen-livingston', 'zenlivingston', 'Zen Livingston'),
    ('zen-mahogany', 'zenmahogany', 'Zen Mahogany'),
    ('single-homes', 'homes', 'Single Homes'),
    ('misc-residential', 'miscresidential', 'Misc. Residential Single Family'),
]

def asset(fragment):
    return next(a['src'] for a in AUDIT['assets'] if fragment in a['src'])

SOURCES = {
    'hero-poster': (PAGES['darcy']['cover']['src'], 1920),
    'service-multifamily': (asset('b2759ab6-9bda-487e-9907-9a04a881afce'), 1600),
    'service-commercial': (asset('b7302689-80db-4680-8d63-b776ae065a18'), 1600),
    'service-parks': (asset('64a0f113-e3f2-4620-bc7c-4a9e46a15474'), 1600),
    'featured-crestmont': (asset('48e967b2-715e-442f-883c-ebe6ff82c419'), 1920),
    'material-detail': (asset('4932b6db-15d0-4490-8f33-b157ec628fd8'), 1000),
    'why-evening': (PAGES['evanston']['cover']['src'], 1600),
    'img_2301': (BASE + '18b9434a-a424-4712-a051-5331fd01aef8/IMG_2301.JPG', 1600),
    'img_2304': (BASE + 'c8a05268-5e19-4e7b-b836-e98ecc29afa4/IMG_2304.JPG', 1600),
}
for id, route, name in ROSTER:
    src = PAGES[route]['cover']['src']
    if id == 'seton-crossing':
        src = SOURCES['service-commercial'][0]
    SOURCES[f'projects/{id}'] = (src, 1200)

def optimize(entry):
    name, (url, width) = entry
    target = MEDIA / f'{name}.webp'
    target.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={'User-Agent': 'PI-Design-Asset-Refresh/1.0'})
    with urllib.request.urlopen(request, timeout=60) as response:
        source = response.read()
    with Image.open(io.BytesIO(source)) as original:
        img = ImageOps.exif_transpose(original).convert('RGB')
        original_size = list(img.size)
        img.thumbnail((width, width * 4), Image.Resampling.LANCZOS)
        img.save(target, 'WEBP', quality=86 if width > 1200 else 82, method=6)
        dimensions = list(img.size)
    return {'path': '/media/' + str(target.relative_to(MEDIA)).replace('\\', '/'),
            'source': url, 'originalDimensions': original_size,
            'dimensions': dimensions, 'bytes': target.stat().st_size}

def build_data():
    projects = []
    locations = {'darcy': 'Okotoks, Alberta', 'redstone': 'Calgary, Alberta',
                 'seton-crossing': 'Calgary, Alberta', 'crestmont-west': 'Calgary, Alberta'}
    # These source covers are explicitly visualizations rather than completed-site photography.
    renderings = {'arbour-lake', 'crimson-ridge-zen', 'lawrie-park',
                  'seton-mixed-use', 'sirocco-rowtowns', 'mahogany-townhomes',
                  'summit-77-apartments', 'summit-77-rowhomes', 'symon', 'thrive-by-partners',
                  'zen-belmont', 'zen-livingston', 'zen-mahogany'}
    for id, route, name in ROSTER:
        category = ('commercial' if route in ['rona', 'seton', 'setonmixeduse'] else
                    'single-homes' if route in ['homes', 'miscresidential'] else 'multifamily')
        kind = 'drawing' if id == 'rona' else 'rendering' if id in renderings else 'photograph'
        project = {'id': id, 'name': name, 'url': f'https://www.pidesigngroup.ca/{route}',
                   'category': category, 'type': {'commercial': 'Commercial', 'multifamily': 'Multifamily',
                                                'single-homes': 'Residential collection'}[category],
                   'image': f'/media/projects/{id}.webp',
                   'alt': (f'Landscape plan for {name}' if kind == 'drawing' else
                           f'Architectural rendering of {name}' if kind == 'rendering' else
                           f'Landscape and building context at {name}'),
                   'imageKind': kind}
        if id in locations:
            project['location'] = locations[id]
        credits = [text for text in PAGES[route]['text'] if text.startswith('Architecture by ')]
        if credits:
            project['credit'] = credits[0]
        projects.append(project)
    media = {'heroPoster': '/media/hero-poster.webp', 'heroVideo': '/media/hero.mp4',
             'services': {'multifamily': '/media/service-multifamily.webp',
                          'commercial': '/media/service-commercial.webp', 'parks': '/media/img_2301.webp'},
             'featured': '/media/featured-crestmont.webp', 'detail': '/media/material-detail.webp',
             'why': '/media/why-evening.webp', 'featuredDetail': '/media/img_2304.webp',
             'pathDetail': '/media/gallery/evanston/6.webp', 'drawing': '/media/gallery/crestmont-west/3.webp',
             'contact': '/media/why-evening.webp'}
    header = '''// Local media is sourced from the existing PI Design Group public portfolio.
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

'''
    target = ROOT / 'src' / 'data' / 'projects.ts'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(header + 'export const projects: Project[] = ' + json.dumps(projects, indent=2, ensure_ascii=False) + ';\n\n'
                      + 'export const media = ' + json.dumps(media, indent=2) + ' as const;\n\n'
                      + "export const projectPath = (project: Project, base = '/') => base + new URL(project.url).pathname.replace(/^\\//, '');\n", encoding='utf-8')

def contact_sheet():
    paths = list(SOURCES)
    thumb_w, thumb_h = 320, 205
    sheet = Image.new('RGB', (thumb_w * 4, 240 * ((len(paths) + 3) // 4)), 'white')
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(paths):
        with Image.open(MEDIA / f'{name}.webp') as original:
            thumb = ImageOps.fit(original, (thumb_w - 8, thumb_h), method=Image.Resampling.LANCZOS)
        x, y = (i % 4) * thumb_w, (i // 4) * 240
        sheet.paste(thumb, (x, y))
        draw.text((x + 3, y + thumb_h + 5), name.replace('projects/', ''), fill='black')
    sheet.save(ROOT / 'design' / 'media-audit.jpg', quality=86)

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=6) as pool:
        entries = list(pool.map(optimize, SOURCES.items()))
    manifest = {
        'notes': ['All production portfolio images are sourced from the public PI site.',
                  'Public parks service photograph is a Crestmont landscape detail, not a verified public-park commission.',
                  'No generated mockup photography is used.',
                  'Image dimensions preserve aspect ratio and never upscale the source.'],
        'images': entries, 'videoSource': HLS}
    build_data()
    contact_sheet()
    print(f'Optimized {len(entries)} images: {sum(e["bytes"] for e in entries) / 1048576:.2f} MiB')
    if '--video' in sys.argv:
        import imageio_ffmpeg
        command = [imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-i', HLS, '-an', '-c:v', 'libx264',
                   '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                   str(MEDIA / 'hero.mp4')]
        subprocess.run(command, check=True, capture_output=True)
        print(f'Local hero.mp4: {(MEDIA / "hero.mp4").stat().st_size / 1048576:.2f} MiB')
    if (MEDIA / 'hero.mp4').exists():
        manifest['video'] = {'path': '/media/hero.mp4', 'bytes': (MEDIA / 'hero.mp4').stat().st_size,
                             'dimensions': [1920, 1080], 'durationSeconds': 9.56,
                             'format': 'H.264 MP4, muted, faststart',
                             'note': 'Existing homepage clip. The specific filmed project is unverified.'}
    (ROOT / 'design' / 'media-audit.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
