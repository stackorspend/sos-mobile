import { ActivityIndicator } from "react-native"
import styled from "styled-components/native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { TextLight, TextRegular, TextSemibold } from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { useEffect, useState } from "react"
import { ContainerWithColourIntent } from "../components/reusables"
import { PRICE_STATES } from "../project-constants"
import useColors from "../components/custom-hooks/useColors"
import { TransferCompleteRouteProp } from "../navigation/types"

export default function TransferCompleteScreen() {
  const navigation = useNavigation()
  const route = useRoute<TransferCompleteRouteProp>()

  const { sats, type } = route.params

  // State
  const [currentState, setCurrentState] = useState(PRICE_STATES.SPEND)
  const [loading, setLoading] = useState(true)

  // Custom hooks
  const { textColor, backgroundColor } = useColors(currentState)

  useEffect(() => {
    setTimeout(
      () => {
        setLoading(false)
      },
      type === "receive" ? 400 : 2500,
    )
  }, [])

  // Use a fake loading effect for now
  if (loading) {
    return (
      <ContainerWithColourIntent
        color={backgroundColor}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color={textColor} />
      </ContainerWithColourIntent>
    )
  }

  return (
    <ContainerWithColourIntent
      color={backgroundColor}
      style={{ flex: 1, paddingTop: 70, paddingHorizontal: 12 }}
    >
      <TextLight color={textColor} size={58}>
        Transfer Complete
      </TextLight>
      <>
        <TextRegular style={{ marginTop: 50 }} mBottom={0} color={textColor}>
          You {type === "receive" ? "received" : "sent"}
        </TextRegular>
        <TextSemibold mBottom={8} size={28}>
          {sats} sats
        </TextSemibold>
        <TextRegular mBottom={30} color={textColor}>
          to ln@invoice.com via Lightning for $0.01
        </TextRegular>
        <TextSemibold mBottom={60} size={24}>
          You saved 0.2% on this transaction
        </TextSemibold>
        <TextRegular mBottom={10} color={textColor}>
          Average buying price: US$19,012.43
        </TextRegular>
        <TextRegular color={textColor}>Current buying price: US$31,012.43</TextRegular>
      </>
      <BottomActions>
        <MainButton
          clickHandler={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          }
          style={{ flex: 1, marginRight: 6 }}
          title="Go Home"
        />
        <MainButton
          title="View Invoice"
          secondary
          style={{
            flex: 1,
          }}
        />
      </BottomActions>
    </ContainerWithColourIntent>
  )
}

const BottomActions = styled.View`
  position: absolute;
  bottom: 30px;
  left: 12px;
  right: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`
