# Kelvin Ojogbede | Data Analyst Portfolio

[Visit the portfolio](https://kelv-ojo.github.io/)

A responsive portfolio featuring hotel bookings, customer churn, UK energy consumption and sales reporting. Built with static HTML, CSS and JavaScript for GitHub Pages, with project filters, native mobile navigation, full-size chart links and direct links to source analysis.

## Run locally

Run `python -m http.server 8000 --bind 127.0.0.1` in this directory, then open http://127.0.0.1:8000. There is no build step or front-end package installation.

Run `python scripts/check_site.py` and `node --check app.js` for structural/evidence checks and JavaScript syntax. The Python check uses only the standard library. See [the audit and verification record](PORTFOLIO-REVIEW.md) for manual browser checks and remaining limits.

## Content

Each project links to its dataset context, methods, checks and limitations in its source repository. Charts are generated from the documented analysis; no live client results are implied.

The energy case study separates reproducible historical analysis from reported dissertation experiments. See [the consistency review](research/dissertation/README.md) before using its forecasting results. The complete dissertation is not included; only selected figures and clearly labelled table transcriptions are retained.

The original skull profile, interactive star, dotted angel artwork and twelve named tool logos are preserved. Motion can be paused and respects reduced-motion preferences. Navigation and case-study links work without JavaScript; filters are a progressive enhancement.

## Reviewing this upgrade

Changes are on `feat/portfolio-recruiter-upgrade`. Do not merge or deploy until the owner approves. Legacy styles, scripts and original analytical assets remain in the repository for recovery; current pages load the shared `portfolio.css` and the homepage loads `app.js`.
