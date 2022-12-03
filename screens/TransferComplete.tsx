import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Button,
  Switch,
  ScrollView,
} from "react-native"
import styled from "styled-components/native"
import { useNavigation } from "@react-navigation/native"
import colors from "../styles/colors"
import {
  TextBold,
  TextLight,
  TextMedium,
  TextRegular,
  TextSemibold,
} from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { useState } from "react"

const TAGS = ["Dining", "Health", "Groceries", "Dining"]

const STATES = {
  ENTER_INFORMATION: "enter-information",
  CONFIRM: "confirm",
}

export default function TransferCompleteScreen() {
  const navigation = useNavigation()

  return (
    <Container style={{ flex: 1, paddingTop: 70, paddingHorizontal: 12 }}>
      <TextLight size={58}>Transfer Complete</TextLight>
      <>
        <TextRegular style={{ marginTop: 50 }} mBottom={0} color={colors.primaryGreen}>
          You sent
        </TextRegular>
        <TextSemibold size={28}>25000 sats</TextSemibold>
        <TextRegular mBottom={30} color={colors.primaryGreen}>
          to ln@invoice.com via Lightning for $0.01
        </TextRegular>
        <TextSemibold mBottom={60} size={24}>
          You saved 0.2% on this transaction
        </TextSemibold>
        <TextRegular mBottom={10} color={colors.primaryGreen}>
          Average buying price: US$19,012.43
        </TextRegular>
        <TextRegular color={colors.primaryGreen}>
          Current buying price: US$31,012.43
        </TextRegular>
      </>
      <BottomActions>
        <MainButton
          clickHandler={() => navigation.goBack()}
          style={{ flex: 1, marginRight: 6 }}
          title="Back"
        />
        <MainButton
          title="View Invoice"
          btnStyle={{ background: "transparent" }}
          style={{ color: colors.copy, flex: 1, marginLeft: 6 }}
        />
      </BottomActions>
    </Container>
  )
}

const Container = styled.View`
  background: ${colors.positive};
`
const BottomActions = styled.View`
  position: absolute;
  bottom: 30px;
  left: 12px;
  right: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`
