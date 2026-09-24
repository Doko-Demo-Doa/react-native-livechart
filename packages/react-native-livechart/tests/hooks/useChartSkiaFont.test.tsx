import { renderHook } from "@testing-library/react-native";
import { useChartSkiaFont } from "../../src/hooks/useChartSkiaFont";
import type { FontConfig } from "../../src/types";

describe("useChartSkiaFont", () => {
  it("returns the resolved TGFX family, size, and weight descriptor", async () => {
    const { result } = await renderHook(() =>
      useChartSkiaFont({ fontSize: 13, fontWeight: "700" }, "Menlo", 11),
    );

    expect(result.current).toMatchObject({
      fontFamily: "Menlo",
      fontSize: 13,
      fontWeight: "700",
    });
  });

  it("uses the component defaults when the font prop is omitted", async () => {
    const { result } = await renderHook(() =>
      useChartSkiaFont(undefined, "Courier", 11),
    );

    expect(result.current).toMatchObject({ fontFamily: "Courier", fontSize: 11 });
  });

  it("reuses the descriptor across equivalent font props", async () => {
    const initial = { fontFamily: "Custom", fontSize: 13, fontWeight: "bold" } as FontConfig;
    const { result, rerender } = await renderHook(
      (props: FontConfig) => useChartSkiaFont(props, "Menlo", 11),
      { initialProps: initial },
    );
    const first = result.current;
    await rerender({ ...initial });
    expect(result.current).toBe(first);
    await rerender({ ...initial, fontSize: 14 });
    expect(result.current).not.toBe(first);
  });
});
