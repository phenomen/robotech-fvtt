# Robotech RPG for Foundry VTT

Custom Foundry VTT **system** (`id: robotech`) for [Robotech RPG](https://strangemachinegames.com/robotechrpg/) by Strange Machine Games. It is not a module. Sheets, rolls, chat cards, and document data all live in this package.

Foundry consumes the built output in `dist/` (`robotech.js`, `robotech.css`, `system.json`, `lang/`, `assets/`). Source of truth is `src/` plus `public/`.

## 1. Project Overview

The system implements Robotech RPG on Foundry VTT 14:

- **Actors:** `character`, `vessel` (mecha, vehicles, naval), `swarm` (groups of vessels), `conflict`, `plot_event`.
- **Items:** `career`, `element`, `race`, `skill`, `talent`, `gear`, `weapon`, `equipment_suite`, `feature`, `upgrade`.
- **Dice:** AD6 (success-counting d6s with system ratings such as Nominal, Edge, Advantage).
- **UI:** ApplicationV2 windows whose bodies are React 19 trees (actor/item sheets, Action Center, Combat Tracker, dialogs).
- **Canvas:** custom `TokenRuler` colored by actor speed.

Document subtypes are declared in `public/system.json` (`documentTypes`) and bound to `TypeDataModel` classes during the `init` hook in `src/robotech.ts`. Adding a type requires both; Foundry rejects unknown types if the manifest is missing the key.

Game logic (damage cascade, wound/stress prep, hardware slots, swarm members) belongs in data models and `src/utils`, not in React. React reads live Foundry documents and writes through `document.update()`.

The project is in an early phase: **breaking changes to schema, data, and identifiers are allowed.** Do not add `migrateData`, compatibility shims, or fallbacks for renamed fields unless explicitly asked.

## 2. Tech Stack

| Layer | Choice |
| --- | --- |
| Host | Foundry VTT **14** (Data Models, ApplicationV2). Do not use AppV1 (`ActorSheet`, `ItemSheet`, `FormApplication`). |
| Language | **TypeScript 7**, `strict`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess` |
| UI | **React 19** (function components, `react-jsx`) |
| Styles | **Tailwind CSS 4** (`@theme` in `src/styles/robotech.css`, type tokens in `typography.css`) |
| Bundler | **Bun** (`build.ts` → `dist/`). `bun-plugin-tailwind` for CSS. |
| Lint / format | **Bun** (`bunfig.toml`: type-aware `bun lint`, `bun fmt` with double quotes, LF, sorted imports and Tailwind classes). No preset wrapper — both are configured directly. |
| Merged classes | `cn()` from `cn` (`src/utils/cn.ts`) when class merge is needed |
| Types | Real Foundry client sources in `foundry/client` and `foundry/common` (gitignored). Import via `@client/*` and `@common/*`. |

Scripts: `bun run build`, `bun run check` (`bun lint && bun fmt --check`), `bun run fix` (`bun lint --fix && bun fmt`). Run `bun run check; bun run build` after changes.

Path alias `@/` maps to `src/`. Always import through `@/…`, never deep relative paths.

## 3. Project Structure

```
src/
  robotech.ts                 System entry: init/ready hooks, data models, sheets, settings, theme
  canvas/                     TokenRuler and other canvas overrides
  combat/                     Combat / Combatant document classes and React CombatTracker
  components/
    apps/                     Full React trees mounted by ApplicationV2 (sheets, Action Center, Combat Tracker, dialogs)
    blocks/                   Sheet sections composed into apps (header, trackers, item lists)
    hooks/                    React hooks that subscribe to Foundry documents (`useLinkedActors`)
    items/                    Per-Item-type field groups for the item sheet
    ui/                       Shared primitives (Button, Input, Card, …)
  config/                     Closed choice lists, per-subtype metadata, theme, wounds, weapon property defs
  documents/                  System document class overrides (`RobotechActor`)
  models/
    actors/                   TypeDataModels for Actor subtypes
    combat/                   TypeDataModels for Combat and Combatant
    items/                    TypeDataModels for Item subtypes
    documents.ts              ActorOf / ItemOf maps and document unions
    effects.ts                Active Effect helpers
  registry/                   Subtype → data model binding, settings/optional-rule wiring
  sheets/                     ActorSheetV2 / ItemSheetV2 / Effect sheet adapters and the shared React mount
  sidebar/                    Sidebar tab overrides (`RobotechActorDirectory`)
  styles/                     Tailwind entry (`robotech.css`), type tokens (`typography.css`), chat, ProseMirror extras
  types/                      Foundry module augmentations (`foundry.d.ts`, `vendor.d.ts`), `application.ts`, and shared UI unions (`ui.ts`)
  utils/                      Game rules, document helpers, chat, rolls — no React (`synergy.ts`, `evaluateAd6Roll.ts`, …)
public/
  system.json                 Manifest (id, compatibility, documentTypes, htmlFields, i18n)
  lang/en.json                All user-facing strings
  assets/                     Icons and art
foundry/                      Copied Foundry `client/` + `common/` (gitignored). Real API types.
build.ts                      Manifest documentTypes check, Bun build, copy `public/` → `dist/`
```

Folder roles:

- **`foundry/`** — authoritative Foundry API. Read types and JSDoc here before writing Foundry-specific code.
- **`models/`** — schema, derived data, `_preUpdate` clamps. Source of truth for `actor.system` / `item.system`.
- **`documents/`** — Foundry document class overrides (`RobotechActor` for token-bar writes).
- **`config/`** — pure, runtime-free `as const` data: option lists (`labelKey` pointing at `en.json`), per-subtype metadata (`documentMeta.ts`), layout, theme. No hardcoded labels, no data-model classes.
- **`registry/`** — binds subtype keys to data models (`documentTypes.ts`) and registers settings/optional rules (`settings.ts`). `build.ts` validates `public/system.json` `documentTypes` against the runtime-free key lists in `config/documentMeta.ts` (`registry/` pulls in Foundry globals, so the build cannot import it; `satisfies Record<ActorType, …>` keeps the registry in step at type-check time). Add a subtype here, in `config/documentMeta.ts`, and in the manifest.
- **`utils/`** — pure or Foundry-document operations (rolls, damage, crew, HTML enrich). Keep UI out; only `@/types/ui` unions may describe presentation. Document I/O lives in `utils/documents.ts`.
- **`components/hooks/`** — React hooks that subscribe to Foundry documents. Do not put hooks in `utils/`.
- **`types/`** — augment Foundry document classes so `system` is the Robotech union, not `unknown`; `ui.ts` holds unions shared with game logic (`IconTone`, `TagColor`).
- **`sheets/` + `components/apps/ReactDialog.tsx` + `combat/RobotechCombatTracker.tsx`** — the only places that create a React root. Use the shared `sheets/reactMount` helpers. Actor sheets are `RobotechActorSheet` / `RobotechItemSheet` / `RobotechEffectSheet`; page trees include `EffectSheetApp`, `ConflictSheetApp`, and `PlotEventSheetApp`.
- **`components/apps/`** — page-level composition. **`blocks/`** — reusable sheet sections. **`ui/`** — look-and-feel only (the only place Tailwind is allowed). Layout files compose primitives; see `DESIGN.md`.

Barrel `index.ts` files re-export a folder’s public API. Import from the barrel when the folder is the module; import the file directly when that avoids a cycle.

## 4. Coding Standards and Guidelines

Follow the practices below. Update this document if it's not up-to-date.

### Foundry V14

The Foundry API lives in `foundry/` — copies of the client (`foundry/client`) and shared (`foundry/common`) sources. Type-check against those files: `import type Actor from "@client/documents/actor.mjs"`, derive override params from the class, and read JSDoc on the symbol you are calling. Prefer namespaced runtime classes (`foundry.documents.Actor`, `foundry.applications.sheets.ActorSheetV2`, `foundry.data.fields`, `foundry.helpers.Hooks`).

Use https://foundryvtt.com/api/ only as a fallback when the local sources do not explain a hook, concept, or overview.

- Register data models and sheets only inside `Hooks.once("init", …)`.
- Declare every Actor/Item/Combat/Combatant subtype in `public/system.json` `documentTypes`, in `config/documentMeta.ts`, and in `registry/documentTypes.ts` (which assigns `CONFIG.Actor.dataModels` / `CONFIG.Item.dataModels` / `CONFIG.Combat.dataModels` / `CONFIG.Combatant.dataModels`). Keys must match; `bun run build` fails otherwise.
- List HTML fields under `htmlFields` in the manifest so the server sanitizes them. Back them with `HTMLField` in the schema. Enrich for chat with `enrichHtml()`; do not `escapeHtml` enriched HTML. Use `escapeHtml` only for user-controlled strings (document names) interpolated into HTML templates, not i18n labels or numbers.
- Persist with `document.update()`, `createEmbeddedDocuments`, `deleteEmbeddedDocuments`. Never assign through `actor.system.foo =` from UI code.
- Use dotted update paths: `{ "system.armor": 4 }`. For arrays/objects that must be replaced as a whole, pass the next value (do not mutate the live array in place and then update).
- Derived combat/sheet numbers belong in `prepareDerivedData()` or getters on the data model. `prepareDerivedData` may write derived fields; UI must not invent a second source of truth. Do not persist what is derived: a derived field is `declare`d on the class but left out of `defineSchema` (character `vitals`, wound `max`/`value`, stress counts). Token bars find derived attributes through `CONFIG.Actor.trackableAttributes`, and `RobotechActor.modifyTokenAttribute` maps bar edits back onto persisted data.
- Active Effects apply between `prepareBaseData` and `prepareDerivedData`. Resolve nullable "override or default" fields to their default in `prepareBaseData` so an `add` change adds to the default instead of replacing `null`.
- Never write an effect-modified value back into the source. Sheet inputs for fields an effect can change are disabled when `isOverridden(actor, path)` (with `overrideHint` as the tooltip); dialogs that save several fields at once start from `sourceValueOf(actor, path)`.
- Change schema and field names in place. Do not add `migrateData`, dual-read of old keys, or defaulting logic that exists only to support previous shapes unless explicitly asked.
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

- Declare only the class's own option keys. ApplicationV2 already merges `DEFAULT_OPTIONS` down the class chain and concatenates arrays, so spreading `super.DEFAULT_OPTIONS` duplicates inherited header controls. Where the inferred parent type rejects a partial object, wrap it in `ownOptions<typeof Parent.DEFAULT_OPTIONS>({ … })` from `@/sheets/ownOptions`.

- Create the React root once in `_renderHTML`. First render with `flushSync` so Foundry receives committed DOM; later renders are async. Unmount in `_onClose`.
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

- `Input` / `NumberInput` commit on blur or Enter by default, so a document field writes once per edit. Inputs backed by React state (dialog forms) pass `commit="change"` so totals and validation follow every keystroke.
- Async handlers that write documents guard against double submission with a `pending` state and report failures with `reportFailure(error)`. Deleting a document from a sheet goes through `document.deleteDialog()`.
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

### Lint and format

`bunfig.toml` turns on every lint category (`correctness`, `suspicious`, `pedantic`, `perf`, `style`, `restriction`) and then lists the opt-outs, so `[lint.rules]` reads as the set of rules this project rejects. Add an entry only to record a decision about this codebase, with a comment saying why; never to silence a finding that is actually a bug. Prefer configuring a rule over turning it off — `no-console` allows `error`/`warn`, `unicorn/filename-case` allows both PascalCase and camelCase, `no-use-before-define` allows hoisted declarations. Type-aware rules and TypeScript diagnostics run through `bun lint` (`typeAware = true` and `typeCheck = true`), so there is no separate `tsc --noEmit` step.

- Some rules are pinned to a non-default option because their fixers otherwise rewrite the codebase the wrong way: `one-var` (`never`), `typescript/return-await` (`always`), `unicorn/text-encoding-identifier-case` (`withDash`), `no-duplicate-imports` (`allowSeparateTypeImports`), and `func-style`. Leave the options in place.
- `capitalized-comments` and `no-implicit-coercion` are off for the same reason: the first rewords existing comments, and the second turns `!!actor` into `Boolean(actor)`, which stops TypeScript from narrowing.
- **An `overrides` directory glob only matches when it starts with `**/`.** `"src/types/**"` silently matches nothing, so the override reads as if it works while every rule in it stays on; write `"**/src/types/**"`. Bare filenames (`"build.ts"`, `"*.config.ts"`) match as written.
- `react`, `jsx-a11y`, `import`, `typescript`, `unicorn`, `oxc`, and `promise` are built in. Naming a rule in `[lint.rules]` turns it on. Do not add `[lint.plugins]` — that key is only for an ESLint plugin Bun does not ship, and this repo has none. Categories include Next.js, Jest, or Vitest only when `package.json` lists that package. React brings `react-perf` with it; `"react-perf/*" = "off"` turns that plugin off. A wildcard can only be `"off"`, and a single rule in the same table overrides it. `jsx-a11y` is on and currently costs no opt-outs — it is what mechanically enforces the label/`htmlFor` and icon-title requirements above.
- Suppress a single finding with `// eslint-disable-next-line <rule>` plus a reason. Do not disable a rule for a whole file. `reportUnusedDisableDirectives = "error"` fails the build on suppressions that no longer suppress anything, so delete a directive when you remove the code that needed it. `react/exhaustive-effect-dependencies` and `react-hooks/exhaustive-deps` can both report on one effect; name each rule that reports on that line.
- `bun fmt` owns import order, Tailwind class order (including inside `cn()`), and `package.json` key order. Do not hand-sort any of them.
- `.cursor/hooks.json` runs `bun run fix` after every file edit, so expect formatting and safe fixes to land on their own.

### When changing behavior

1. Check types and JSDoc in `foundry/` (website API docs only if that is not enough). Decide whether the change belongs on the data model, a util, or the sheet.
2. Update `defineSchema` / `documentTypes` / `htmlFields` together when the persisted shape changes. Replace old fields; do not keep a compatibility path unless explicitly asked.
3. Add or reuse `en.json` keys before wiring UI.
4. Run `bun run check; bun run build` to type-check, lint, and assert the manifest.
