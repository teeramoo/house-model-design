# House Model Design

Interactive Supharat house and site designer built with React, Three.js and Vite.

## Run locally

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. `npm run build` produces the static site in `dist/`. `npm test` runs the application and geometry tests.

## Features

- 3D house exploration and walkthrough, with floor cutaways and GLB export.
- Wall painting and decorative moulding by wall, room, floor or whole house.
- Adjustable estimated land boundary (initially 400 m² / 100 square wah).
- Private design copies with saved undo/redo history.
- Furniture catalog, placement controls and manager-only shared GLB uploads.
- Empty building proposals with rectangle, L-shaped or custom footprints, dimensions, floors and roof options.

## Authentication and deployment

See [AUTH-SETUP.md](AUTH-SETUP.md) for Google OAuth, Supabase migrations, private design policies and furniture library roles. No live credentials are included. Copy `.env.example` to `.env.local` and supply your own public Supabase settings. Never put server secrets in Vite variables.

For Cloudflare Pages, use build command `npm run build` and output directory `dist`. Set the two public Vite variables before building. Account saves and shared uploads require the configured backend; basic local editing works without it.

## Model limits

The house and embedded reference drawings are included in this public source. Geometry is interpreted from the supplied plans and is an architectural visualization, not verified construction or BIM documentation. Land dimensions are estimated. Building proposals are empty shells without openings, stairs or collision checks. Furniture uses numeric placement without snapping. Save named designs to retain their history across sessions.

SQL test fixtures are for disposable local databases only; never run them in the hosted Supabase project.

## Live GitHub Pages deployment

The site deploys from `main` using `.github/workflows/pages.yml`. Tests run before each build and deployment. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as GitHub repository Actions variables, then rerun the workflow to enable the backend. Add `https://teeramoo.github.io/house-model-design/` to Supabase's allowed redirect URLs. Never store Google client secrets or service-role keys as frontend variables.
