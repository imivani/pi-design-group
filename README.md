# Pi Design Group

A landscape architecture portfolio with a video homepage and 27 individual project pages. Built with Astro, TypeScript, native CSS and Lucide icons.

## Run locally

Install Node.js 24 LTS and Git, then run:

```sh
git clone https://github.com/imivani/pi-design-group.git
cd pi-design-group
npm ci
npm run dev
```

Open **http://127.0.0.1:4321/**. The repository is private, so cloning requires an account with access.

On Windows, after installing dependencies, **Open PI Design.vbs** starts the preview quietly and opens it in your browser. **Start-Website.ps1 -NoBrowser** starts it without opening a browser window.

## Included

- The original Pi video hero, real project photography and continuous page framing.
- Photographic Projects and Services menus, including all 27 projects and mobile navigation.
- Three expanding service photographs: Multifamily Communities, Commercial Plazas and Public Parks.
- Three interactive Crestmont West views with matching photographs and text.
- Design in the Details: built photographs connected to their real landscape drawings, with a drawing viewer and zoom.
- A complete searchable project archive with category filters and Grid/Index views.
- Local project pages with varied galleries, drawings, project information and next-project navigation.
- Full-screen image viewers, keyboard controls, touch interaction and Reduced/Off motion settings.
- Working email and telephone links, automated browser checks and asset source records.

All website photographs, drawings and video needed for the build are included in **public/**. Generated concepts in **design/references/** are design references only and are not shown as completed Pi work. Unknown project facts are omitted.

## Build and check

```sh
npm run check
npm run build
npm run preview
```

The build creates 28 static pages in **dist/**. The preview command prints its local address. No environment variables or external API credentials are required for the default build.

Browser tests use installed Google Chrome. Keep the development server running on port 4321 in another terminal, then run:

```sh
npm test
```

To verify the completed static build, including all 27 project destinations and the interactive menus/viewers:

```sh
node scripts/verify-build.mjs
```

For hosting under a subfolder, set **SITE_BASE** to the intended path before building. PowerShell example:

```powershell
$env:SITE_BASE='/pi-preview/'
npm run build
node scripts/verify-build.mjs /pi-preview/
Remove-Item Env:SITE_BASE
```

Rebuild without SITE_BASE for a site hosted at the domain root. Publishing this repository does not deploy the website. The pages retain their local-review **noindex** setting; review that before a public website launch.

## Project guide

- **src/data/projects.ts** supplies the project archive and verified credits.
- **src/data/project-details.ts** supplies reviewed project-page content and image selections.
- **design/BUILD_NOTES.md** documents the current implementation and motion.
- **design/PREMIUM_AUDIT.md** records the latest presentation audit: 59 browser checks passed.
- **design/NEXT_PAGES.md** contains the plan for remaining company, service and contact pages.
- **DESIGN.md**, **MOTION.md** and **CODEX_START.md** preserve the visual direction and development guidance.

Dependencies, generated builds, temporary logs, raw downloaded HTML and generated review captures remain outside Git. Review screenshots and recordings can be recreated with the scripts in **scripts/** while the local preview is running. The media refresh scripts are optional maintenance tools; they are not required to build the included site.

The source and included imagery are provided for this project. No open-source license is granted by this repository.
