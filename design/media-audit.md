# PI Design Group production media

The landing page uses 34 images from the existing public PI Design Group website and its original homepage video. Generated design previews are not used as portfolio photographs.

- The 27 project and collection entries retain their existing project addresses. Summit 77 Apartments points to its own `/summit77apartments` page; `/projects` is not used because it redirects to Redstone.
- Project images are WebP files up to 1200 pixels wide. Section photographs are up to 1600 pixels wide, with the hero poster and featured image up to 1920 pixels wide. Small originals are never enlarged.
- The video is a local, silent H.264 MP4 with a 9.56-second duration and 1920 × 1080 dimensions. The exact filmed project is unverified. Caption the video generally; the D’Arcy poster is separately verified.
- The public-parks service photograph shows a landscaped path at Crestmont West. It illustrates outdoor-space design and must not be presented as proof of a public-park commission.
- The evening photograph is from Evanston. The featured photograph and stone-detail photograph are from Crestmont West.
- The multifamily service photograph uses Crestmont West's `IMG_2315.JPG`: a planted courtyard framed by residences, selected over the street-facing `IMG_2312.JPG` to emphasize planting and shared outdoor space.
- Portfolio data distinguishes photographs, architectural renderings and the Rona landscape drawing. Existing architecture credits are preserved in the shared data.
- Only D’Arcy, Redstone, Seton Crossing and Crestmont West currently display locations. Conflicting or ambiguous location copy elsewhere on the original site is deliberately omitted.

`media-audit.json` records every source URL, output size and dimensions. `media-audit.jpg` provides a visual contact sheet. Run `python scripts/sync-media.py --video` to refresh this library from the retained site audit; Pillow and imageio-ffmpeg are required.
