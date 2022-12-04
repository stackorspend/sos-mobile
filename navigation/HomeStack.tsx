import * as React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomeScreen from "../screens/HomeScreen"
import { HomeStackNavigatorParamList } from "./types"
import SendScreen from "../screens/SendScreen"
import TransferCompleteScreen from "../screens/TransferComplete"
import ReceiveScreen from "../screens/ReceiveScreen"
import TransactionsScreen from "../screens/TransactionsScreen"

const HomeStack = createNativeStackNavigator<HomeStackNavigatorParamList>()

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="Send"
        component={SendScreen}
        options={{
          headerShown: true,
          // headerBackTitleVisible: false,
          headerTitle: "",
          headerShadowVisible: false,
          headerTransparent: true,
          headerTintColor: "black",
        }}
      />
      <HomeStack.Screen name="TransferComplete" component={TransferCompleteScreen} />
      <HomeStack.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{
          headerShown: true,
          // headerBackTitleVisible: false,
          headerTitle: "",
          headerShadowVisible: false,
          headerTransparent: true,
          headerTintColor: "black",
        }}
      />
      <HomeStack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          headerShown: true,
          // headerBackTitleVisible: false,
          headerTitle: "",
          headerShadowVisible: false,
          headerTransparent: true,
          headerTintColor: "black",
        }}
      />
    </HomeStack.Navigator>
  )
}

export default HomeStackNavigator
