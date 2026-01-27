export type EnhancementPreset =
  | "none"
  | "clean"
  | "sharp"
  | "cinema";

export function getEnhancementFilter(preset: EnhancementPreset): string {
  switch (preset) {
    case "clean":
      return "hqdn3d=1.5:1.5:6:6";

    case "sharp":
      return "unsharp=5:5:0.8:3:3:0.4";

    case "cinema":
      return "hqdn3d=1.5:1.5:6:6,unsharp=5:5:0.8:3:3:0.4";

    case "none":
    default:
      return "";
  }
}
