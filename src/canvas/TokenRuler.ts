import { TOKEN_RULER_COLORS } from "@/config";
import { actorSpeed } from "@/utils/combat";

const COST_EPSILON = 0.1;

type TokenRulerBase = foundry.canvas.placeables.tokens.TokenRuler;
type Waypoint = Parameters<TokenRulerBase["_getSegmentStyle"]>[0];
type GridOffset = Parameters<TokenRulerBase["_getGridHighlightStyle"]>[1];
type SegmentStyle = ReturnType<TokenRulerBase["_getSegmentStyle"]>;
type HighlightStyle = ReturnType<TokenRulerBase["_getGridHighlightStyle"]>;

export class RobotechTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
  override _getSegmentStyle(waypoint: Waypoint): SegmentStyle {
    const style = super._getSegmentStyle(waypoint);
    this.applySpeedColor(style, waypoint);
    return style;
  }

  override _getGridHighlightStyle(waypoint: Waypoint, offset: GridOffset): HighlightStyle {
    const style = super._getGridHighlightStyle(waypoint, offset);
    this.applySpeedColor(style, waypoint);
    return style;
  }

  private applySpeedColor(style: { color?: PIXI.ColorSource }, waypoint: Waypoint): void {
    if (waypoint.actionConfig?.teleport) return;

    const speed = actorSpeed(this.token.actor);
    if (speed <= 0) return;

    const exceeded = waypoint.measurement.cost - COST_EPSILON > speed;
    style.color = exceeded ? TOKEN_RULER_COLORS.exceeded : TOKEN_RULER_COLORS.normal;
  }
}
