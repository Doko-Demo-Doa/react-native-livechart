/** Worklet-safe SVG command writer for TGFX's `<Path path>` primitive. */
export interface ReanimatedPathBuilder {
  moveTo(x: number, y: number): ReanimatedPathBuilder;
  lineTo(x: number, y: number): ReanimatedPathBuilder;
  cubicTo(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number,
  ): ReanimatedPathBuilder;
  quadTo(cx: number, cy: number, x: number, y: number): ReanimatedPathBuilder;
  close(): ReanimatedPathBuilder;
  addRect(rect: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    w?: number;
    h?: number;
  }): ReanimatedPathBuilder;
  addRRect(rect: any): ReanimatedPathBuilder;
  arcToOval(
    oval: unknown,
    start: number,
    sweep: number,
    forceMoveTo?: boolean,
  ): ReanimatedPathBuilder;
  detach(): string;
}

export type PathBuilderFactory = { get: () => ReanimatedPathBuilder };

function createPathBuilder(): ReanimatedPathBuilder {
  "worklet";
  let commands = "";
  const builder: ReanimatedPathBuilder = {
    moveTo(x, y) {
      commands += `M${x} ${y} `;
      return builder;
    },
    lineTo(x, y) {
      commands += `L${x} ${y} `;
      return builder;
    },
    cubicTo(c1x, c1y, c2x, c2y, x, y) {
      commands += `C${c1x} ${c1y} ${c2x} ${c2y} ${x} ${y} `;
      return builder;
    },
    quadTo(cx, cy, x, y) {
      commands += `Q${cx} ${cy} ${x} ${y} `;
      return builder;
    },
    close() {
      commands += "Z ";
      return builder;
    },
    addRect(rect) {
      const width = rect.width ?? rect.w ?? 0;
      const height = rect.height ?? rect.h ?? 0;
      return builder
        .moveTo(rect.x, rect.y)
        .lineTo(rect.x + width, rect.y)
        .lineTo(rect.x + width, rect.y + height)
        .lineTo(rect.x, rect.y + height)
        .close();
    },
    addRRect(rrect) {
      const rect = rrect.rect ?? rrect;
      const width = rect.width ?? rect.w ?? 0;
      const height = rect.height ?? rect.h ?? 0;
      // Callers in this codebase only ever pass a uniform corner radius
      // (rx === ry); a non-uniform ellipse corner isn't needed here.
      const r = Math.max(
        0,
        Math.min(rrect.rx ?? rrect.r ?? 0, width / 2, height / 2),
      );
      if (r <= 0) {
        return builder.addRect(rect);
      }
      const { x, y } = rect;
      commands +=
        `M${x + r} ${y} ` +
        `L${x + width - r} ${y} ` +
        `A${r} ${r} 0 0 1 ${x + width} ${y + r} ` +
        `L${x + width} ${y + height - r} ` +
        `A${r} ${r} 0 0 1 ${x + width - r} ${y + height} ` +
        `L${x + r} ${y + height} ` +
        `A${r} ${r} 0 0 1 ${x} ${y + height - r} ` +
        `L${x} ${y + r} ` +
        `A${r} ${r} 0 0 1 ${x + r} ${y} ` +
        `Z `;
      return builder;
    },
    arcToOval(oval, start, sweep, forceMoveTo) {
      // `oval` is Skia's arcToOval bounding box; `start`/`sweep` are degrees in
      // the same clockwise-from-3-o'clock convention SVG's arc uses (both are
      // y-down coordinate systems), so this maps straight onto an SVG `A`
      // command instead of approximating the arc with cubic segments.
      const o = oval as { x: number; y: number; width?: number; height?: number; w?: number; h?: number };
      const width = o.width ?? o.w ?? 0;
      const height = o.height ?? o.h ?? 0;
      const rx = width / 2;
      const ry = height / 2;
      const cx = o.x + rx;
      const cy = o.y + ry;
      const startRad = (start * Math.PI) / 180;
      const endRad = ((start + sweep) * Math.PI) / 180;
      const startX = cx + rx * Math.cos(startRad);
      const startY = cy + ry * Math.sin(startRad);
      const endX = cx + rx * Math.cos(endRad);
      const endY = cy + ry * Math.sin(endRad);
      if (forceMoveTo) {
        builder.moveTo(startX, startY);
      } else {
        commands += `L${startX} ${startY} `;
      }
      const largeArcFlag = Math.abs(sweep) > 180 ? 1 : 0;
      const sweepFlag = sweep > 0 ? 1 : 0;
      commands += `A${rx} ${ry} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY} `;
      return builder;
    },
    detach() {
      const result = commands;
      commands = "";
      return result;
    },
  };
  return builder;
}

const pathBuilderFactory: PathBuilderFactory = { get: createPathBuilder };

export function usePathBuilder(): PathBuilderFactory {
  // Plain JS path strings are not shareable mutable host objects. Allocate the
  // command writer inside each derived worklet instead; the finalized SVG string
  // remains the only value crossing into TGFX.
  return pathBuilderFactory;
}

export function usePathBuilders(count: number): { get: () => ReanimatedPathBuilder[] } {
  return {
    get: () => {
      "worklet";
      const builders: ReanimatedPathBuilder[] = [];
      for (let index = 0; index < count; index++) builders.push(createPathBuilder());
      return builders;
    },
  };
}
