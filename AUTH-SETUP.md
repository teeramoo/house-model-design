# Google sign-in and private interior designs

Implementation is ready. Live Google authentication and cloud saving require your own Supabase project and Google OAuth configuration. No project credentials are included in the downloadable build.

## Free services

Keep the static app on Cloudflare Pages Free and create a Supabase Free project for authentication and Postgres. Supabase's free plan has usage limits and can pause inactive projects; this app does not provision paid features. Review current limits at https://supabase.com/pricing.

## 1. Create Supabase and the private-design table

Create a dedicated Free project at https://supabase.com/dashboard. Keep the database password private.

In its SQL editor, run `supabase/migrations/202609080001_private_designs.sql` once, then run `supabase/migrations/202609090001_editable_copies.sql`. They create `interior_designs`, an owner/date index, and row-level security. Authenticated users can read, create and update only their own designs. Anonymous users have no table access. Clients cannot change ownership or delete designs. Updates require the expected revision, preventing stale saves from overwriting a newer copy. Do not run the files under tests in your real project.

## 2. Configure Google OAuth

In Google Cloud / Google Auth Platform, create a project and a Web application OAuth client. Configure the consent screen and basic openid, email and profile scopes only. Add family members as test users if using Google's Testing audience. If you later publish the OAuth app, review its audience and verification requirements.

Add your app's exact origin under Authorized JavaScript origins: your actual HTTPS pages.dev origin, plus http://127.0.0.1:5176 for local development if Google accepts that loopback origin (otherwise use http://localhost:5176 consistently).

Add the callback URI shown by Supabase's Google provider settings under Google's Authorized redirect URIs. It normally has the form:

`https://YOUR_PROJECT.supabase.co/auth/v1/callback`

Enable the Google provider in Supabase Authentication and enter the Google Client ID and Client Secret there. The Google secret must stay in Supabase's provider configuration. Do not put it in source code, Vite variables or chat.

## 3. Configure app redirects

In Supabase Authentication > URL Configuration, set Site URL to your deployed HTTPS site. Allow these exact app return URLs as applicable:

- `https://YOUR_SITE.pages.dev/`
- `https://YOUR_SITE.pages.dev/Supharat-Designer.html` if serving that standalone filename
- `http://127.0.0.1:5176/`
- `http://127.0.0.1:5176/Supharat-Designer.html`

Use the actual host and path. Avoid broad wildcard production redirects. The app returns to the current origin/path, strips no saved designs, and uses the Supabase SDK's PKCE session handling. Start and finish login in the same browser. Google OAuth does not work from a file:// HTML launch.

## 4. Configure and build the frontend

Copy `.env.example` to `.env.local` and replace both placeholders with the project's URL and **publishable** key from its Connect/API settings:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

These are public browser settings. Never use a service-role or secret API key. This implementation expects the current `sb_publishable_` key format.

Run `npm ci`, then `npm run build`. Cloudflare Git-based deployments need these same two build-time variables. For Direct Upload, build locally with the variables and upload dist; changing Cloudflare variables after uploading a ZIP does not change that ZIP. Preserve the _headers and _redirects from the deployment package.

The current supplied deployment ZIP intentionally shows “not connected yet” until rebuilt with the real settings. The workspace packaging helper can recreate the standalone HTML and ZIP after configuration.

## Family workflow

Open My designs > Continue with Google. Choose Duplicate baseline house, give it a name, then Save private copy. Edit it with the existing design controls and choose Save changes to update that same copy. Duplicate current design starts an independent variation. The original house remains unchanged.

Undo, Redo and the Edit history list restore whole-design states across paint, moulding, land and furniture visibility. Up to 50 changes (also bounded by storage size) are retained. Saving includes the history and current position, including redo steps. Editing after undo discards the redo branch. Reopen a saved copy on another device to continue. Unsaved history is session-only; save before refreshing or leaving. Browser finish/land drafts still autosave, but are not a substitute for saving the named copy.

Opening a snapshot replaces the current draft after validating the entire document. Restore previous draft reverses the most recent open during that session. Signing out switches back to the guest browser draft and clears the displayed cloud list and restore buffer. Browser drafts remain cached under account-specific keys on that device. Signed-in users do not automatically inherit the guest's draft; existing JSON color/moulding backups can be loaded into the signed-in workspace and then saved to the cloud.

Cloud snapshots contain wall colors, moulding parameters, land dimensions and position, furniture visibility and a house model version. They do not upload the PDF, meshes or full GLB. This feature protects saved personal designs, not the static house geometry or reference drawings included in the public app. Future model changes may require migrating incompatible snapshot wall IDs; invalid or mismatched snapshots are rejected before changing the current draft.

## Verification

Local application tests cover per-account browser draft isolation, sign-out restoring guest state, save/open/restore, invalid-load rejection before mutation and stale requests being discarded after an account switch. An isolated real PostgreSQL test checked two-user isolation, direct-ID access, forged ownership, guest denial, editable copies and stale revision protection and malformed input.

Before inviting the family, test live Google sign-in and callback on the deployed URL, save and reopen on a second device, then sign in as a second Google account and confirm its list is separate. Live Google sign-in and hosted RLS validation remain pending until the project is configured. There is no fake or bypass login in the app.

## Run local tests

`npm test` runs application storage/snapshot tests with a fake backend, without contacting Supabase. The SQL tests require a fresh disposable PostgreSQL database: run tests/rls-fixture.sql, both migrations in date order, then tests/rls.sql using psql with ON_ERROR_STOP=1. The fixture creates mock auth users and roles; never run it in the real Supabase project.

## Official references

- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/redirect-urls
- https://developers.cloudflare.com/pages/get-started/direct-upload/

## Shared furniture library

Run `supabase/migrations/202609090002_furniture_library.sql` after the two design migrations. It creates the shared catalog, a private `furniture-assets` storage bucket (10 MB per file), and manager permissions. The bucket uses [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control).

After the owner signs in once, find their user UUID in Supabase Authentication > Users. In the SQL editor, designate that account as a library manager:

```sql
insert into public.furniture_managers(user_id) values ('REPLACE_WITH_OWNER_USER_UUID');
```

Only use the intended owner's UUID. Users cannot grant themselves this role. Refresh the app after assigning it. Open Furniture > Add an asset to the shared library, enter a name/category and upload a self-contained GLB 2.0 (metres, embedded textures, under 10 MB). Published models are immutable so saved designs retain stable asset references. All signed-in family accounts can browse and place shared assets; only managers can publish. Uploads use the existing free project storage allowance.

Four procedural starter assets—chair, sofa, table and bed—work without cloud setup. Search by name/category, choose a room, then Add. Position X/Z, floor, rotation and uniform scale can be changed; number edits apply on blur or Enter. Up to 100 placements per design. Close the panel to inspect the 3D scene. Placement is numeric, without drag handles, collision prevention or wall snapping. Original illustrative furniture remains a separate display toggle. Save the private design to retain placements and undo history across sessions. Missing uploaded assets retain their placement data and show an error; reconnect and reopen the design to retry. Export waits for asset loading and refuses an incomplete export.

`npm test` covers placement validation, real starter geometry/GLB parsing, upload orchestration with a mock backend, save/load and undo, and account isolation. `tests/furniture-rls.sql` validates permissions using mock Storage tables in a disposable PostgreSQL database after the original auth fixture and two design migrations; never run test fixtures in Supabase. Hosted Google login and actual Storage upload/download remain to be checked after configuration.
