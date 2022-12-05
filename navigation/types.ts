import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

// Define types for the intended screens
export type HomeStackNavigatorParamList = {
  Home: undefined
  Send: {
    currentState: string
    currentBalances: {
      sats: number
      fiat: number
    }
    premiumDiscount: number
    currentBTCPrice: number
    currentStackPrice: number
  }
  Receive: {
    premiumDiscount: number
    currentBTCPrice: number
    currentStackPrice: number
  }
  Transactions: {
    transactions: ApiTxn[]
  }
  TransferComplete: {
    sats: number
    type: "send" | "receive"
    premiumDiscount: number
    currentState: string
    currentBTCPrice: number
    currentStackPrice: number
  }
}

// Define navigation types for each screen

// Navigation Prop Types
export type HomeScreenNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  "Send"
>
export type SendScreenNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  "TransferComplete"
>

// Router Prop Types
export type TransferCompleteRouteProp = RouteProp<
  HomeStackNavigatorParamList,
  "TransferComplete"
>
export type TransactionsRouteProp = RouteProp<HomeStackNavigatorParamList, "Transactions">
export type SendScreenRouteProp = RouteProp<HomeStackNavigatorParamList, "Send">
export type ReceiveScreenRouteProp = RouteProp<HomeStackNavigatorParamList, "Receive">
// To use in screen, const route = useRoute<DetailsScreenRouteProp>();
