import styled from "styled-components/native"
import { useNavigation } from "@react-navigation/native"
import colors from "../styles/colors"
import { TextLight, TextRegular, TextSemibold } from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { useState } from "react"
import { PRICE_STATES } from "../project-constants"
import { ContainerWithColourIntent } from "../components/reusables"
import useColors from "../components/custom-hooks/useColors"
import QRCode from "react-native-qrcode-svg"
import { SendScreenNavigationProp } from "../navigation/types"
import { View } from "react-native"
const TAGS = ["Dining", "Health", "Groceries", "Dining"]

const STATES = {
  INVOICE: "invoice",
  QRCODE: "qr-code",
  CONFIRM: "confirm",
}

export default function ReceiveScreen() {
  const navigation = useNavigation<SendScreenNavigationProp>()

  // State
  const [currentState, setCurrentState] = useState(PRICE_STATES.SPEND)
  const [satsToSend, setSatsAmount] = useState("")
  const [currentScreenState, setCurrentScreenState] = useState(STATES.INVOICE)
  const [note, setNote] = useState("")

  // Custom hooks
  const { textColor, backgroundColor } = useColors(currentState)

  const handleNext = () => {
    switch (currentScreenState) {
      case STATES.INVOICE:
        setCurrentScreenState(STATES.QRCODE)
        return
      case STATES.QRCODE:
        navigation.navigate("TransferComplete", {
          sats: Number(satsToSend),
          type: "receive",
        })
      case STATES.CONFIRM:
        navigation.navigate("TransferComplete", {
          sats: Number(satsToSend),
          type: "receive",
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
        Receive
      </TextLight>
      {/* Hide sats/invoice input when the user is on the confirmation step */}

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Input
          style={{ fontSize: satsToSend.length > 0 ? 48 : 16 }}
          placeholder="Enter the amount of sats to receive"
          // placeholder="Enter invoice, LNURL, or on-chain address here"
          placeholderTextColor={textColor}
          onChangeText={(text) => setSatsAmount(text)}
          defaultValue={satsToSend}
          returnKeyType="done"
          blurOnSubmit={true}
          keyboardType="numeric"
        />
        <TextSemibold style={{ flex: 1 }} size={20} color={textColor}>
          sats
        </TextSemibold>
      </View>

      {currentScreenState === STATES.QRCODE && (
        <>
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
          <QRContainer
            style={{
              borderRadius: 4,
            }}
          >
            {/* <QRCode size={100} content={"12345"} /> */}
            <QRCode size={250} value="http://awesomdsdasdadasdase.link.qr" />
          </QRContainer>
        </>
      )}

      <BottomActions>
        <MainButton
          title={currentScreenState === STATES.QRCODE ? "Finish" : "Next"}
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
const Input = styled.TextInput`
  border-bottom-color: rgba(0, 0, 0, 0.2);
  border-bottom-width: 1px;
  /* width: 100%; */
  flex: 4;
  margin-bottom: 30px;
  padding: 4px;
  padding-bottom: 8px;
  font-size: 16px;
  color: black;
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
const QRContainer = styled.View`
  /* width: 160px; */
  /* height: 160px; */
  border-radius: 5px;
  justify-content: center;
  align-items: center;
`
