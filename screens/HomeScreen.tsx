import { StyleSheet, View, Text, Pressable, ScrollView, Button } from "react-native"
import styled from "styled-components/native"
import { useNavigation } from "@react-navigation/native"
import { HomeScreenNavigationProp } from "../navigation/types"
import colors from "../styles/colors"
import { TextBold, TextLight, TextRegular } from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { useEffect, useState } from "react"
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import IconButton from "../styles/buttons/icon-button"
import { PRICE_STATES } from "../project-constants"
import { ContainerWithColourIntent } from "../components/reusables"
import useColors from "../components/custom-hooks/useColors"
import { demoSoS } from "../lib/sos-demo"
const TAGGED = [
  {
    tag: "Dining",
    percentage: 35,
    delta: 3,
  },
  { tag: "Health", percentage: 35, delta: 3 },
  { tag: "Groceries", percentage: 35, delta: 3 },
]

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>()

  // State
  const [currentState, setCurrentState] = useState(PRICE_STATES.SPEND)

  // Custom hooks
  const { isSpend, textColor, backgroundColor } = useColors(currentState)

  return (
    <ContainerWithColourIntent
      color={backgroundColor}
      style={{ flex: 1, paddingTop: 70, paddingHorizontal: 12 }}
    >
      <View style={{ flexDirection: " row", alignItems: "flex-end" }}>
        <IconButton
          clickHandler={() => navigation.push("Transactions")}
          icon={<FontAwesome5 name="list" size={18} color="white" />}
        />
      </View>
      <TextLight color={textColor} size={58}>
        You currently have
      </TextLight>
      <TextRegular mBottom={40} size={48}>
        620 000 sats
      </TextRegular>
      <TextRegular color={textColor} size={48}>
        2%
      </TextRegular>
      <TextRegular color={textColor} mBottom={40}>
        will be saved on your next {isSpend ? "spend" : "stack"}
      </TextRegular>
      <Button
        onPress={() => {
          isSpend
            ? setCurrentState(PRICE_STATES.STACK)
            : setCurrentState(PRICE_STATES.SPEND)
        }}
        title={isSpend ? "Stack" : "Spend"}
      />
      <Button
        onPress={() => {
          demoSoS()
        }}
        title={"Run backend demo"}
      />
      <TextRegular color={textColor} mBottom={12}>
        Your spending
      </TextRegular>
      {/* <View
        style={{
          backgroundColor: isSpend ? "#C5DECF" : "#FFE8BC",
          height: 110,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <TextRegular style={{ textAlign: "center" }} color={textColor}>
          Tag transactions to track your spending{" "}
        </TextRegular>
      </View> */}
      <View style={{ height: 130 }}>
        <ScrollView horizontal>
          {TAGGED.map((item, index) => (
            <TaggedSpendingItem key={index} {...item} />
          ))}
        </ScrollView>
      </View>
      <BottomActions>
        <MainButton
          style={{ flex: 1 }}
          clickHandler={() => navigation.push("Send")}
          title="💸 Send Sats"
        />
        <IconButton
          clickHandler={() => alert("TODO: Open Camera")}
          icon={<FontAwesome name="camera" size={16} color="white" />}
          btnStyle={{ marginHorizontal: 13 }}
        />
        <MainButton
          clickHandler={() => navigation.push("Receive")}
          style={{ flex: 1 }}
          title="Receive"
        />
      </BottomActions>
    </ContainerWithColourIntent>
  )
}

export default HomeScreen

type TaggedSpendingProps = {
  tag: string
  percentage: number
  delta: number
}

const TaggedSpendingContainer = styled.View`
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: space-between;
  width: 140px;
  height: 120px;
  margin-right: 10px;
  padding: 10px;
  border-radius: 4px;
`

const TaggedSpendingItem = ({ tag, percentage, delta }: TaggedSpendingProps) => {
  return (
    <TaggedSpendingContainer>
      <TextRegular color="white">{tag}</TextRegular>
      <TextBold size={24} color="white">
        {percentage}%
      </TextBold>
      <TextRegular size={12} color="white">
        +{delta}% this month
      </TextRegular>
    </TaggedSpendingContainer>
  )
}
const BottomActions = styled.View`
  position: absolute;
  bottom: 30px;
  left: 12px;
  right: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`
