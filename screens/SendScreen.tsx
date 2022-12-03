import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Button,
  Switch,
  ScrollView,
  TouchableOpacity,
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
import Tags from "react-native-tags"

const TAGS = ["Dining", "Health", "Groceries", "Dining"]

const STATES = {
  ENTER_INFORMATION: "enter-information",
  CONFIRM: "confirm",
}

export default function SendScreen() {
  const navigation = useNavigation()
  const [sendAddress, setSendAddress] = useState("")
  const [isTransfer, setIsTransfer] = useState(false)
  const [currentScreenState, setCurrentScreenState] = useState(STATES.ENTER_INFORMATION)

  const toggleSwitch = () => setIsTransfer((previousState) => !previousState)

  return (
    <Container style={{ flex: 1, paddingTop: 70, paddingHorizontal: 12 }}>
      <TextLight size={58}>Send</TextLight>
      {currentScreenState === STATES.ENTER_INFORMATION && (
        <>
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
          <TextRegular mBottom={10} size={24} color={colors.primaryGreen}>
            $US325.00
          </TextRegular>
          <TextBold mBottom={4} color={colors.primaryGreen}>
            Balance after:
          </TextBold>
          <TextRegular color={colors.primaryGreen}>18923451 sats </TextRegular>
          <TextRegular color={colors.primaryGreen}>US$2,000</TextRegular>
          <Button title="Add note" />
          <Button title="Add tags" />
          <View style={{ height: 60 }}>
            <Tags
              initialText="monkey"
              textInputProps={{
                placeholder: "Any type of animal",
              }}
              initialTags={["dog", "cat", "chicken"]}
              onChangeTags={(tags) => console.log(tags)}
              onTagPress={(index, tagLabel, event, deleted) =>
                console.log(index, tagLabel, event, deleted ? "deleted" : "not deleted")
              }
              containerStyle={{
                justifyContent: "center",
                width: "100%",
                background: "red",
              }}
              inputStyle={{ backgroundColor: "white" }}
              renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
                <TouchableOpacity key={`${tag}-${index}`} onPress={onPress}>
                  <Text>{tag}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={{ height: 40 }}>
            <ScrollView horizontal>
              {TAGS.map((item, index) => (
                <TaggedSpendingItem key={index} label={item} />
              ))}
            </ScrollView>
          </View>
          <TransferContainer>
            <View style={{ flex: 4 }}>
              <TextRegular mBottom={8} color={colors.primaryGreen} size={18}>
                Transfer?
              </TextRegular>
              <TextRegular>
                This toggle allows you to transfer your sats to another wallet, without
                affecting your average buying price{" "}
              </TextRegular>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Switch
                trackColor={{ false: "#767577", true: colors.primaryGreen }}
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
          <TextSemibold style={{ marginTop: 50 }} size={28}>
            25000 sats
          </TextSemibold>
          <TextRegular mBottom={30} color={colors.primaryGreen}>
            to ln@invoice.com via Lightning for $0.01
          </TextRegular>
          <TextMedium mBottom={60} size={18}>
            Fee ~3 sats ⚡️
          </TextMedium>
          <TextRegular color={colors.primaryGreen} style={{ textAlign: "center" }}>
            You will have a 2% on this transaction based on your average buying price
          </TextRegular>
        </>
      )}
      <BottomActions>
        <MainButton
          title={currentScreenState === STATES.ENTER_INFORMATION ? "Next" : "Spend"}
          clickHandler={() =>
            currentScreenState === STATES.ENTER_INFORMATION
              ? setCurrentScreenState(STATES.CONFIRM)
              : setCurrentScreenState(STATES.ENTER_INFORMATION)
          }
        />
      </BottomActions>
    </Container>
  )
}

const TaggedSpending = styled.View`
  background-color: ${colors.primaryGreen};
  height: 26px;
  margin-right: 10px;
  padding: 0 10px;
  border-radius: 1px;
`
type TaggedSpendingProps = {
  label: string
}

const TaggedSpendingItem = ({ label }: TaggedSpendingProps) => {
  return (
    <TaggedSpending>
      <TextRegular color="white">{label}</TextRegular>
      {/* // TODO: Add close item */}
    </TaggedSpending>
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
  margin-bottom: 20px;
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
