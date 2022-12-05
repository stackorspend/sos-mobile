import { PRICE_STATES } from "../../project-constants"
import colors from "../../styles/colors"

const useColors = (currentState) => {
  // Derived state
  const isSpend = currentState === PRICE_STATES.SPEND
  const isStack = currentState === PRICE_STATES.STACK
  const textColor = isSpend ? colors.primaryGreen : colors.cautiousDark
  const backgroundColor = isSpend ? colors.positive : colors.cautious

  return {
    isSpend,
    isStack,
    textColor,
    backgroundColor,
  }
}

export default useColors
