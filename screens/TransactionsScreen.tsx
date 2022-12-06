import { FlatList, Platform, Pressable, SafeAreaView, View } from "react-native"
import { TextMedium, TextRegular, TextSemibold } from "../styles/typography"
import styled from "styled-components"
import { Feather } from "@expo/vector-icons"
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { useCallback, useMemo, useRef, useState } from "react"
import { satsToUSD, toCurrency, toFormattedNumber } from "../lib/utils"
import { useRoute } from "@react-navigation/native"
import { TransactionsRouteProp } from "../navigation/types"

const DetailHeading = styled(TextMedium)`
  color: #8d8d8d;
  font-size: 15px;
  margin-bottom: 4px;
`

export default function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>()
  const { transactions } = route.params

  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ["90%"], [])

  const [selectedTransaction, setSelectedTransaction] = useState<ApiTxn>(null)

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
      <View
        style={{
          flex: 1,
          paddingTop: Platform.OS === "android" ? 80 : 30,
          padding: 12,
          backgroundColor: "white",
        }}
      >
        <TextRegular mBottom={30} size={40}>
          Transactions
        </TextRegular>
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item, index) => index + item.sourceId}
          ListEmptyComponent={
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <TextRegular>No transactions yet..</TextRegular>
            </View>
          }
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
            <TextRegular mBottom={25}>
              {new Date(selectedTransaction?.timestamp).toLocaleString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </TextRegular>

            <DetailHeading>Amount (sats)</DetailHeading>
            <TextRegular mBottom={25}>
              {toFormattedNumber(Math.abs(selectedTransaction?.sats.amountWithFee))}
            </TextRegular>

            <DetailHeading>Fiat</DetailHeading>
            {/* TODO: Use Bitcoin's current price */}
            <TextRegular mBottom={25}>
              about{" "}
              {toCurrency(satsToUSD(selectedTransaction?.sats.amountWithFee, 17000))}
            </TextRegular>

            <DetailHeading>Type</DetailHeading>
            <TextRegular mBottom={25}>
              {selectedTransaction?.txType === "LIGHTNING"
                ? "Lightning Payment"
                : "On-chain Payment"}
            </TextRegular>

            <DetailHeading>Status</DetailHeading>
            <TextRegular color="#6AD3BA" mBottom={25}>
              Paid
            </TextRegular>

            <DetailHeading>Total Fees (sats)</DetailHeading>
            <TextRegular mBottom={25}>
              {toFormattedNumber(Math.abs(selectedTransaction?.sats.fee))}
            </TextRegular>
            <DetailHeading>Invoice</DetailHeading>
            <TextRegular mBottom={25}>{selectedTransaction?.txHash}</TextRegular>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  )
}

const TransactionItem = ({ item }: { item: ApiTxn }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 4,
      marginBottom: 30,
      padding: 12,
      paddingVertical: 20,
      shadowOffset: {
        width: 4,
        height: 3,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      backgroundColor: "white",
    }}
  >
    <View style={{ flex: 0.5, width: 20 }}>
      {item.sats.amountWithFee < 0 ? (
        <Feather name="arrow-up-right" size={20} color="grey" />
      ) : (
        <Feather name="arrow-down-left" size={20} color="grey" />
      )}
    </View>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flex: 2,
      }}
    >
      {item.txType === "BITCOIN" ? (
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
      )}
      <View>
        <TextRegular size={11} color="#939393" numberOfLines={1}>
          {new Date(item.timestamp).toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
          })}
        </TextRegular>
        <TextRegular size={16}>{item.source}</TextRegular>
      </View>
    </View>
    <View style={{ flex: 2 }}>
      <TextSemibold
        style={{ textAlign: "right" }}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
        size={14}
      >
        {toFormattedNumber(item.sats.amountWithFee)} sats
      </TextSemibold>
    </View>
  </View>
)
