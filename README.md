# Blendie

Skincare ingredients that get along.

Blendie is a free PWA (Italian and English) that tells you whether two skincare ingredients can be used together. Every result shows a level, a short explanation, practical advice and its scientific sources.

## Levels

| Level | Italian | English |
| --- | --- | --- |
| green | Vanno d'accordo | They get along |
| yellow | Hanno bisogno dei loro spazi | They need some space |
| red | Non vanno d'accordo | They don't get along |
| unknown (lilac) | Nessuna interazione nota | No known interaction |

Medicines (tretinoin, adapalene, benzoyl peroxide, azelaic acid) only have an information card, never pairings.

## Data

All content lives in `data/data.json`, separate from the code, so it can be updated without touching the app:

- `ingredients`: cards with synonyms, INCI names, categories, percentages, sources and the year of the latest study
- `pairs`: sourced pairings, with the basis of each rule (studies, lab studies, expert opinion, health authorities)
- `myths`, `guides` (INCI, formats) and the `disclaimer`

Any pair not listed shows "No known interaction".

## Rules for content

- Every sentence needs a reliable source (studies, medical sites, health authorities). No source, no sentence.
- Brand websites are not sources.
- Every card is re-checked within 6 months, or immediately if an important study comes out.

Blendie doesn't replace advice from a doctor, dermatologist or pharmacist.
