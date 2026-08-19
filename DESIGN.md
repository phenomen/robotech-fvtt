# Design system

Robotech sheets are composed from primitives. Layout files do not style themselves.

Visual language: [Geist Grid](https://vercel.com/geist/grid) (visible guides, solid cells, crosses) and a compact type scale (title / label / caption / stat / copy / button). Colors stay on `--rt-*` theme tokens. Corners are always square.

## Rules

1. **No classes in layout.** `src/components/apps/`, `blocks/`, and `items/` compose primitives. They do not use Tailwind, `className`, or `cn()`.
2. **The only layout class is `.robotech`**, applied by `Sheet` (and by ApplicationV2 `classes` on the Foundry window).
3. **If a look is missing, add a variant or a primitive** in `src/components/ui/`. Do not special-case a block.
4. **Square corners only.** `border-radius: 0` on buttons, inputs, cards, tags, cells, portraits, dialogs, and chat cards. Never `rounded-*` except `rounded-none`.
5. **No unique chrome.** No hardcoded colors, no one-off font sizes. Card titles and buttons are compact uppercase mono (ghost buttons stay sentence case). Equivalent peers share the same role, size, and weight.
6. **Tailwind lives in `ui/` only.** `cn()` is internal to primitives.

Chat cards and Foundry window chrome are not React. They may use CSS, but they must use the same tokens, type roles, and square corners.

## Typography

Consume type through `Text` (and through controls that already bake a role: `Button`, `Label`, `Input`). Do not apply `typo-` in layout.

Roles combine `font-family`, `font-size`, `line-height`, `letter-spacing`, and `font-weight`. Size is a separate modifier: `small`, `medium` (default), `large`. Nested `<subtle>` lightens a title; nested `<strong>` emphasizes copy or a label.

Tokens and utilities live in `src/styles/typography.css`. Each role is `typo-{role}`; pair it with `typo-small`, `typo-medium`, or `typo-large`. Controls that take a `size` prop apply the matching modifier (a small `Input` uses small label text). Do not add variants just to change type size.

| Role      | Use                                                         |
| --------- | ----------------------------------------------------------- |
| `title`   | Emphasized figures and page-level names in `Text`           |
| `label`   | Default UI text. Menus, field values, row names             |
| `caption` | Tertiary text, field labels, table headers, dense chrome    |
| `stat`    | Dice, ratings, ids, ammunition. Tabular mono. Not sentences |
| `copy`    | Reading text (notes, descriptions)                          |
| `button`  | Compact uppercase mono. Same role as `Button` / `TabNav`    |

`Button` (and `TabNav`) use `button`: Geist Mono, uppercase except `ghost`. Layout never sets button type. Rating rows pass `gradation` (`best` … `worst`); `variant="primary"` is the selected step.

Geist Sans is the default. Geist Mono is `stat`, `CardTitle`, and `button`. If a look is missing, change a role or size in `ui/`; do not invent a one-off size.

## Grid

Visible rule-lines are the sheet chrome. Reimplemented Geist API (we do not depend on `@vercel/geistcn`):

- `GridSystem` — `guideWidth={1}`, optional `dashedGuides`, optional `debug`
- `Grid` — `columns`, `rows`, `hideGuides` (`"row"` \| `"column"`). Frame and gutters equal `guideWidth`. Inner plus marks are drawn only where a column gutter meets a row gutter (not on full-width stacked blocks).
- `GridCell` — `column` / `row` as line spans (`"1/3"`), `solid` to fill a tile, `tone` (`default` \| `info` \| `danger`) to tint the fill, `pad` for inner space
- `LabelGrid`, `LabelRow`, `LabelRule` — shared label column so controls line up across rows

Guides are decorative (`aria-hidden`). Guide color is `--rt-border`; plus marks are `--rt-primary` and are centered on the intersection they mark.

### When to use

- **Grid** for two-dimensional sheet sections (stats tiles, header + portrait).
- **Stack** for one-dimensional grouping (field + label, a column of lists, header actions).
- **LabelGrid** for a stack of label + control rows that must share one label width (systems, drama).
- **Table** for tabular data (item lists, crew, conflicts). Named cell widths (`grow`, `hug`, `stat`, `action`, `ammo`, `controls`). Do not invent pixel templates.
- Do not nest `Grid` inside `Grid`. One Grid per `GridSystem`. A sheet may have two systems (header, body) stacked, not nested.
- `solid` cells are opaque tiles. Adjacent tiles are separated by the grid gutter. A cell that spans columns covers the gutter it crosses, so a full-width block has no midline.
- Off-grid surfaces (dialogs, a list in a `Stack`) use `Card`. Cards have no stroke; grid guides are the chrome.

Foundry windows are fixed width. Do not pass responsive `{ sm, md, lg }` maps.

## Stack

`direction`, `gap`, `align`, `justify`, `pad`, `wrap`, `grow`. `Field` also accepts `grow` so a row of full-width controls shares leftover space.

Gap and pad use the 4px scale:

| Token | Size |
| ----- | ---- |
| `0`   | 0    |
| `1`   | 4px  |
| `2`   | 8px  |
| `3`   | 12px |
| `4`   | 16px |
| `5`   | 24px |
| `6`   | 32px |

Do not invent half-steps.

## Materials

- Square corners everywhere.
- No bevel (`rt-corner-bevel` is gone).
- Default fill: `--rt-background` / `--rt-secondary`. Stroke: `--rt-border`.
- Accent, danger, and gradation colors are tokens, not one-off hex.

## Primitives

| Primitive                                                                                                                                | Role                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Sheet`, `SheetBody`                                                                                                                     | Root fill/overflow; `.robotech`                                                             |
| `GridSystem`, `Grid`, `GridCell`                                                                                                         | Geist Grid system                                                                           |
| `Stack`                                                                                                                                  | 1D layout                                                                                   |
| `LabelGrid`, `LabelRow`, `LabelRule`                                                                                                     | Shared label column for aligned control rows                                                |
| `Text`                                                                                                                                   | Type roles plus `size` (`small` \| `medium` \| `large`)                                     |
| `Portrait`                                                                                                                               | Actor/item image                                                                            |
| `Divider`                                                                                                                                | 1px rule                                                                                    |
| `Callout`                                                                                                                                | Hint, warning, or empty slot                                                                |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`                                                                             | Tabular rows. Cell `width` is `grow` \| `hug` \| `stat` \| `action` \| `ammo` \| `controls` |
| `Card`, `CardHeader`, `CardTitle`                                                                                                        | Off-grid surface; title is compact uppercase `stat`; header is a fixed 36px row             |
| `Button`, `Input`, `NumberInput`, `Select`, `Textarea`, `Field`, `Label`, `Checkbox`, `Tag`, `TabNav`, `ToggleGroup`, `ProseMirrorField` | Controls with baked type roles                                                              |
| `TrackerHex`                                                                                                                             | Game-specific hex input                                                                     |

Layout-facing primitives do not accept `className`. Add a variant instead (`full`, `orientation`, `width`, `tone`, `truncate`).

### Adding a variant

1. Confirm no existing variant covers it.
2. Name it after the intent (`title`, `stat`, `dashed`), not the CSS (`text2xl`).
3. Implement in `ui/`. Update this table if you add a primitive.

## Color

Theme tokens in `src/styles/robotech.css`. `data-theme` on `document.documentElement`. Do not hard-code a theme in components. New colors go on CSS variables, then into `@theme`.

## Good / bad

```tsx
// Good
<Sheet>
  <GridSystem guideWidth={1}>
    <Grid columns={2} rows={1}>
      <GridCell solid pad={3}>
        <Stack gap={3}>
          <CardTitle>{title}</CardTitle>
          <Field label={label}>
            <Input value={value} onChange={onChange} />
          </Field>
        </Stack>
      </GridCell>
    </Grid>
  </GridSystem>
</Sheet>

// Bad — classes in layout, one-off type, extra chrome
<div className="grid grid-cols-2 gap-4 p-2">
  <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
</div>
```
