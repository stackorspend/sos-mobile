import React from "react"
import { Text } from "react-native"
import styled from "styled-components/native"
import colors from "./colors"
// Defining custom styled component wrappers for text so we can use our font

export const TextLight = styled(Text)<{ mBottom?: number; size?: number }>`
  /* font-family: "poppins"; */
  font-size: ${(props) => `${props.size ?? 16}px`};
  margin-bottom: ${(props) => `${props.mBottom ?? 0}px`};
  color: ${(props) => props.color ?? colors.copy};
  font-weight: 300;
`
export const TextRegular = styled(Text)<{ mBottom?: number }>`
  /* font-family: "poppins"; */
  font-size: ${(props) => `${props.size ?? 16}px`};
  margin-bottom: ${(props) => `${props.mBottom ?? 0}px`};
  color: ${(props) => props.color ?? colors.copy};
  font-weight: 400;
`
export const TextMedium = styled(Text)<{ mBottom?: number }>`
  /* font-family: "poppins-medium"; */
  font-size: ${(props) => `${props.size ?? 16}px`};
  margin-bottom: ${(props) => `${props.mBottom ?? 0}px`};
  color: ${(props) => props.color ?? colors.copy};
  font-weight: 500;
`
export const TextSemibold = styled(Text)<{ mBottom?: number }>`
  /* font-family: "poppins-semi"; */
  font-size: ${(props) => `${props.size ?? 16}px`};
  margin-bottom: ${(props) => `${props.mBottom ?? 0}px`};
  color: ${(props) => props.color ?? colors.copy};
  font-weight: 600;
`
export const TextBold = styled.Text<{ mBottom?: number }>`
  /* font-family: "poppins-bold"; */
  font-size: ${(props) => `${props.size ?? 16}px`};
  margin-bottom: ${(props) => `${props.mBottom ?? 0}px`};
  color: ${(props) => props.color ?? colors.copy};
  font-weight: 700;
`
export const SectionTitle = styled(TextSemibold)`
  font-size: 17px;
  margin-bottom: 15px;
`

export const PageHeading = styled(TextBold)`
  margin-top: 40px;
  font-size: 30px;
  margin-left: 20px;
`

export const Disclaimer = styled(TextRegular)`
  text-align: center;
  font-size: 14px;
  color: #888;
  font-style: italic;
  padding: 0 20px;
`
