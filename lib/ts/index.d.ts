import React, { Component, Requireable } from "react";
import { TextStyle, ViewStyle } from "react-native";

type Props = {
  options: string[];
  onPress: (index: number) => void;
  title?: string;
  message?: string;
  tintColor?: string;
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number;
  /**
   * Only for Android or ActionSheetCustom
   */
  styles?: {
    titleBox?: ViewStyle;
    titleText?: TextStyle;

    messageBox?: ViewStyle;
    messageText?: TextStyle;

    buttonText?: TextStyle;
    buttonBox?: ViewStyle;
    cancelButtonBox?: ViewStyle;

    overlay?: TextStyle;
    wrapper?: ViewStyle;
    body?: ViewStyle;

    selectTextStyle?: TextStyle;
  };

  /**
   * Change theme color
   * @default system theme color
   */
  userInterfaceStyle?: "light" | "dark";
  /**
   * `onPress` will fire normally if `selectable` not `true`
   */
  selectable?: boolean;
  multipleSelect?: boolean;
  /**
   * initial selected index
   */
  selected?: number[];
  /**
   * @example
   * ```js
   * selectIcon={require('/path_to_image')}
   * ```
   */
  selectIcon?: any;
  onSelectedChange?: (arr: number[]) => void;
};

type ActionSheetProps = Props & {
  /**
   * Android only.
   * **ios** theme is similar to the iOS ActionSheet with rounded boxes
   * @default flat
   */
  theme?: "flat" | "ios";
};

export default class ActionSheet extends Component<ActionSheetProps> {
  public show: () => void;
}

type ActionSheetCustomProps =
  | Props
  | {
      /**
       * Edit supported orientations (https://reactnative.dev/docs/modal#supportedorientations-ios).
       * Use this prop to support portrait-upsite-down or to lock landscape orientation.
       * @default ["portrait", "landscape", "landscape-left", "landscape-right"]
       */
      supportedOrientations?: string[];

      /**
       * Starting from v3.0.0 ActionSheetCustom uses a native-like theme build using react-native to allow React Components as options (or title or message)
       *
       * **flat** is the default option for Android (use theme="flat" to use it on iOS too)
       *
       * Use theme="ios" to use rounded boxes (like iOS theme) on Android
       * @default flat for Android and native-like for iOS
       */
      theme?: "flat" | "ios";
    };

export class ActionSheetCustom extends Component<ActionSheetCustomProps> {
  public show: () => void;
}
