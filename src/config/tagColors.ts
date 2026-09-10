import type { TagColor } from "@/types/ui";

/**
 * Chat cards render outside React, so they map tag colors to the `rt-chat-tag--*` classes while the
 * `Tag` primitive maps the same {@link TagColor} union to Tailwind. Keep both keyed by `TagColor`.
 */
export const CHAT_TAG_CLASS: Record<TagColor, string> = {
  amber: "rt-chat-tag--amber",
  blue: "rt-chat-tag--blue",
  default: "rt-chat-tag--default",
  green: "rt-chat-tag--green",
  pink: "rt-chat-tag--pink",
  primary: "rt-chat-tag--primary",
  purple: "rt-chat-tag--purple",
  red: "rt-chat-tag--red",
  teal: "rt-chat-tag--teal",
};
