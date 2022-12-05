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
      : colors.dark};
  border: ${(props) =>
    props.secondary ? `1px solid ${colors.copy}` : `1px solid transparent`};
  min-width: ${(props) => (props.small ? "100px" : "100%")};
  /* min-width: 140px; */
  border-radius: 8px;
  height: ${(props) => (props.small ? "37px" : "49px")};
  align-items: center;
  justify-content: center;
`
const Text = styled.Text`
  color: ${(props) => (props.secondary ? colors.copy : "white")};
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
}: {
  clickHandler: () => void
  disabled?: boolean
  icon?: React.ReactNode
  loading?: boolean
  primary?: boolean
  secondary?: boolean
  small?: boolean
  style?: any
  title: string
  white?: boolean
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
      white={white}
      primary={primary}
      style={{ ...btnStyle }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon && <View style={{ left: 12 }}>{icon}</View>}
        {loading ? (
          <ActivityIndicator color={"white"} />
        ) : (
          <Text secondary={secondary} disabled={disabled}>
            {title}
          </Text>
        )}
      </View>
    </Button>
  </TouchableOpacity>
)

export default MainButton
