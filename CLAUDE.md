# Portfolio site

Personal portfolio of Jomiloju Obafunmi, full-stack web developer. Plain HTML, CSS and JS, no build step.

## Commands
- Check: `node scripts/check.js` (runs in well under a second; must pass before saying a task is done)
- Preview: open `index.html` in a browser
- Deploy: `git push art main` (GitHub Pages, live at https://jomiloju-art.github.io/). Push only with the owner's OK.
  The `origin` remote (jomiloju11) can't be pushed to from this machine (403); don't try.

## Where things live
- `index.html` — all sections: hero, work, services, about, contact
- `styles.css` — design tokens at the top; mobile rules at the bottom
- `script.js` — copy-email button and footer year only
- `assets/` — project screenshots (webp) and `og.png` social image
- `Jomiloju_Obafunmi_CV.pdf` — CV download; replace with the latest CV from Downloads when it changes
- `scripts/check.js` — the site check; `_config.yml` keeps it and this file off the live site

## Owner's decisions (don't change without asking)
- Never show Needle & Knead. Projects shown: DDUROGA, Agro Alliance, TallyBI, AppBank.
- Contact is email only. No phone number anywhere, even though the CV has one.
- Keep the black and red look.

## Design (redesigned 2026-11-14 with the frontend-design plugin)
- Palette: black #000, white #fff, signal red #f01e0a, grey #8c8c8c, graphite #1f1f1f. Black text on the red passes contrast; white small text on red does not.
- One font: Archivo. Headings and the email use the condensed width (font-stretch 62%), extra bold, uppercase.
- The red contact block is the one loud element. Keep everything else quiet: no glows, tilts, fade-ins, ALL-CAPS labels, numbered markers or tech marquees.
- One motion moment only: the headline reveal on load (off for reduced motion).

## Pitfalls
- Headless Chrome can't go narrower than about 500px; check phone width by loading the page in a 390px iframe.
- `sharp` for image work is available from `C:\Users\devuser\projects\dduroga-site\node_modules`.
- If you add a section or id, keep `#links` and `getElementById` calls in step; the check catches mismatches.
- When a new kind of mistake happens, add a rule to `scripts/check.js` so it can't happen again.
