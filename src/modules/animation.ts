import type { ModuleDef } from "../types";
import { lines } from "../utils/lines";

const animationModule: ModuleDef = {
  id: "animation",
  name: "动画/手势",
  description: "Reanimated 4 + Gesture Handler + Worklets",
  defaultChecked: false,
  dependencies: {
    "react-native-reanimated": "~4.1.1",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-worklets": "0.5.1",
  },
  devDependencies: {},
  files: [
    {
      path: "src/modules/animation/index.ts",
      content: lines(
        'export { FadeIn, FadeOut, SlideIn, SlideOut, ScaleIn, ScaleOut } from "./transitions";'
      ),
    },
    {
      path: "src/modules/animation/transitions.ts",
      content: lines(
        'import Animated, {',
        "  FadeIn as ReanimatedFadeIn,",
        "  FadeOut as ReanimatedFadeOut,",
        "  SlideInUp as ReanimatedSlideInUp,",
        "  SlideInDown as ReanimatedSlideInDown,",
        "  SlideInLeft as ReanimatedSlideInLeft,",
        "  SlideInRight as ReanimatedSlideInRight,",
        "  SlideOutUp as ReanimatedSlideOutUp,",
        "  SlideOutDown as ReanimatedSlideOutDown,",
        "  SlideOutLeft as ReanimatedSlideOutLeft,",
        "  SlideOutRight as ReanimatedSlideOutRight,",
        "  ZoomIn as ReanimatedZoomIn,",
        "  ZoomOut as ReanimatedZoomOut,",
        "  type EntryExitAnimationFunction,",
        '} from "react-native-reanimated";',
        "",
        "export const FadeIn = ReanimatedFadeIn.duration(300);",
        "export const FadeOut = ReanimatedFadeOut.duration(300);",
        "export const SlideIn = ReanimatedSlideInDown.duration(300).springify();",
        "export const SlideInTop = ReanimatedSlideInUp.duration(300).springify();",
        "export const SlideInLeft = ReanimatedSlideInLeft.duration(300).springify();",
        "export const SlideInRight = ReanimatedSlideInRight.duration(300).springify();",
        "export const SlideOut = ReanimatedSlideOutDown.duration(300).springify();",
        "export const SlideOutTop = ReanimatedSlideOutUp.duration(300).springify();",
        "export const SlideOutLeft = ReanimatedSlideOutLeft.duration(300).springify();",
        "export const SlideOutRight = ReanimatedSlideOutRight.duration(300).springify();",
        "export const ScaleIn = ReanimatedZoomIn.duration(200).springify();",
        "export const ScaleOut = ReanimatedZoomOut.duration(200).springify();",
        "",
        "export function staggerFadeIn(",
        "  index: number,",
        "  baseDelay: number = 50",
        "): EntryExitAnimationFunction {",
        "  return ReanimatedFadeIn.duration(300).delay(index * baseDelay);",
        "}",
        "",
        "export function staggerSlideIn(",
        "  index: number,",
        "  baseDelay: number = 80",
        "): EntryExitAnimationFunction {",
        "  return ReanimatedSlideInDown.duration(400).springify().delay(index * baseDelay);",
        "}",
        "",
        "export { Animated };"
      ),
    },
  ],
  // Reanimated v4 Babel plugin is auto-managed by babel-preset-expo (SDK 54+)
  // No need to manually add react-native-reanimated/plugin
  babelPlugins: [],
};

export default animationModule;
