import { View, Button, Switch, ScrollView } from "react-native"
import styled from "styled-components/native"
import { useNavigation, useRoute } from "@react-navigation/native"
import colors from "../styles/colors"
import { TextBold, TextLight, TextRegular, TextSemibold } from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { useEffect, useState } from "react"
import { PRICE_STATES } from "../project-constants"
import { ContainerWithColourIntent } from "../components/reusables"
import useColors from "../components/custom-hooks/useColors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import IconButton from "../styles/buttons/icon-button"
import { Octicons } from "@expo/vector-icons"
import { satsToUSD, toCurrency, toFormattedNumber } from "../lib/utils"
import { SendScreenNavigationProp, SendScreenRouteProp } from "../navigation/types"

const TAGS = ["Dining", "Health", "Groceries", "Dining"]

const STATES = {
  INVOICE: "invoice",
  ENTER_INFORMATION: "enter-information",
  CONFIRM: "confirm",
}

export default function SendScreen() {
  const navigation = useNavigation<SendScreenNavigationProp>()
  const route = useRoute<SendScreenRouteProp>()

  const {
    currentBalances,
    currentState,
    premiumDiscount,
    currentBTCPrice,
    currentStackPrice,
  } = route.params

  // State
  const [satsToSend, setSatsAmount] = useState("")
  const [currentScreenState, setCurrentScreenState] = useState(STATES.INVOICE)
  const [note, setNote] = useState("")

  // Custom hooks
  const { textColor, backgroundColor } = useColors(currentState)

  // Effects

  // When the user enters some sats value, update the UI
  useEffect(() => {
    if (satsToSend) {
      setCurrentScreenState(STATES.ENTER_INFORMATION)
    } else {
      setCurrentScreenState(STATES.INVOICE)
    }
  }, [satsToSend])

  const handleNext = () => {
    switch (currentScreenState) {
      case STATES.INVOICE:
        setCurrentScreenState(STATES.ENTER_INFORMATION)
        return
      case STATES.ENTER_INFORMATION:
        setCurrentScreenState(STATES.CONFIRM)
        return
      case STATES.CONFIRM:
        navigation.push("TransferComplete", {
          sats: Number(satsToSend),
          type: "send",
          currentStackPrice,
          currentBTCPrice,
          premiumDiscount,
          currentState,
        })
        return
    }
  }

  return (
    <ContainerWithColourIntent
      color={backgroundColor}
      style={{ flex: 1, paddingTop: 120, paddingHorizontal: 12 }}
    >
      <TextLight mBottom={20} color={textColor} size={58}>
        Send
      </TextLight>
      {/* Hide sats/invoice input when the user is on the confirmation step */}
      {currentScreenState !== STATES.CONFIRM && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Input
            style={{ fontSize: satsToSend.length > 0 ? 48 : 16 }}
            placeholder="Enter the amount of sats to send"
            // placeholder="Enter invoice, LNURL, or on-chain address here"
            placeholderTextColor={textColor}
            onChangeText={(text) => setSatsAmount(text)}
            defaultValue={satsToSend}
            returnKeyType="done"
            blurOnSubmit={true}
            keyboardType="numeric"
          />
        </View>
      )}
      {currentScreenState === STATES.INVOICE && (
        <>
          <Actions>
            <MainButton
              btnStyle={{ backgroundColor: textColor, marginRight: 12 }}
              title="Scan"
              icon={<MaterialCommunityIcons name="line-scan" size={24} color="white" />}
              small
              clickHandler={() => {}}
            />
            <IconButton
              btnStyle={{ backgroundColor: textColor }}
              small
              icon={<Octicons name="paste" size={18} color="white" />}
              clickHandler={() => {}}
            />
          </Actions>
        </>
      )}
      {currentScreenState === STATES.ENTER_INFORMATION && (
        <>
          <TextRegular mBottom={10} size={24} color={textColor}>
            US{toCurrency(satsToUSD(parseFloat(satsToSend), currentBTCPrice))}
          </TextRegular>
          <TextBold mBottom={4} color={textColor}>
            Balance after:
          </TextBold>
          <TextRegular color={textColor}>
            {toFormattedNumber(currentBalances.satsBalance - Number(satsToSend))} sats
          </TextRegular>
          <TextRegular mBottom={20} color={textColor}>
            US
            {toCurrency(
              currentBalances.fiatBalance -
                satsToUSD(parseFloat(satsToSend), currentBTCPrice),
            )}
          </TextRegular>
          <NoteInput
            placeholder="📝 Add note"
            placeholderTextColor={textColor}
            onChangeText={(text) => setNote(text)}
            defaultValue={note}
            returnKeyType="next"
            blurOnSubmit={false}
            keyboardType="default"
            multiline
          />
          <Button title="Add tags" />
          <View style={{ height: 40, marginBottom: 20 }}>
            <ScrollView horizontal>
              {TAGS.map((item, index) => (
                <TaggedSpendingItem color={textColor} key={index} label={item} />
              ))}
            </ScrollView>
          </View>
          {/* <TransferContainer>
            <View style={{ flex: 4 }}>
              <TextRegular mBottom={8} color={textColor} size={18}>
                Transfer?
              </TextRegular>
              <TextRegular>
                This toggle allows you to transfer your sats to another wallet, without
                affecting your average buying price{" "}
              </TextRegular>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Switch
                trackColor={{ false: "#767577", true: textColor }}
                //   thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isTransfer}
              />
            </View>
          </TransferContainer> */}
        </>
      )}
      {currentScreenState === STATES.CONFIRM && (
        <>
          <TextSemibold size={28} mBottom={10} style={{ marginTop: 50 }}>
            {toFormattedNumber(satsToSend)} sats
          </TextSemibold>
          <TextRegular mBottom={60} color={textColor}>
            to ln@invoice.com via Lightning for $0.01
          </TextRegular>
          {/* <TextMedium mBottom={60} size={18}>
            Fee ~3 sats ⚡️
          </TextMedium> */}
          <TextRegular color={textColor} style={{ textAlign: "center" }}>
            You will save {premiumDiscount.toFixed(2)}% on this transaction based on your
            average buying price
          </TextRegular>
        </>
      )}
      <BottomActions>
        <MainButton
          title={currentScreenState === STATES.CONFIRM ? "Spend" : "Next"}
          clickHandler={handleNext}
          disabled={satsToSend.length === 0}
        />
      </BottomActions>
    </ContainerWithColourIntent>
  )
}

const TaggedSpending = styled.View`
  background-color: ${(props) => props.color ?? colors.primaryGreen};
  height: 30px;
  margin-right: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 1px;
`
type TaggedSpendingProps = {
  label: string
  color: string
}

const TaggedSpendingItem = ({ color, label }: TaggedSpendingProps) => {
  return (
    <TaggedSpending color={color}>
      <TextRegular color="white">{label}</TextRegular>
      {/* // TODO: Add close item */}
    </TaggedSpending>
  )
}

const BottomActions = styled.View`
  position: absolute;
  bottom: 30px;
  left: 12px;
  right: 12px;
`

const Actions = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
`
const Input = styled.TextInput`
  border-bottom-color: rgba(0, 0, 0, 0.2);
  border-bottom-width: 1px;
  width: 100%;
  margin-bottom: 30px;
  flex: 4;
  padding: 4px;
  padding-bottom: 8px;
  font-size: 16px;
  color: black;
  /* height: 55px; */
`

const NoteInput = styled.TextInput`
  width: 100%;
  margin-bottom: 30px;
  padding: 4px;
  padding-bottom: 8px;
  font-size: 18px;
`
const TransferContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-start;
  flex: 1;
`
