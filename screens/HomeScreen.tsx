import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native"
import styled from "styled-components/native"
import { useNavigation } from "@react-navigation/native"
import { HomeScreenNavigationProp } from "../navigation/types"
import colors from "../styles/colors"
import { TextBold, TextLight, TextRegular } from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { SQLiteDb } from "../sos/services/sqlite/get-db"
import { useEffect } from "react"

const TAGGED = [
  {
    tag: "Dining",
    percentage: 35,
    delta: 3,
  },
  { tag: "Health", percentage: 35, delta: 3 },
  { tag: "Groceries", percentage: 35, delta: 3 },
]
const STATES = {
  STACK: "stack",
  SPEND: "spend",
}
const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>()

  useEffect(() => {
    const rows = async () => {
      const createQuery = `
        CREATE TABLE IF NOT EXISTS transactions (
          sats_amount_with_fee INTEGER NOT NULL,
          sats_fee TEXT NOT NULL
        );
        `

      const insertQuery = `
        INSERT INTO transactions (
          sats_amount_with_fee,
          sats_fee
        ) VALUES (
          ?,
          ?
        );
        `
      console.log('START')
      const sql = SQLiteDb()

      await sql.create({ createQuery })

      const insertRow = [300, "50"]
      await sql.insert({insertQuery, row: insertRow})

      const rows = await sql.select({selectQuery: "SELECT * FROM transactions;"})
      console.log('Rows:', rows)
    }

    rows()
  }, [])

  return (
    <Container style={{ flex: 1, paddingTop: 70, paddingHorizontal: 12 }}>
      <TextLight size={58}>You currently have</TextLight>
      <TextRegular mBottom={40} size={48}>
        620 000 sats
      </TextRegular>
      <TextRegular size={48}>2%</TextRegular>
      <TextRegular mBottom={40}>will be saved on your next spend</TextRegular>
      <TextRegular>Your spending</TextRegular>
      <ScrollView horizontal>
        {TAGGED.map((item, index) => (
          <TaggedSpendingItem key={index} {...item} />
        ))}
      </ScrollView>
      <BottomActions>
        <MainButton clickHandler={() => navigation.push("Send")} title="💸 Send Sats" />
        {/* <Button title="Camera" onPress={() => navigation.navigate("Details")} /> */}
        <MainButton title="Receive" />
      </BottomActions>
    </Container>
  )
}

export default HomeScreen

type TaggedSpendingProps = {
  tag: string
  percentage: number
  delta: number
}

const TaggedSpendingContainer = styled.View`
  background-color: ${colors.primaryGreen};
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
      <TextBold color="white">{percentage}%</TextBold>
      <TextRegular color="white">+{delta}% this month</TextRegular>
    </TaggedSpendingContainer>
  )
}

const Container = styled.View`
  background: ${colors.positive};
`
const BottomActions = styled.View`
  position: absolute;
  bottom: 30px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: ${colors.positive};
`
