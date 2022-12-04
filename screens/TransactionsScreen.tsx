import { FlatList, Pressable, SafeAreaView, View } from "react-native"
import { TextMedium, TextRegular, TextSemibold } from "../styles/typography"
import styled from "styled-components"
import { Feather } from "@expo/vector-icons"
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { useCallback, useMemo, useRef, useState } from "react"
import { satsToUSD } from "../lib/utils"
import { useNavigation, useRoute } from "@react-navigation/native"
import { TransactionsRouteProp } from "../navigation/types"

const DATA = [
  {
    id: 1,
    date: "Jan 30, 2022",
    name: "John Doe",
    type: "send",
    sats: 200,
    transactionType: "lightning",
  },
  {
    id: 2,
    date: "Jan 30, 2022",
    name: "Jane Doe",
    type: "receive",
    sats: 200,
    transactionType: "bitcoin",
  },
]

const DetailHeading = styled(TextMedium)`
  color: #8d8d8d;
  font-size: 15px;
  margin-bottom: 4px;
`

export default function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>()
  const { transactions } = route.params

  console.log({ transactions })

  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ["90%"], [])

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionProps>(null)

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => {
        setSelectedTransaction(item)
        bottomSheetRef.current.expand()
      }}
    >
      <TransactionItem item={item} />
    </Pressable>
  )
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.8}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  )
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, paddingTop: 30, padding: 12, backgroundColor: "white" }}>
        <TextRegular mBottom={30} size={40}>
          Transactions
        </TextRegular>
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
        >
          <View style={{ padding: 20 }}>
            <TextSemibold mBottom={50} size={18} style={{ textAlign: "center" }}>
              Transaction Details
            </TextSemibold>
            <DetailHeading>Time</DetailHeading>
            <TextRegular mBottom={25}>{selectedTransaction?.date}</TextRegular>

            <DetailHeading>Amount (sats)</DetailHeading>
            <TextRegular mBottom={25}>{selectedTransaction?.sats}</TextRegular>

            <DetailHeading>Fiat</DetailHeading>
            {/* TODO: Use Bitcoin's current price */}
            <TextRegular mBottom={25}>
              about {satsToUSD(selectedTransaction?.sats, 17000)}
            </TextRegular>

            <DetailHeading>Type</DetailHeading>
            <TextRegular mBottom={25}>
              {selectedTransaction?.transactionType === "lightning"
                ? "Lightning Payment"
                : "On-chain Payment"}
            </TextRegular>

            <DetailHeading>Status</DetailHeading>
            {/* <TextRegular mBottom={25}>Saturday, November 12, 2022 12:53 AM</TextRegular> */}

            <DetailHeading>Total Fees (sats)</DetailHeading>
            {/* <TextRegular mBottom={25}>Saturday, November 12, 2022 12:53 AM</TextRegular> */}

            <DetailHeading>Invoice</DetailHeading>
            {/* <TextRegular mBottom={25}>Saturday, November 12, 2022 12:53 AM</TextRegular> */}
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  )
}

type TransactionProps = {
  id: number
  date: string
  name: string
  type: "send" | "receive"
  sats: number
  transactionType: "lightning" | "bitcoin"
}

const TransactionItem = ({ item }: { item: ApiTxn }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 4,
      marginBottom: 30,
      padding: 20,
      shadowOffset: {
        width: 4,
        height: 3,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      backgroundColor: "white",
    }}
  >
    <View>
      {item.sats.amountWithFee < 0 ? (
        <Feather name="arrow-up-right" size={24} color="grey" />
      ) : (
        <Feather name="arrow-down-left" size={24} color="grey" />
      )}
    </View>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* {item.transactionType === "bitcoin" ? (
        <FontAwesome5
          style={{ marginRight: 8 }}
          name="bitcoin"
          size={24}
          color="#FF9900"
        />
      ) : (
        <MaterialCommunityIcons
          style={{ marginRight: 8 }}
          name="lightning-bolt-circle"
          size={24}
          color="#E7B416"
        />
      )} */}
      <MaterialCommunityIcons
        style={{ marginRight: 8 }}
        name="lightning-bolt-circle"
        size={24}
        color="#E7B416"
      />
      <View>
        <TextRegular size={14} color="#939393">
          {item.timestamp}
        </TextRegular>
        <TextRegular size={16}>{item.source}</TextRegular>
      </View>
    </View>
    <View>
      <TextSemibold>{item.sats.amountWithFee} sats 💸</TextSemibold>
    </View>
  </View>
)
