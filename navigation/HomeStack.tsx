import * as React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomeScreen from "../screens/HomeScreen"
import { HomeStackNavigatorParamList } from "./types"
import SendScreen from "../screens/SendScreen"
import TransferCompleteScreen from "../screens/TransferComplete"

const HomeStack = createNativeStackNavigator<HomeStackNavigatorParamList>()

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Send" component={SendScreen} />
      <HomeStack.Screen name="TransferComplete" component={TransferCompleteScreen} />
    </HomeStack.Navigator>
  )
}

export default HomeStackNavigator
