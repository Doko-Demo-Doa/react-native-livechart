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
    addRRect(rect) {
      return builder.addRect(rect.rect ?? rect);
    },
    arcToOval() {
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
