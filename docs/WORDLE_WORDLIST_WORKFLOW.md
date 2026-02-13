# Wordle Word List Maintenance (Every 2 Weeks)

Goal: keep EN/DE lists simple, common, and playable.

## Files

- `assets/wordle-data/en.answers.json`
- `assets/wordle-data/en.allowed.json`
- `assets/wordle-data/de.answers.json`
- `assets/wordle-data/de.allowed.json`
- `assets/wordle-data/wordlist-manifest.json`

## Checklist

1. Update word lists (add/remove common 5-letter words only).
2. Ensure each answer word exists in its matching allowed list.
3. Update `lastUpdatedUtc` in `wordlist-manifest.json`.
4. Run validation:
   - `npm run check:wordle-lists`
5. Run normal build:
   - `npm run build`
6. Quick browser sanity check on `/wordle.html`:
   - EN + DE switch
   - Daily + Random game buttons
   - Keyboard (physical + on-screen)
   - Win/lose state

## Notes

- Lists are intentionally curated and not exhaustive dictionaries.
- Keep words lowercase a-z and exactly 5 letters for static validation.
- This is fully static-hostable; no backend workflow is required.
