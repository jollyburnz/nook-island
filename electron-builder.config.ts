import type { Configuration } from "electron-builder";

const config: Configuration = {
  appId: "com.jackson.nookisland",
  productName: "Nook Island",
  mac: {
    category: "public.app-category.productivity",
    icon: "assets/icon.icns",
    target: [{ target: "dmg", arch: ["arm64", "x64"] }],
  },
  files: ["dist/**/*", "dist-electron/**/*", "assets/**/*"],
  extraResources: [{ from: "CLAUDE.md", to: "CLAUDE.md" }],
};

export default config;
