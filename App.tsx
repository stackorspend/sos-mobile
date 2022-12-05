import { StatusBar } from "expo-status-bar"
import RootNavigator from "./navigation"

//Intl import fix for Android
import "intl"
import "intl/locale-data/jsonp/en"

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  )
}
