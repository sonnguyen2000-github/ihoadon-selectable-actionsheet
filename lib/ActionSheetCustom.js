import React from "react";
import {
  Text,
  View,
  Dimensions,
  Modal,
  Animated,
  ScrollView,
  Easing,
  SafeAreaView,
  LayoutChangeEvent,
  Appearance,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import * as utils from "./utils";
import styles2 from "./styles";
import BlurView from "./BlurView";
import { Platform } from "react-native";

const WARN_COLOR = "#FF3B30";

const getMaxHeight = () => {
  return Math.round(Dimensions.get("window").height * 0.8);
};

class ActionSheet extends React.Component {
  static defaultProps = {
    disabledColor: "#A0A0A0",
    buttonUnderlayColor: "#A0A0A055",
    disabledIndexes: [],
    onPress: () => {},
    styles: {},
    useNativeDriver: true,
  };

  defaultOrientations = [
    "portrait",
    "landscape",
    "landscape-left",
    "landscape-right",
  ];

  onLayout = (e: LayoutChangeEvent) => {
    let translateY = e.nativeEvent.layout.height;
    const maxHeight = getMaxHeight();
    let scrollEnabled = translateY > maxHeight;
    if (scrollEnabled) {
      translateY = maxHeight;
    }
    this.setState({
      translateY,
      scrollEnabled,
    });
  };

  /**
   *
   * @param {Props} props
   */
  constructor(props) {
    super(props);

    this.state = {
      translateY: 0,
      scrollEnabled: false,
      visible: false,
      sheetAnim: new Animated.Value(1),
      sheetVisible: false,
      selected: props?.selected ?? [],
    };
  }

  show = () => {
    this.setState(
      { visible: true, selected: this.props.selected ?? [] },
      () => {
        setTimeout(() => {
          this._showSheet();
        });
      }
    );
  };

  hide = (index) => {
    this._hideSheet(() => {
      this.setState(
        {
          visible: false,
          translateY: 0,
          scrollEnabled: false,
          selected: [],
        },
        () => {
          this.props.onPress(index);
        }
      );
    });
  };

  _cancel = () => {
    const { cancelButtonIndex } = this.props;
    // 保持和 ActionSheetIOS 一致，
    // 未设置 cancelButtonIndex 时，点击背景不隐藏 ActionSheet
    if (utils.isset(cancelButtonIndex)) {
      this.hide(cancelButtonIndex);
    }
  };

  _showSheet = () => {
    Animated.timing(this.state.sheetAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: this.props.useNativeDriver,
    }).start();
  };

  _hideSheet(callback) {
    Animated.timing(this.state.sheetAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: this.props.useNativeDriver,
    }).start(callback);
  }

  _textColor = (mergedStyles) => {
    return this._isDarkMode()
      ? mergedStyles.textDarkTheme
      : mergedStyles.textLightTheme;
  };

  _renderTitle() {
    const { title, styles } = this.props;
    const mergedStyles = getMergedStyles(styles);
    if (!title) return null;
    return (
      <View style={mergedStyles.titleBox}>
        <Text style={[mergedStyles.titleText, this._textColor(mergedStyles)]}>
          {title}
        </Text>
      </View>
    );
  }

  _renderMessage() {
    const { message, styles } = this.props;
    const mergedStyles = getMergedStyles(styles);
    if (!message) return null;
    return (
      <View style={mergedStyles.messageBox}>
        <Text style={[mergedStyles.messageText, this._textColor(mergedStyles)]}>
          {message}
        </Text>
      </View>
    );
  }

  _renderCancelButton() {
    const { options, cancelButtonIndex } = this.props;
    if (!utils.isset(cancelButtonIndex)) return null;
    return this._createButton(
      options[cancelButtonIndex],
      cancelButtonIndex,
      true
    );
  }

  _getBorderTopStyle = () => {
    return {
      borderTopColor: this._isDarkMode() ? "#fff5" : "#0005",
      borderTopWidth: StyleSheet.hairlineWidth,
    };
  };

  /**
   *
   * @param {string} title
   * @param {number} index
   * @param {boolean=} isCancelButton
   * @returns
   */
  _createButton(title, index, isCancelButton = false) {
    const styles = getMergedStyles(this.props.styles);
    const {
      buttonUnderlayColor,
      cancelButtonIndex,
      destructiveButtonIndex,
      disabledIndexes,
      disabledColor,
      selectable,
      selected,
      selectIcon,
      multipleSelect,
    } = this.props;
    const tintColor =
      this.props.tintColor || (this._isDarkMode() ? "#4793FF" : "#007AFF");
    const fontColor = destructiveButtonIndex === index ? WARN_COLOR : tintColor;
    const isCancel = cancelButtonIndex === index;
    const buttonBoxStyle = isCancel ? styles.cancelButtonBox : styles.buttonBox;

    /* selected */
    const selectedStyle = styles.selectedStyle;
    const isSelected = this.state.selected.includes(index);

    const isDisabled = disabledIndexes.indexOf(index) !== -1;
    if (isDisabled) {
      fontColor = disabledColor;
    }
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={1}
        underlayColor={this._isDarkMode() ? "#fff3" : "#00000015"}
        style={[
          buttonBoxStyle,
          !(index == 0 || (cancelButtonIndex == 0 && index == 1)) &&
            this._getBorderTopStyle(),
        ]}
        onPress={() => {
          // no automatic hide if multiple, ONLY SELECT
          // this.hide(index);
          if (isCancelButton) return this.hide(index);

          if (selectable) {
            if (!multipleSelect) {
              if (this.state.selected.includes(index)) {
                this.setState({ selected: [] }, () => {
                  if (typeof this.props.onSelectedChange == "function")
                    this.props.onSelectedChange(this.state.selected);
                });
              } else {
                this.setState({ selected: [index] }, () => {
                  if (typeof this.props.onSelectedChange == "function")
                    this.props.onSelectedChange(this.state.selected);
                });
              }

              this.hide(index);
            } else {
              if (!this.state.selected.includes(index)) {
                this.setState((prevState) => ({
                  ...prevState,
                  selected: [...prevState.selected].concat(index),
                }));
              } else {
                this.setState((prevState) => ({
                  ...prevState,
                  selected: [...prevState.selected].filter(
                    (idx) => idx != index
                  ),
                }));
              }
            }
          } else this.hide(index);
        }}
        disabled={isDisabled}
      >
        <Text
          style={[
            isCancel ? styles.cancelButtonText : styles.buttonText,
            { color: fontColor },
            isCancel ? styles.cancelButtonText : undefined,
            isSelected ? selectedStyle : undefined,
          ]}
        >
          {title}
        </Text>
        {/* float selected icon */}
        <View
          style={[
            {
              position: "absolute",
              right: 0,
              justifyContent: "center",
              alignItems: "center",
              opacity: isSelected ? 1 : 0,
            },
            this.props.selectIconWrapperStyle,
          ]}
        >
          <Image
            source={selectIcon}
            style={this.props.selectIconStyle}
          />
        </View>
      </TouchableOpacity>
    );
  }

  _renderOptions() {
    const { cancelButtonIndex } = this.props;
    return this.props.options.map((title, index) => {
      return cancelButtonIndex === index
        ? null
        : this._createButton(title, index);
    });
  }

  _isDarkMode = () => {
    return (
      (this.props.userInterfaceStyle || Appearance.getColorScheme()) == "dark"
    );
  };

  render() {
    const styles = getMergedStyles(this.props.styles);
    const iosStyle = this.props.theme
      ? this.props.theme == "ios"
      : Platform.OS == "ios";
    const boxStyle = iosStyle ? styles.roundedBox : {};
    const { visible, sheetAnim, scrollEnabled, translateY } = this.state;
    const darkMode = this._isDarkMode();
    return (
      <Modal
        visible={visible}
        animationType="none"
        transparent
        supportedOrientations={
          this.props.supportedOrientations || this.defaultOrientations
        }
        onRequestClose={this._cancel}
      >
        <SafeAreaView style={[styles.wrapper]}>
          <Animated.Text
            style={[
              styles.overlay,
              {
                opacity: sheetAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.48, 0],
                }),
              },
            ]}
            onPress={this._cancel}
          />
          <Animated.View
            style={[
              iosStyle
                ? styles.bodyIos
                : darkMode
                ? styles.bodyDark
                : styles.body,
              {
                opacity: translateY ? 1 : 0,
                maxHeight: getMaxHeight() + 1,
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, translateY],
                    }),
                  },
                ],
              },
            ]}
            onLayout={this.onLayout}
          >
            <BlurView
              style={[
                boxStyle,
                scrollEnabled ? { flex: 1 } : {},
                { flexDirection: "column" },
                Platform.OS == "ios"
                  ? {
                      backgroundColor: darkMode ? "#DCDCDE55" : "#fffb",
                    }
                  : {
                      backgroundColor: darkMode ? "#2C2C2E" : "#fff",
                    },
              ]}
              blurType={darkMode ? "prominent" : "light"}
              blurAmount={30}
            >
              {this._renderTitle()}
              {this._renderMessage()}
              <View style={this._getBorderTopStyle()} />
              <ScrollView
                indicatorStyle={darkMode ? "white" : "black"}
                scrollEnabled={scrollEnabled}
                style={scrollEnabled ? { flex: 1 } : {}}
              >
                {this._renderOptions()}
              </ScrollView>
            </BlurView>
            <View
              style={[
                boxStyle,
                {
                  marginTop: 8,
                  backgroundColor: darkMode ? "#2C2C2E" : "#fff",
                },
              ]}
            >
              {this._renderCancelButton()}
            </View>
          </Animated.View>
        </SafeAreaView>
      </Modal>
    );
  }
}

function getMergedStyles(styles) {
  const obj = {};
  Object.keys(styles2).forEach((key) => {
    const arr = [styles2[key]];
    if (styles[key]) {
      arr.push(styles[key]);
    }
    obj[key] = arr;
  });
  return obj;
}

export default ActionSheet;
