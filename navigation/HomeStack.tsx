import * as React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomeScreen from "../screens/HomeScreen"
import { HomeStackNavigatorParamList } from "./types"
import SendScreen from "../screens/SendScreen"

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
    </HomeStack.Navigator>
  )
}

export default HomeStackNavigator
