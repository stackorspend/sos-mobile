import React from "react"
import styled from "styled-components"
import { TouchableOpacity, View, ActivityIndicator } from "react-native"
import * as Haptics from "expo-haptics"
import colors from "../colors"

const Button = styled.View`
  background: ${(props) =>
    props.disabled
      ? colors.disabled
      : props.background
      ? "white"
      : props.primary
      ? colors.primary
      : props.secondary
      ? "transparent"
      : props.danger
      ? "red"
      : colors.dark};
  border: ${(props) => (props.secondary ? `1px solid white` : `1px solid transparent`)};
  width: 35px;
  height: 35px;
  /* min-width: 140px; */
  border-radius: 17px;

  align-items: center;
  justify-content: center;
`

const IconButton = ({
  clickHandler,
  disabled,
  icon,
  loading,
  primary,
  secondary,
  small,
  style,
  btnStyle,
}: {
  clickHandler: () => void
  disabled?: boolean
  icon: React.ReactNode
  loading?: boolean
  primary?: boolean
  secondary?: boolean
  small?: boolean
  style?: any
  btnStyle?: any
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
      primary={primary}
      style={{ ...btnStyle }}
    >
      {icon && <View>{icon}</View>}
      {loading ? <ActivityIndicator color={"white"} /> : []}
    </Button>
  </TouchableOpacity>
)

export default IconButton
