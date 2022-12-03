import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

// Define types for the intended screens
export type HomeStackNavigatorParamList = {
  Home: undefined
  Send: undefined
  TransferComplete: {
    sats: number
  }
  Details: {
    name: string
    birthYear: string
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
export type DetailsScreenRouteProp = RouteProp<HomeStackNavigatorParamList, "Details">
export type TransferCompleteRouteProp = RouteProp<
  HomeStackNavigatorParamList,
  "TransferComplete"
>
// To use in screen, const route = useRoute<DetailsScreenRouteProp>();
