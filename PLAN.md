# Master Todo — Project Plan

A crowd-sourced master todo list for one school class. Static site on GitHub Pages;
all personal data (checked-off state) stays in the visitor's browser.

## Goals & principles

1. **One authoritative list** — every task the class needs to know about, in one place.
2. **Privacy by design** — no accounts, no analytics, no server. Personal state
   (what *you* ticked off) lives in `localStorage` and never leaves the device.
3. **Crowd-sourceable content** — anyone can add items through a Pull Request.
   The shared list itself is public repo data, published via commits to `main`.
4. **Zero-maintenance hosting** — GitHub Pages only. No backend, no database.
5. **Data portability** — one-click export to Todo.txt.

## Architecture

```
repo (main branch)
├── data/*.yaml          ← shared list content (PRs edit these)
├── site/                ← static app served as-is by Pages
│   ├── index.html
│   ├── app.js           ← fetches YAML, renders, handles local state
│   └── vendor/          ← js-yaml, JSZip (committed, no CDN dependency)
└── .github/workflows/
    ├── validate.yml     ← PR check: schema + unique IDs
    └── deploy.yml       ← deploy main → Pages
```

- **No build step for deployment**: the browser fetches `/data/<category>.yaml`
  and parses it with vendored js-yaml. What's in the repo is exactly what runs.
- CI validates contributions; Pages deploys after merge.

## Data model

One YAML file per category, filename = category id (`data/mandatory.yaml`):

```yaml
name: Mandatory
mandatory: true        # items here cannot be hidden
items:
  - id: enroll-by-aug-31     # stable slug, required, unique across all files
    title: Enroll by August 31
    details: |               # optional longer description
      Bring ID and enrollment letter.
    due: 2026-08-31          # optional ISO date
    tags: [admin]            # optional free-form labels
```

Rules:

- Stable `id` per item so local check-off state survives reordering/rewording.
  Local storage key: `mt-done` → `{ "enroll-by-aug-31": true, ... }`.
- `mandatory: true` categories can never be hidden by users.
  Non-mandatory items are individually hideable (eye icon), stored locally
  under `mt-hidden`, plus a global "hide all optional" toggle.
- CI rejects duplicate IDs, missing fields, bad dates, unknown keys.

## Contribution flow

1. Contributor edits or creates a file in `data/` via GitHub web UI ("Add file")
   → PR opens automatically. No local toolchain needed.
2. `validate.yml` runs the schema check on the PR.
3. Merge to `main` → `deploy.yml` publishes to Pages (~1 min).

A `.github/PULL_REQUEST_TEMPLATE.md` and a `CONTRIBUTING.md` with copy-paste
YAML snippets make this as close to filling out a form as possible.

## App features

- Grouped list by category; mandatory first, then alphabetical category order
  (configurable via an index list in `data/index.yaml` if needed).
- Checkbox per item → saved instantly to localStorage.
- Progress summary per category (e.g. "4 / 12 done").
- Hide/show non-mandatory items; hidden items listed under a collapsed
  "hidden" section so nothing is truly lost.
- Due-date badges (overdue / today / soon) computed client-side from item date.
- Search box filters titles/tags.
- "Reset my local data" button.

## Todo.txt export

Client-side export button producing a `.zip` (JSZip) containing:

- `todo.txt` — everything in one file
- `<category>.txt` — one file per category

Line format per item (Todo.txt spec):

```
x 2026-08-22 enroll @school +master-todo due:2026-08-31 Enroll by August 31
```

Mapping: `x <completion-date> ` prefix when done · `(A)`–`(Z)` priority from
`priority:` field (optional future field) · `@<tag>` contexts from `tags` ·
project tag derived from category name · `due:<date>` from `due`.
Completion date comes from the local "done at" timestamp (`mt-done-dates`).

## Tech choices

- Vanilla JS (ES modules), no framework — small surface, no toolchain.
- Vendored libraries: js-yaml (parsing), JSZip (export). No CDN at runtime.
- Validation script: Node.js (`scripts/validate.mjs`) run by CI; also runnable
  locally with plain `node`.

## Milestones

1. **M1 – Skeleton**: repo layout, sample `data/mandatory.yaml`, static page
   that renders fetched YAML, localStorage checkboxes.
2. **M2 – Contributions**: validation workflow, PR template, CONTRIBUTING,
   Pages deploy workflow.
3. **M3 – Polish**: hiding rules, search, due badges, progress counters,
   reset button.
4. **M4 – Export**: Todo.txt + zip download.

## Open questions

- Category ordering: fixed in `index.yaml` vs. filename sort?
- Should completed items be archived visually (collapse to bottom)?
- Do we want per-item `priority` now or defer?
- License for content (CC-BY-SA?) and code (MIT?).
