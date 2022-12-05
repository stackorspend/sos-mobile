import AsyncStorage from "@react-native-async-storage/async-storage"

export const storeAsyncStorageData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e) {
    // saving error
    console.log("Error saving to async storage", e)
  }
}

export const getAsyncStorageData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key)
    if (value !== null) {
      // value previously stored
      return value
    }
  } catch (e) {
    // error reading value
    console.log("Error reading from async storage", e)
  }
}
