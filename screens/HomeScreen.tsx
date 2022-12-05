import { View, Pressable, Alert, ActivityIndicator } from "react-native"
import styled from "styled-components/native"
import { useNavigation } from "@react-navigation/native"
import { HomeScreenNavigationProp } from "../navigation/types"
import {
  TextBold,
  TextLight,
  TextMedium,
  TextRegular,
  TextSemibold,
} from "../styles/typography"
import MainButton from "../styles/buttons/main-button"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import IconButton from "../styles/buttons/icon-button"
import { PRICE_STATES } from "../project-constants"
import { ContainerWithColourIntent } from "../components/reusables"
import useColors from "../components/custom-hooks/useColors"
import { demoSoS } from "../lib/sos-demo"
import { StackorSpend } from "../sos"
import { SQLiteDb } from "../lib/get-db"
import { toCurrency, toFormattedNumber } from "../lib/utils"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"

const TAGGED = [
  {
    tag: "Dining",
    percentage: 35,
    delta: 3,
  },
  { tag: "Health", percentage: 35, delta: 3 },
  { tag: "Groceries", percentage: 35, delta: 3 },
]

// TODO:
// - Number formatting ✅
// - Stack price ✅
// - tappable toggle for price ✅
// - transactions list clean up ✅
// - toggle for bitcoin's current price ✅
// - add a way to accept a unique token, store this in localstorage
// - add splash screen and logo ✅
// - pass around correct stack/spend state ✅
// - add reset button to blow up DB and start fresh

const db = SQLiteDb()

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ["55%"], [])

  // State
  const [currentStackPrice, setCurrentStackPrice] = useState<number | null>(0)
  const [currentBTCPrice, setCurrentBTCPrice] = useState<number | null>(0)
  const [currentBalances, setCurrentBalances] = useState<{
    satsBalance: number
    fiatBalance: number
  } | null>({ satsBalance: 0, fiatBalance: 0 })
  const [transactions, setTransactions] = useState<ApiTxn[]>([])
  const [assetDisplay, setAssetDisplay] = useState<"sats" | "fiat" | "btc">("sats")
  const [galoyToken, setGaloyToken] = useState<string | null>(
    "nWL9JckgHA6uMjwuz6kkYrAowrpNXSas",
  )
  const [initializing, setInitializing] = useState(true)

  // Effects
  useEffect(() => {
    console.log({ galoyToken })
    if (!galoyToken) return
    const sos = StackorSpend({
      galoy: {
        endpoint: "https://api.staging.galoy.io/graphql/",
        token: galoyToken,
      },
    })

    const getStackCost = async () => {
      const cost = await sos.getStackCost(db)
      if (cost instanceof Error) throw cost
      setCurrentStackPrice(cost)
    }

    const getBalancesAndCurrentPrice = async () => {
      const balances = await sos.fetchBalances()
      const price = await sos.getCurrentPrice()
      if (balances instanceof Error) throw balances
      if (price instanceof Error) throw price
      const fiatBalance = (balances.satsBalance / 100000000) * price.usdPerBtc
      setCurrentBalances({ ...balances, fiatBalance })
      setCurrentBTCPrice(price.usdPerBtc)
    }

    const fetchTransactions = async () => {
      const obj = await sos.fetchTxns({ db, first: 20 })
      if (obj instanceof Error) {
        throw obj
      }
      const { cursor, txns } = obj
      setTransactions(txns)
    }

    fetchTransactions().catch((err) => {
      console.log("Error fetching transactions", err.message)
    })

    getStackCost().catch((err) => {
      console.log("Error getting stack cost", err.message)
    })

    getBalancesAndCurrentPrice()
      .then(() => {
        setInitializing(false)
      })
      .catch((err) => {
        console.log("Error fetching balances and current price", err.message)
      })
  }, [galoyToken])

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

  const rebuildDB = async () => {
    setInitializing(true)
    const sos = StackorSpend({
      galoy: {
        endpoint: "https://api.staging.galoy.io/graphql/",
        token: galoyToken,
      },
    })
    await sos
      .syncTxns({
        db,
        pageSize: 100,
        rebuild: true,
      })
      .catch((err) => {
        console.log(err)
      })
    setInitializing(false)
  }

  const resetState = () => {
    // Reset State
    setCurrentStackPrice(0)
    setCurrentBTCPrice(0)
    setCurrentBalances({ satsBalance: 0, fiatBalance: 0 })
    setTransactions([])
    setAssetDisplay("sats")
    setGaloyToken(null)
  }

  const confirmClearAppState = () => {
    Alert.alert(
      "Are you sure?",
      "This will completely clear the app's current state and your active token.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          style: "default",
          onPress: () => clearAppState(),
        },
      ],
    )
  }

  const clearAppState = async () => {
    setInitializing(true)
    const sos = StackorSpend({
      galoy: {
        endpoint: "https://api.staging.galoy.io/graphql/",
        token: galoyToken,
      },
    })
    // TODO: drop DB
    await sos
      .syncTxns({
        db,
        pageSize: 100,
        rebuild: true,
      })
      .catch((err) => {
        console.log(err)
      })

    resetState()
    setInitializing(false)
  }

  // Custom hooks
  const priceDiff = currentStackPrice - currentBTCPrice
  const currentState = priceDiff > 0 ? PRICE_STATES.STACK : PRICE_STATES.SPEND
  const { isSpend, textColor, backgroundColor } = useColors(currentState)

  const premiumDiscount =
    currentState === PRICE_STATES.STACK
      ? (currentStackPrice / currentBTCPrice - 1) * 100
      : (1 - currentStackPrice / currentBTCPrice) * 100

  const toggleAssetDisplay = () => {
    switch (assetDisplay) {
      case "sats":
        setAssetDisplay("fiat")
        break
      case "fiat":
        setAssetDisplay("btc")
        break
      case "btc":
        setAssetDisplay("sats")
        break
    }
  }

  const renderAssetDisplay = () => {
    return (
      <Pressable onPress={toggleAssetDisplay}>
        <TextLight
          adjustsFontSizeToFit={true}
          numberOfLines={1}
          color={textColor}
          size={54}
        >
          You currently have
        </TextLight>
        {assetDisplay === "sats" && (
          <TextRegular
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            mBottom={20}
            size={48}
          >
            {toFormattedNumber(currentBalances?.satsBalance)} sats
          </TextRegular>
        )}
        {assetDisplay === "btc" && (
          <TextRegular
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            mBottom={20}
            size={48}
          >
            {currentBalances?.satsBalance / 100000000} BTC
          </TextRegular>
        )}
        {assetDisplay === "fiat" && (
          <TextRegular
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            mBottom={20}
            size={48}
          >
            US{toCurrency(currentBalances?.fiatBalance)}
          </TextRegular>
        )}
      </Pressable>
    )
  }

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  if (initializing) {
    return (
      <ContainerWithColourIntent
        color={backgroundColor}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <TextRegular>Just a moment</TextRegular>
      </ContainerWithColourIntent>
    )
  }

  return (
    <ContainerWithColourIntent
      color={backgroundColor}
      style={{ flex: 1, paddingTop: 60, paddingHorizontal: 12 }}
    >
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <IconButton
          clickHandler={() => navigation.push("Transactions", { transactions })}
          icon={<FontAwesome5 name="list" size={18} color="white" />}
        />
      </View>
      {renderAssetDisplay()}
      <TextRegular color={textColor} size={48}>
        {(isNaN(premiumDiscount) ? 0 : premiumDiscount).toFixed(2)}%
      </TextRegular>
      <TextRegular color={textColor} mBottom={20}>
        will be saved on your next {isSpend ? "spend" : "stack"}
      </TextRegular>
      <TextMedium color={textColor} mBottom={40} size={16}>
        Your average stack price: US{toCurrency(currentStackPrice)}
      </TextMedium>

      {/* <Button
        onPress={() => {
          demoSoS()
        }}
        title={"Run backend demo"}
      /> */}
      <TextRegular color={textColor} mBottom={12}>
        Your spending
      </TextRegular>
      <Pressable onLongPress={() => bottomSheetRef.current.expand()}>
        <View
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
        </View>
      </Pressable>
      <Pressable onPress={() => setCurrentBTCPrice(randomIntFromInterval(10000, 30000))}>
        <TextMedium style={{ marginTop: 20 }}>
          Shuffle Current BTC Price | {toCurrency(currentBTCPrice)}
        </TextMedium>
      </Pressable>
      {/* <View style={{ height: 130 }}>
        <ScrollView horizontal>
          {TAGGED.map((item, index) => (
            <TaggedSpendingItem key={index} {...item} />
          ))}
        </ScrollView>
      </View> */}
      <BottomActions>
        <MainButton
          style={{ flex: 1 }}
          clickHandler={() =>
            navigation.push("Send", {
              currentBalances,
              premiumDiscount,
              currentState,
              currentBTCPrice,
              currentStackPrice,
            })
          }
          title="💸 Send Sats"
        />
        <IconButton
          clickHandler={() => alert("TODO: Open Camera")}
          icon={<FontAwesome name="camera" size={16} color="white" />}
          btnStyle={{ marginHorizontal: 13 }}
        />
        <MainButton
          clickHandler={() =>
            navigation.push("Receive", {
              currentBTCPrice,
              currentStackPrice,
              premiumDiscount,
            })
          }
          style={{ flex: 1 }}
          title="Receive"
        />
      </BottomActions>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
      >
        <View style={{ padding: 20 }}>
          <TextSemibold mBottom={40} size={18} style={{ textAlign: "center" }}>
            Set Galoy Token
          </TextSemibold>
          <Input
            placeholder="Paste your galoy app token here..."
            // placeholderTextColor={textColor}
            onChangeText={(text) => setGaloyToken(text)}
            defaultValue={galoyToken}
            returnKeyType="done"
            blurOnSubmit={true}
            keyboardType="text"
          />
          <MainButton
            title="Change Token"
            clickHandler={() => bottomSheetRef?.current.close()}
          />
          <MainButton title="Rebuild Database" clickHandler={rebuildDB} />
          <MainButton title="Clear App State" clickHandler={confirmClearAppState} />
        </View>
      </BottomSheet>
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

const Input = styled.TextInput`
  border-bottom-color: rgba(0, 0, 0, 0.2);
  border-bottom-width: 1px;
  width: 100%;
  margin-bottom: 30px;
  padding: 4px;
  padding-bottom: 8px;
  font-size: 16px;
  color: black;
  /* height: 55px; */
`
