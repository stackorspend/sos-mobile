import { View, Button, Switch, ScrollView } from "react-native"
import styled from "styled-components/native"
import { useNavigation } from "@react-navigation/native"
import colors from "../styles/colors"
import { TextBold, TextLight, TextRegular, TextSemibold } from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { useState } from "react"
import { PRICE_STATES } from "../project-constants"
import { ContainerWithColourIntent } from "../components/reusables"
import useColors from "../components/custom-hooks/useColors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import IconButton from "../styles/buttons/icon-button"
import { Octicons } from "@expo/vector-icons"
import { satsToUSD } from "../lib/utils"
import { SendScreenNavigationProp } from "../navigation/types"

const TAGS = ["Dining", "Health", "Groceries", "Dining"]

const STATES = {
  INVOICE: "invoice",
  ENTER_INFORMATION: "enter-information",
  CONFIRM: "confirm",
}

export default function SendScreen() {
  const navigation = useNavigation<SendScreenNavigationProp>()

  // State
  const [currentState, setCurrentState] = useState(PRICE_STATES.SPEND)
  const [satsToSend, setSatsAmount] = useState("")
  const [isTransfer, setIsTransfer] = useState(false)
  const [currentScreenState, setCurrentScreenState] = useState(STATES.INVOICE)
  const [note, setNote] = useState("")

  // Custom hooks
  const { isSpend, textColor, backgroundColor } = useColors(currentState)

  const toggleSwitch = () => setIsTransfer((previousState) => !previousState)

  const handleNext = () => {
    switch (currentScreenState) {
      case STATES.INVOICE:
        setCurrentScreenState(STATES.ENTER_INFORMATION)
        return
      case STATES.ENTER_INFORMATION:
        setCurrentScreenState(STATES.CONFIRM)
        return
      case STATES.CONFIRM:
        navigation.navigate("TransferComplete", {
          sats: Number(satsToSend),
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
        <Input
          style={{ fontSize: satsToSend.length > 0 ? 48 : 16 }}
          placeholder="Enter the amount of sats to send"
          // placeholder="Enter invoice, LNURL, or on-chain address here"
          placeholderTextColor={textColor}
          onChangeText={(text) => setSatsAmount(text)}
          defaultValue={satsToSend}
          returnKeyType="next"
          blurOnSubmit={false}
          keyboardType="default"
        />
      )}
      {currentScreenState === STATES.INVOICE && (
        <>
          <Actions>
            <MainButton
              btnStyle={{ backgroundColor: textColor, marginRight: 12 }}
              title="Scan"
              icon={<MaterialCommunityIcons name="line-scan" size={24} color="white" />}
              small
            />
            <IconButton
              btnStyle={{ backgroundColor: textColor }}
              small
              icon={<Octicons name="paste" size={18} color="white" />}
            />
          </Actions>
        </>
      )}
      {currentScreenState === STATES.ENTER_INFORMATION && (
        <>
          <TextRegular mBottom={10} size={24} color={textColor}>
            $US{satsToUSD(parseFloat(satsToSend), 16971.09).toFixed(2)}
          </TextRegular>
          <TextBold mBottom={4} color={textColor}>
            Balance after:
          </TextBold>
          <TextRegular color={textColor}>18923451 sats </TextRegular>
          <TextRegular mBottom={20} color={textColor}>
            US$2,000
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
          <TransferContainer>
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
          </TransferContainer>
        </>
      )}
      {currentScreenState === STATES.CONFIRM && (
        <>
          <TextSemibold size={28} mBottom={10} style={{ marginTop: 50 }}>
            {satsToSend} sats
          </TextSemibold>
          <TextRegular mBottom={60} color={textColor}>
            to ln@invoice.com via Lightning for $0.01
          </TextRegular>
          {/* <TextMedium mBottom={60} size={18}>
            Fee ~3 sats ⚡️
          </TextMedium> */}
          <TextRegular color={textColor} style={{ textAlign: "center" }}>
            You will have a 2% on this transaction based on your average buying price
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
  padding: 4px;
  padding-bottom: 8px;
  font-size: 16px;
  color: black;
  height: 55px;
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
