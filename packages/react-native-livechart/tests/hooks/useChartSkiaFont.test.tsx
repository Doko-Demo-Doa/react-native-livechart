import { renderHook } from "@testing-library/react-native";
import { useChartSkiaFont } from "../../src/hooks/useChartSkiaFont";

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
});
