import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GRAPH_BACKEND, LineGraph, type GraphPoint } from "react-native-graph";

import { DemoScreen } from "./DemoScreen";
import { APP_FONT_FAMILY, APP_FONT_FAMILY_MEDIUM } from "./fonts";
import { colors } from "./theme";

const START_TIME = Date.UTC(2025, 5, 13, 9, 30);
const POINT_INTERVAL_MS = 5 * 60 * 1_000;

/** Fixed renderer-agnostic price history shared by the static and live demos. */
const GRAPH_POINTS: GraphPoint[] = Array.from({ length: 72 }, (_, index) => {
  const trend = index * 0.19;
  const wave = Math.sin(index * 0.42) * 3.6 + Math.cos(index * 0.16) * 1.4;
  const dip = index > 35 && index < 49 ? -(49 - index) * 0.25 : 0;
  return {
    date: new Date(START_TIME + index * POINT_INTERVAL_MS),
    value: Number((146.8 + trend + wave + dip).toFixed(2)),
  };
});

const formatPrice = (value: number) => `$${value.toFixed(2)}`;

type GraphDemoMode = "static" | "dynamic";

function nextPoint(points: GraphPoint[]): GraphPoint {
  const lastPoint = points[points.length - 1]!;
  const index =
    Math.round((lastPoint.date.getTime() - START_TIME) / POINT_INTERVAL_MS) + 1;
  const trend = index * 0.19;
  const wave = Math.sin(index * 0.42) * 3.6 + Math.cos(index * 0.16) * 1.4;
  const dip = index > 35 && index < 49 ? -(49 - index) * 0.25 : 0;

  return {
    date: new Date(lastPoint.date.getTime() + POINT_INTERVAL_MS),
    value: Number((146.8 + trend + wave + dip).toFixed(2)),
  };
}

export function GraphBackendDemo({ mode }: { mode: GraphDemoMode }) {
  const [selectedPoint, setSelectedPoint] = useState<GraphPoint | null>(null);
  const [points, setPoints] = useState(GRAPH_POINTS);
  const isDynamic = mode === "dynamic";

  useEffect(() => {
    if (!isDynamic) {
      return;
    }

    const interval = setInterval(() => {
      setPoints((currentPoints) => [
        ...currentPoints.slice(1),
        nextPoint(currentPoints),
      ]);
    }, 500);

    return () => clearInterval(interval);
  }, [isDynamic]);

  return (
    <DemoScreen
      title={`react-native-graph · ${isDynamic ? "live" : "static"}`}
      description={
        isDynamic
          ? "The same 72-point price chart, with one synthetic price arriving every three seconds."
          : "A fixed 72-point price chart using react-native-graph's LineGraph."
      }
      chart={
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>BUILD BACKEND</Text>
            <Text style={styles.statusValue}>
              {GRAPH_BACKEND.toUpperCase()}
            </Text>
          </View>
          <LineGraph
            animated
            color="#3323E6"
            enableIndicator
            indicatorPulsating={false}
            enablePanGesture
            gradientFillColors={["rgba(51,35,230,0.28)", "rgba(51,35,230,0)"]}
            lineThickness={4}
            onPointSelected={setSelectedPoint}
            panGestureDelay={0}
            points={points}
            style={styles.graph}
          />
          <Text style={styles.hint}>
            {isDynamic
              ? "A new price arrives every 3 seconds. Press and drag to inspect it."
              : "Press and drag to inspect the fixed data."}
          </Text>
        </View>
      }
    >
      <Text style={styles.readout}>
        {selectedPoint
          ? `${selectedPoint.date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}  ${formatPrice(selectedPoint.value)}`
          : `Latest  ${formatPrice(points[points.length - 1]!.value)}`}
      </Text>
      <Text style={styles.note}>
        The renderer is selected for the whole build. Use a graph backend script
        to run this same screen with Skia, tGFX, or Thor.
      </Text>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FAFAFF",
    padding: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    color: colors.textFaint,
    fontFamily: APP_FONT_FAMILY_MEDIUM,
    fontSize: 10,
    letterSpacing: 0.9,
  },
  statusValue: {
    color: "#3323E6",
    fontFamily: APP_FONT_FAMILY_MEDIUM,
    fontSize: 11,
    letterSpacing: 0.7,
  },
  graph: {
    flex: 1,
    marginTop: 10,
  },
  hint: {
    color: colors.textFaint,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  readout: {
    color: colors.textMuted,
    fontFamily: APP_FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  note: {
    color: "#92400E",
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
