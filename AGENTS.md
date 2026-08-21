# Robotech RPG for Foundry VTT

Custom Foundry VTT **system** (`id: robotech`) for [Robotech RPG](https://strangemachinegames.com/robotechrpg/) by Strange Machine Games. It is not a module. Sheets, rolls, chat cards, and document data all live in this package.

Foundry consumes the built output in `dist/` (`robotech.js`, `robotech.css`, `system.json`, `lang/`, `assets/`). Source of truth is `src/` plus `public/`.

## 1. Project Overview

The system implements Robotech RPG on Foundry VTT 14:

- **Actors:** `character`, `vessel` (mecha, vehicles, naval), `swarm` (groups of vessels).
- **Items:** `career`, `race`, `skill`, `talent`, `gear`, `weapon`, `equipment_suite`, `feature`, `upgrade`.
- **Dice:** AD6 (success-counting d6s with system ratings such as Nominal, Edge, Advantage).
- **UI:** ApplicationV2 windows whose bodies are React 19 trees (actor/item sheets, Action Center, Combat Tracker, dialogs).
- **Canvas:** custom `TokenRuler` colored by actor speed.

Document subtypes are declared in `public/system.json` (`documentTypes`) and bound to `TypeDataModel` classes during the `init` hook in `src/robotech.ts`. Adding a type requires both; Foundry rejects unknown types if the manifest is missing the key.

Game logic (damage cascade, wound/stress prep, hardware slots, swarm members) belongs in data models and `src/utils`, not in React. React reads live Foundry documents and writes through `document.update()`.

The project is in an early phase: **breaking changes to schema, data, and identifiers are allowed.** Do not add `migrateData`, compatibility shims, or fallbacks for renamed fields.

## 2. Tech Stack

| Layer          | Choice                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Host           | Foundry VTT **14** (Data Models, ApplicationV2). Do not use AppV1 (`ActorSheet`, `ItemSheet`, `FormApplication`).          |
| Language       | **TypeScript 7**, `strict`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`                                             |
| UI             | **React 19** (function components, `react-jsx`)                                                                            |
| Styles         | **Tailwind CSS 4** (`@theme` in `src/styles/robotech.css`, type tokens in `typography.css`)                                |
| Bundler        | **Bun** (`build.ts` → `dist/`). `bun-plugin-tailwind` for CSS.                                                             |
| Lint / format  | **oxlint** (type-aware) and **oxfmt** (double quotes, CRLF, sorted imports and Tailwind classes)                           |
| Merged classes | `cn()` from `cnfast` (`src/utils/cn.ts`) when class merge is needed                                                        |
| Types          | Real Foundry client sources in `foundry/client` and `foundry/common` (gitignored). Import via `@client/*` and `@common/*`. |

Scripts: `bun run build`, `bun run lint`, `bun run fmt`. Can be run together with: `bun run fmt; bun run lint; bun run build` command.

Path alias `@/` maps to `src/`. Always import through `@/…`, never deep relative paths.

## 3. Project Structure

```
src/
  robotech.ts                 System entry: init/ready hooks, data models, sheets, settings, theme
  canvas/                     TokenRuler and other canvas overrides
  combat/                     Combat / Combatant document classes and React CombatTracker
  components/
    apps/                     Full React trees mounted by ApplicationV2 (sheets, Action Center, Combat Tracker)
    blocks/                   Sheet sections composed into apps (header, trackers, item lists)
    items/                    Per-Item-type field groups for the item sheet
    ui/                       Shared primitives (Button, Input, Card, …)
  config/                     Closed choice lists, layout, theme, wounds, weapon property defs
  models/
    actors/                   TypeDataModels for Actor subtypes
    combat/                   TypeDataModels for Combat and Combatant
    items/                    TypeDataModels for Item subtypes
    documents.ts              ActorOf / ItemOf maps and document unions
  sheets/                     ActorSheetV2 / ItemSheetV2 adapters (React root lifecycle)
  styles/                     Tailwind entry (`robotech.css`), type tokens (`typography.css`), chat, ProseMirror extras
  types/                      Foundry module augmentations (`foundry.d.ts`, `vendor.d.ts`)
  utils/                      Game rules, document helpers, chat, rolls — no React
public/
  system.json                 Manifest (id, compatibility, documentTypes, htmlFields, i18n)
  lang/en.json                All user-facing strings
  assets/                     Icons and art
foundry/                      Copied Foundry `client/` + `common/` (gitignored). Real API types.
build.ts                      Bun build + copy `public/` → `dist/`
```

Folder roles:

- **`foundry/`** — authoritative Foundry API. Read types and JSDoc here before writing Foundry-specific code.
- **`models/`** — schema, derived data, `_preUpdate` clamps. Source of truth for `actor.system` / `item.system`.
- **`config/`** — `as const` option lists with `labelKey` pointing at `en.json`. No hardcoded labels.
- **`utils/`** — pure or Foundry-document operations (rolls, damage, crew, HTML enrich). Keep UI out.
- **`sheets/` + `components/apps/ReactDialog.tsx` + `combat/RobotechCombatTracker.ts`** — the only places that create a React root.
- **`components/apps/`** — page-level composition. **`blocks/`** — reusable sheet sections. **`ui/`** — look-and-feel only (the only place Tailwind is allowed). Layout files compose primitives; see `DESIGN.md`.
- **`types/`** — augment Foundry document classes so `system` is the Robotech union, not `unknown`.

Barrel `index.ts` files re-export a folder’s public API. Import from the barrel when the folder is the module; import the file directly when that avoids a cycle.

## 4. Coding Standards and Guidelines

Follow the practices below. Update this document if it's not up-to-date.

### Foundry V14

The Foundry API lives in `foundry/` — copies of the client (`foundry/client`) and shared (`foundry/common`) sources. Type-check against those files: `import type Actor from "@client/documents/actor.mjs"`, derive override params from the class, and read JSDoc on the symbol you are calling. Prefer namespaced runtime classes (`foundry.documents.Actor`, `foundry.applications.sheets.ActorSheetV2`, `foundry.data.fields`, `foundry.helpers.Hooks`).

Use https://foundryvtt.com/api/ only as a fallback when the local sources do not explain a hook, concept, or overview.

- Register data models and sheets only inside `Hooks.once("init", …)`.
- Declare every Actor/Item subtype in `public/system.json` `documentTypes` **and** on `CONFIG.Actor.dataModels` / `CONFIG.Item.dataModels`. Keys must match.
- List HTML fields under `htmlFields` in the manifest so the server sanitizes them. Back them with `HTMLField` in the schema. Enrich for chat with `enrichHtml()`; do not `escapeHtml` enriched HTML. Use `escapeHtml` only for user-controlled strings (document names) interpolated into HTML templates, not i18n labels or numbers.
- Persist with `document.update()`, `createEmbeddedDocuments`, `deleteEmbeddedDocuments`. Never assign through `actor.system.foo =` from UI code.
- Use dotted update paths: `{ "system.armor": 4 }`. For arrays/objects that must be replaced as a whole, pass the next value (do not mutate the live array in place and then update).
- Derived combat/sheet numbers belong in `prepareDerivedData()` or getters on the data model. `prepareDerivedData` may write derived fields; UI must not invent a second source of truth.
- Change schema and field names in place. Do not add `migrateData`, dual-read of old keys, or defaulting logic that exists only to support previous shapes.
- User-visible failures go through `ui.notifications` and localized strings. Check `document.isOwner` / `game.user.isGM` before privileged writes.
- Settings, chat, and sockets use the system id `"robotech"`. Localization keys use the `ROBOTECH.*` namespace (Foundry type names live under `TYPES`).

### Data models

Subclass `foundry.abstract.TypeDataModel` (via `ActorDataModel` / `ItemDataModel`). Do not introduce `template.json`.

```typescript
static override defineSchema() {
  const fields = foundry.data.fields;
  return {
    ...super.defineSchema(),
    armor: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
  };
}
```

- `declare` every schema field (and derived fields) on the class so `actor.system` is typed.
- Closed string sets use `options` plus a `const` list from `@/config` (`WEALTH_VALUES`, etc.). Infer the union with `typeof VALUES[number]`.
- Narrow documents with `isActorOf` / `isItemOf` and the `ActorOf<"character">` / `ItemOf<"weapon">` types. Do not cast `actor.system` to a subtype.
- Put shared slot/field shapes in helpers (see `hardwareSlots.ts`) instead of duplicating `SchemaField` trees.
- Clamp interdependent values in `_preUpdate` (ammunition vs max, destroyed hardware vs slots).

### ApplicationV2 and React roots

Sheets extend `ActorSheetV2` / `ItemSheetV2`. Other windows extend `ReactDialog` (ApplicationV2). Configure with `static DEFAULT_OPTIONS` (`classes` must include `"robotech"`).

- Create the React root once in `_renderHTML`, render with `flushSync` so Foundry receives committed DOM, unmount in `_onClose`.
- Do not call `createRoot` from a component. Do not use Handlebars for system UI.
- `_replaceHTML` should only `replaceChildren` when the container is not already mounted.
- New dialogs: subclass `ReactDialog` and implement `renderContent()`.

### React 19

Function components and named exports only. `ref` is a normal prop — do not use `forwardRef`.

- **One concern per component.** Sheet tabs, trackers, and editors are `blocks/` (or `items/` for item subtypes). Apps compose; they do not inline large JSX trees.
- **Foundry documents are live.** Read `actor.system` / `item.system` during render. Do not copy document fields into `useState`. React state is for ephemeral UI only (active tab, dialog open, local draft before commit).
- Writes:

  ```tsx
  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };
  ```

  Foundry re-renders the sheet and React follows. For user actions that can fail, `async` handlers plus `ui.notifications`.

- Reuse `@/components/ui` primitives. Do not add one-off `<button>` / `<input>` styling, Tailwind, or `className` in apps/blocks/items. If a look is missing, add a variant in `ui/`. See `DESIGN.md`.
- Import only what you use (`useState`, `useRef`, `type JSX`). Do not default-import `React` unless you need the namespace (`React.memo`).
- `React.memo` belongs on leaf primitives that take `children`, not on every block. Do not wrap handlers in `useCallback` unless a memoized child actually depends on referential equality.
- `useEffect` is for synchronizing with Foundry custom elements (e.g. ProseMirror) and subscriptions. It is not for derived values or document updates.
- List keys are document ids (`item.id`), never array indexes.
- Mark static interactive elements `type="button"`. Pair every input with a `Label`: the label needs `htmlFor` (HTML `for`) and the control needs a matching `id`. Icon-only controls need `title` or accessible text from i18n.

### TypeScript

- `import type` for type-only imports (`verbatimModuleSyntax` requires it).
- No `any`. Start from `unknown` and narrow. Index access may be `undefined` — handle it.
- Explicit return types on exported functions and components (`Promise<void>`, `React.JSX.Element`).
- Prefer `type` for unions and mapped types; `interface` for object shapes that documents/components extend.
- Closed unions from `as const satisfies readonly Option[]`, not TypeScript `enum`.
- Type predicates (`actor is ActorOf<"vessel">`) over assertions. If you must assert, you are probably missing a narrow in `@/utils/documents` or `@/models/documents`.
- Foundry hook/override parameter types: derive from the class in `foundry/` (`Parameters<ApplicationBase["_renderHTML"]>[0]`) rather than inventing parallel interfaces.

### Styling

Follow **[DESIGN.md](DESIGN.md)**. Layout (`apps/`, `blocks/`, `items/`) is composition only: Grid, Stack, Text, and other primitives — no Tailwind, no `className`. The only layout class is `.robotech` on `Sheet`.

- Tailwind and `cn()` live in `src/components/ui/` only. Type roles, grid guides, spacing, and square corners are owned by those primitives.
- New colors go on CSS variables under `:root` / `[data-theme]` and then into `@theme`. Do not sprinkle raw hex/oklch in JSX.
- Keep system UI under `.robotech` so it does not leak into the Foundry chrome.
- Theme is `data-theme` on `document.documentElement` (`dark` default). Do not hard-code a theme in components.
- Corners are never rounded. Chat CSS and Foundry window chrome under `.robotech` use the same tokens and square corners.

### Internationalization

Every user-visible string lives in `public/lang/en.json`. No string literals in JSX, notifications, settings, or chat copy.

```tsx
game.i18n.localize("ROBOTECH.Character.Armor");
game.i18n.localize("ROBOTECH.Wounds.Max", { max });
```

- Nest keys under `ROBOTECH` by feature (`Character`, `Vessel`, `Item`, `Roll`, …).
- Choice options store `labelKey`, never the display text.
- When adding a document subtype, add `TYPES.Actor.*` or `TYPES.Item.*` as well.

### Modules, files, and names

- High modularity: if a function does two things, split it. If a component renders two features, split it.
- Function names: `camelCase`, at most **three** words (`prepareDerivedData` is Foundry’s name — do not invent a fourth word around it).
- Files match the primary export: `WeaponDataModel.ts`, `ItemList.tsx`, `applyDamage.ts`.
- Classes and components: `PascalCase`. Hooks: `use` prefix. Constants: `SCREAMING_SNAKE` or `camelCase` `as const`.
- Keep game formulas in `utils/` or the data model. Keep Foundry document I/O in `utils/documents.ts` (or a focused sibling). Keep JSX out of those layers.

### When changing behavior

1. Check types and JSDoc in `foundry/` (website API docs only if that is not enough). Decide whether the change belongs on the data model, a util, or the sheet.
2. Update `defineSchema` / `documentTypes` / `htmlFields` together when the persisted shape changes. Replace old fields; do not keep a compatibility path.
3. Add or reuse `en.json` keys before wiring UI.
4. Run `bun run lint` and `bun run fmt` on touched files. Build with `bun run build` when the entry graph or CSS tokens change.
