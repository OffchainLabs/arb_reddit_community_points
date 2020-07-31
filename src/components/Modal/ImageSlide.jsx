import React from 'react'
import styled from 'styled-components'
import {theme} from "./RawModal"

const WelcomeImg = styled.img`
  width: 400px;
  height: auto;
  border: 4px solid #dc6be5;
  border-radius: 5px;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
`

const ImgWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`

const WelcomeText = styled.div`
  font-size: 18px;
  margin-bottom: 10px;
  min-height: 100px;
  line-height: 27px;
  color: ${theme.fontColor};
`
const WelcomeSliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  height: 500px;
`

const borderStyle = {
  // border: '3px solid #DC6BE5',
  // borderRadius: '3px'
}

const none = {}

function ImageSlide({ text, imageUrl, imageStyle = {}, textStyle = {} }) {
  return (
    <WelcomeSliderContainer>
      <WelcomeText style={textStyle}> {text}</WelcomeText>
      <ImgWrapper>
        <WelcomeImg src={imageUrl} style={imageStyle} />
      </ImgWrapper>
    </WelcomeSliderContainer>
  )
}

export default ImageSlide
