# Board member portraits

Used by `ar/board-members.html` and `en/board-members.html`.

## Format

- **Cut-out on transparency** (PNG) — the card supplies a white ground, so
  portraits must not carry their own baked-in background. `assets/chairman.webp`
  is an example of what *not* to use: it has an opaque grey-green backdrop that
  shows as a coloured square next to the white cards.
- **3:4 portrait**, e.g. 552×736 (2× the 276×368 display size).
- Head and upper body, framed so the face sits in the top two-thirds — the card
  crops with `object-position: center top`.

## Filenames

Drop files in with exactly these names and they are picked up automatically.
Cards still missing a file render the teal placeholder with a "user" glyph.

| # | File | Member |
|---|------|--------|
| 1 | `majed-al-hogail.png`     | ماجد بن عبدالله الحقيل — رئيس مجلس الإدارة |
| 2 | `loaye-al-nahedh.png`     | لؤي بن محمد الناهض |
| 3 | `rakan-al-sheikh.png`     | راكان بن عبدالله آل الشيخ |
| 4 | `stephen-groff.png`       | ستيفن بول جروف |
| 5 | `faisal-al-sakkaf.png`    | فيصل بن عمر السقاف |
| 6 | `abdulaziz-al-onaizan.png`| عبدالعزيز بن محمد العنيزان |
| 7 | `badr-al-otaibi.png`      | بدر بن هزاع العتيبي |
| 8 | `mazen-al-romaih.png`     | مازن بن عبدالرزاق الرميح |
| 9 | `hani-al-madini.png`      | هاني بن مديني المديني |

## Wiring a new portrait

Replace the placeholder `<figure>` with an image one, in **both** language files:

```html
<!-- before -->
<figure class="board-card__portrait board-card__portrait--pending" role="img"
  aria-label="صورة سعادة الأستاذ فيصل بن عمر السقاف"></figure>

<!-- after -->
<figure class="board-card__portrait">
  <img src="assets/board/faisal-al-sakkaf.png" alt="سعادة الأستاذ فيصل بن عمر السقاف"
    width="276" height="368" loading="lazy" decoding="async" />
</figure>
```

Once all nine are in, drop the `.board-card__portrait--pending` rules from
`css/board-members.css` — they only exist to flag missing photos.

## Hero

`board-hero.jpg` (optional) is the hero background. Without it the element
removes itself and the teal gradient stands alone, which is what the overlay
renders at 0.86–0.88 alpha anyway.
