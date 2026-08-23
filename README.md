# Master Todo

One shared checklist for students of **DAT-GBG-DA-E26A**: everything you need to
get done around the start of your studies — applying for SU, activating your
school e-mail, meeting deadlines — gathered in one place instead of being
scattered across group chats.

## Using the site

Open the page and tick items off as you complete them. Progress per category is
shown above each list.

**Your check-offs never leave your device.** There are no accounts and no
server storing your data: completed items are saved only in your own browser
(localStorage). Clearing your browser data for this site resets everything.

## Adding tasks

All tasks live in a single file: [`todo.yaml`](todo.yaml). Anyone can add one
through a pull request:

1. Open `todo.yaml` here on GitHub and press the pencil icon (*Edit this
   file*).
2. Add your item to the right category, following the format below.
3. GitHub opens a pull request for you — a maintainer reviews and merges it,
   and the published site updates shortly after.

```yaml
- id: apply-su        # required — short unique slug
  title: Søg SU       # required — shown next to the checkbox
  details: |          # optional — longer description, URLs become clickable
    https://www.su.dk/
  due: 2026-09-30     # optional — ISO date, YYYY-MM-DD
  tags: [admin]       # optional
```

Two rules matter:

- `id` values must be unique across the whole file, and **never rename or reuse
  them afterwards** — your check-off state is linked to the id, so changing one
  resets everyone's saved progress on that item.
- Dates are always `YYYY-MM-DD`, booleans always `true`/`false`.

## Helping out

The page works but looks bare. If you have an eye for design, the CSS
(`style.css`) is deliberately minimal and would love some attention — small
pull requests touching only `style.css` are the easiest way to contribute.

There is no build step and no framework, just plain HTML/CSS/JS. Curious how
it fits together? See [PLAN.md](PLAN.md) for the architecture and roadmap.

## Running it locally

The site is fully static; serve it with any web server (opening `index.html`
straight from disk won't work — the page fetches its data over HTTP):

```sh
python3 -m http.server
```

Then visit <http://localhost:8000>.
