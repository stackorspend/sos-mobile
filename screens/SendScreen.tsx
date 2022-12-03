import { StyleSheet, View, Text, Pressable, Button, Switch } from "react-native"
import styled from "styled-components/native"
import { useNavigation } from "@react-navigation/native"
import colors from "../styles/colors"
import { TextBold, TextLight, TextRegular } from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { useState } from "react"

export default function SendScreen() {
  const navigation = useNavigation()
  const [sendAddress, setSendAddress] = useState("")
  const [isTransfer, setIsTransfer] = useState(false)

  const toggleSwitch = () => setIsTransfer((previousState) => !previousState)

  return (
    <Container style={{ flex: 1, paddingTop: 70, paddingHorizontal: 12 }}>
      <TextLight size={58}>Send</TextLight>
      <Input
        placeholder="Enter invoice, LNURL, or on-chain address here"
        placeholderTextColor={colors.primaryGreen}
        onChangeText={(text) => setSendAddress(text)}
        defaultValue={sendAddress}
        returnKeyType="next"
        blurOnSubmit={false}
        keyboardType="default"
      />
      <Actions>
        <MainButton
          btnStyle={{ backgroundColor: colors.primaryGreen, marginRight: 12 }}
          title="Scan"
          small
        />
        <MainButton
          btnStyle={{ backgroundColor: colors.primaryGreen }}
          title="Paste"
          small
        />
      </Actions>
      <TextRegular>$US325.00</TextRegular>
      <TextRegular>18923451 sats </TextRegular>
      <TextRegular>US$2,000</TextRegular>
      <Button title="Add note" />
      <Button title="Add tags" />
      <TransferContainer>
        <View style={{ flex: 3 }}>
          <TextRegular>Transfer?</TextRegular>
          <TextRegular>
            This toggle allows you to transfer your sats to another wallet, without
            affecting your average buying price{" "}
          </TextRegular>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            //   thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isTransfer}
          />
        </View>
      </TransferContainer>
      <BottomActions>
        <MainButton title="Next" />
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
`

const Actions = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`
const Input = styled.TextInput`
  border-bottom-color: #dddddd;
  border-bottom-width: 1px;
  width: 100%;
  margin-bottom: 30px;
  padding: 4px;
  font-size: 14px;
  color: black;
  height: 50px;
`
const TransferContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-start;
  flex: 1;
`
