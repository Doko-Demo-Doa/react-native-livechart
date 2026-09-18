module.exports = function (api) {
  const bundleMode = process.env.WORKLETS_BUNDLE_MODE === "1";
  const graphBackend = process.env.EXPO_PUBLIC_RN_GRAPH_BACKEND ?? "skia";
  api.cache.using(() => `${bundleMode}:${graphBackend}`);
  return {
    presets: ["babel-preset-expo"],
    // The Worklets plugin must remain last. Bundle Mode is app-level build
    // configuration, so the example/profiling app selects it via an explicit
    // environment variable while legacy mode remains reproducible.
    plugins: [
      // Expo does not inline EXPO_PUBLIC_* values inside node_modules. The
      // graph package reads its build backend from its own source, so inline
      // this one value for both app and dependency transforms.
      [
        "transform-inline-environment-variables",
        { include: ["EXPO_PUBLIC_RN_GRAPH_BACKEND"] },
      ],
      [
        "react-native-worklets/plugin",
        bundleMode ? { bundleMode: true, strictGlobal: true } : {},
      ],
    ],
  };
};
