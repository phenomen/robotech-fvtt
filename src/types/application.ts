/**
 * ApplicationV2 documents its hook signatures with JSDoc typedefs that are only reachable through
 * the class itself, so the shapes the system's own overrides need are derived from it here.
 */

type ApplicationBase = foundry.applications.api.ApplicationV2;

export type AppOptions = ConstructorParameters<typeof foundry.applications.api.ApplicationV2>[0];
export type RenderContext = Parameters<ApplicationBase["_renderHTML"]>[0];
export type RenderOptions = Parameters<ApplicationBase["_renderHTML"]>[1];
export type CloseOptions = Parameters<ApplicationBase["_onClose"]>[0];
