import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"

// Define types for the intended screens
export type HomeStackNavigatorParamList = {
  Home: undefined
  Send: undefined
  Details: {
    name: string
    birthYear: string
  }
}

// Define navigation types for each screen
export type HomeScreenNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  "Send"
>

export type DetailsScreenRouteProp = RouteProp<HomeStackNavigatorParamList, "Details">
// To use in screen, const route = useRoute<DetailsScreenRouteProp>();
