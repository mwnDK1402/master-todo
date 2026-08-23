# Master Todo — Project Plan

A crowd-sourced master todo list for one school class. Static site on GitHub Pages;
all personal data (checked-off state) stays in the visitor's browser.

## Goals & principles

1. **One authoritative list** — every task the class needs to know about, in one place.
2. **Privacy by design** — no accounts, no analytics, no server. Personal state
   (what *you* ticked off) lives in `localStorage` and never leaves the device.
3. **Crowd-sourceable content** — anyone can add items through a Pull Request.
   The shared list itself is public repo data, published via commits to `main`.
4. **Zero-maintenance hosting** — GitHub Pages only. No backend, no database,
   no build step.
5. **Data portability** — one-click export to Todo.txt.

## Architecture

Everything lives at the repo root so "deploy from branch" works with zero config:

```
repo (main branch)
├── index.html            ← shell page served by Pages
├── style.css             ← small, local; render-blocking = no unstyled flash
├── render.js             ← ES module: fetches YAML, renders, handles local state
├── todo.yaml             ← THE shared list content (PRs edit this one file)
├── vendor/               ← js-yaml 4.1.0 (done), later JSZip — committed, no CDN
└── .github/workflows/
    ├── validate.yml      ← PR check: schema + unique item ids
    └── deploy.yml        ← deploy main → Pages
```

### Loading strategy (anti-flicker)

The page is client-rendered from YAML, which normally costs an extra round trip.
To make that gap invisible:

1. An inline script in `<head>` starts `fetch("todo.yaml")` immediately, storing
   the promise in `window.yamlReady` — it races the stylesheet download.
2. `style.css` is render-blocking, so first paint is always styled (no FOUC);
   the shell (`<h1>` etc.) looks complete on its own.
3. Deferred scripts run after parsing, in order: `vendor/js-yaml.min.js`, then
   `render.js` (module), which awaits `window.yamlReady` and renders only when
   data exists. A bad YAML file must produce a visible error message in the
   page, never a silent blank screen.

## Data model

One file, `todo.yaml`. Category display order = document order — no manifest,
no `order` field needed.

```yaml
categories:
  - name: Mandatory
    mandatory: true        # boolean! js-yaml does NOT parse bare `yes`
    items:
      - id: apply-su       # stable slug, required, unique across the file
        title: Søg SU
        details: |         # optional longer description
          https://www.su.dk/
        due: 2026-08-31    # optional; parsed as a Date object — display via
        tags: [admin]      #   toLocaleDateString("sv") = YYYY-MM-DD local date
```

Rules:

- Stable `id` per item so local check-off state survives reordering/rewording.
- Booleans are written `true`/`false`; dates are ISO `YYYY-MM-DD`.
- `mandatory: true` categories can never be hidden by users. Non-mandatory
  items are individually hideable, stored locally under `mt-hidden`.
- CI rejects duplicate IDs, missing fields, bad dates, unknown keys.
- If the file ever grows uncomfortably large for contributors, splitting into
  per-category files is a mechanical follow-up — decided against until real
  data shows a problem.

## HTML structure

Per category (built with `createElement`; text nodes are auto-escaped):

```html
<section class="category">
  <h2>Mandatory</h2>
  <p class="progress">1 / 12 færdige</p>
  <ul role="list">                     <!-- semantics kept, bullets hidden -->
    <li class="item">                  <!-- CSS grid: checkbox | content -->
      <input type="checkbox" data-id="apply-su">
      <details>                        <!-- only when the item has details -->
        <summary>
          <span class="title">Søg SU</span>
          <time>før 2026-09-30</time>
        </summary>
        <p class="body">
          <a href="https://www.su.dk/" target="_blank" rel="noopener">
            https://www.su.dk/
          </a>
        </p>
      </details>
    </li>
    <li class="item">
      <input type="checkbox" data-id="activate-email">
      <div>                            <!-- keeps both grid columns filled -->
        <span class="title">Aktivér EK-mail</span>
      </div>
    </li>
  </ul>
</section>
```

- `<ul>` conveys "list of N items" to assistive tech; `role="list"` restores
  announcement after CSS hides markers (`list-style: none; padding: 0`).
- Each row is a two-column grid (`auto 1fr`): checkbox on the left, content on
  the right. The checkbox toggles only when clicked directly.
- Items *with* details use a native `<details>`: clicking the title expands or
  collapses it. Detail-less items get a plain `<div>` wrapper instead, so every
  row has exactly two grid children.
- Bare `http(s)://` URLs inside details become real links (`target="_blank"`,
  `rel="noopener"`); the linkify regex only matches an explicit scheme, so a
  crafted `javascript:` URL can never become an `href`.
- UI text is Danish.

## Contribution flow

1. Contributor appends/edits items in `todo.yaml` via GitHub web UI ("Edit
   file") → PR opens automatically. Additions are a few contiguous YAML lines;
   the owner merges. Validation CI catches mistakes pre-merge.
2. Merge to `main` → Pages republishes (~1 min).

A `.github/PULL_REQUEST_TEMPLATE.md` and `CONTRIBUTING.md` with copy-paste
snippets make this close to filling out a form. Until those land, `README.md`
carries the contributor-facing instructions.

### Overdue-item cleanup policy

A scheduled workflow *opens a PR* proposing deletion of long-overdue items;
it never pushes deletions automatically. Rationale: past-due ≠ dead (recurring
tasks), mid-PR rebases confuse newcomers, and review costs one click.

## App features

- Grouped list by category in document order.
- Checkbox per item → saved instantly to localStorage under `done`
  (item id → completion date, `YYYY-MM-DD` local time) — reused by export.
- Collapsible per-item details with auto-linked URLs.
- Progress summary per category ("4 / 12 færdige").
- Hide/show non-mandatory items; hidden ones stay reachable under a collapsed
  section.
- Due-date badges (overdue / soon), Danish formatting, computed client-side.
- Search box filters titles/tags; "Reset my local data" button.

## Todo.txt export

Client-side export button producing a `.zip` (JSZip) containing `todo.txt`
(everything) plus one `<category>.txt` per category.

```
x 2026-08-22 søg-su @admin +mandatory due:2026-08-31 Søg SU
```

Mapping: `x <completion-date> ` prefix when done · `@<tag>` contexts · project
tag from category slug · `due:<date>` · completion date from `done`.

## Tech choices

- Vanilla JS ES modules, no framework, no toolchain.
- Vendored: js-yaml 4.1.0 ✓; JSZip when M4 starts.
- Validation script: Node.js (`scripts/validate.mjs`) run by CI and runnable
  locally with plain `node`.

## Milestones

1. ~~**M1 – Skeleton**: Pages serving, YAML fetch + rendering, checkboxes,
   localStorage persistence, progress counters, collapsible item details~~
2. **M2 – Contributions**: validation workflow, PR template, CONTRIBUTING,
   Pages deploy workflow.
3. **M3 – Polish**: hiding rules, search, due badges,
   error surface for bad YAML, reset button.
4. **M4 – Export**: Todo.txt + zip download.

## Open questions

- Should completed items be archived visually (collapse to bottom)?
- Per-item `priority` field now or defer?
- License for content (CC-BY-SA?) and code (MIT?).
