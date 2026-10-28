/** Logs an unexpected failure from a user action and tells the user it did not go through. */
export function reportFailure(error: unknown): void {
  console.error(error);
  ui.notifications.error(game.i18n.localize("ROBOTECH.Sheet.ActionFailed"));
}
