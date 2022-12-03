import React from "react"
import styled from "styled-components"
import { TouchableOpacity, View, ActivityIndicator } from "react-native"
import * as Haptics from "expo-haptics"
import colors from "../colors"

const Button = styled.View`
  background: ${(props) =>
    props.disabled
      ? colors.disabled
      : props.white
      ? props.background
      : props.background
      ? "white"
      : props.primary
      ? colors.primary
      : props.secondary
      ? "transparent"
      : props.danger
      ? "red"
      : colors.copy};
  border: ${(props) => (props.secondary ? `1px solid white` : `1px solid transparent`)};
  width: ${(props) => (props.small ? "90px" : "100%")};
  /* min-width: 140px; */
  border-radius: 8px;
  height: ${(props) => (props.small ? "37px" : "49px")};
  align-items: center;
  justify-content: center;
`
const Text = styled.Text`
  color: ${(props) => (props.primary || props.white ? colors.copy : "white")};
  /* color: white; */
  font-size: 14px;
  font-weight: 500;
  padding: 0 18px;
`

const MainButton = ({
  clickHandler,
  disabled,
  icon,
  loading,
  primary,
  secondary,
  small,
  style,
  title,
  white,
  btnStyle,
}) => (
  <TouchableOpacity
    style={{ marginBottom: 10, ...style }}
    disabled={disabled || loading}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      clickHandler()
    }}
  >
    <Button
      disabled={disabled || loading}
      small={small}
      secondary={secondary}
      white={white}
      primary={primary}
      style={{ ...btnStyle }}
    >
      {icon && <View style={{ position: "absolute", right: 25 }}>{icon}</View>}
      {loading ? (
        <ActivityIndicator color={"white"} />
      ) : (
        <Text white={white} primary={primary} disabled={disabled}>
          {title}
        </Text>
      )}
    </Button>
  </TouchableOpacity>
)

export default MainButton
