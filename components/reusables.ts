import styled from "styled-components"
import colors from "../styles/colors"

export const ContainerWithColourIntent = styled.View`
  background: ${(props) => props.color ?? colors.positive};
  position: relative;
`
