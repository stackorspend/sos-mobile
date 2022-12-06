import * as React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import HomeStackNavigator from "./HomeStack"

const RootNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <HomeStackNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

export default RootNavigator
