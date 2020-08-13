import React from 'react'
import styled, { css } from 'styled-components'
import { animated, useTransition } from 'react-spring'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { transparentize } from 'polished'

const MEDIA_WIDTHS = {
  upToSmall: 600,
  upToMedium: 960,
  upToLarge: 1280
}

const mediaWidthTemplates = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  accumulator[size] = (...args) => css`
    @media (max-width: ${MEDIA_WIDTHS[size]}px) {
      ${css(...args)}
    }
  `
  return accumulator
}, {})

let darkMode = false
export const theme = {
  concreteGray: darkMode ? '#292C2F' : '#FAFAFA',
  modalBackground: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
  inputBackground: darkMode ? '#202124' : "rgb(255,255,255)",
  shadowColor: darkMode ? '#000' : '#2F80ED',
  mediaWidth: mediaWidthTemplates,
  fontColor: darkMode ? "grey" : "black"
}

const AnimatedDialogOverlay = animated(DialogOverlay)
const WrappedDialogOverlay = ({ suppressClassNameWarning, ...rest }) => <AnimatedDialogOverlay {...rest} />
const StyledDialogOverlay = styled(WrappedDialogOverlay).attrs({
  suppressClassNameWarning: true
})`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${theme.modalBackground};
  }
`

const FilteredDialogContent = ({ ...rest }) => <DialogContent {  ...rest } aria-label="filtered-dialog-content" />

const StyledDialogContent = styled(FilteredDialogContent)`
  &[data-reach-dialog-content] {
    // margin: 0 0 2rem 0;
    margin: auto;
    border: 1px solid ${theme.concreteGray};
    background-color: ${theme.inputBackground};
    box-shadow: 0 4px 8px 0 ${transparentize(0.95, theme.shadowColor)};
    ${theme.mediaWidth.upToMedium`margin: 0;`};
    padding: 0px;
    width: 60vw;
    max-width: 750px;
    ${theme.mediaWidth.upToMedium`width: 65vw;`}
    ${theme.mediaWidth.upToSmall`width: 85vw;`}
    // max-height: 50vh;
    // min-height: 70vh;
    height: 85%;
    // min-height: 300px;
    // ${theme.mediaWidth.upToMedium`max-height: 65vh;`}
    // ${theme.mediaWidth.upToSmall`max-height: 80vh;`}
    display: flex;
    // overflow: hidden;
    border-radius: 10px;
  }
`

const HiddenCloseButton = styled.button`
  margin: 0;
  padding: 0;
  width: 0;
  height: 0;
  border: none;
`

export default function Modal({ isOpen, onDismiss, initialFocusRef, children }) {
  const transitions = useTransition(isOpen, null, {
    config: { duration: 150 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })

  return transitions.map(
    ({ item, key, props }) =>
      item && (
        <StyledDialogOverlay key={key} style={props} onDismiss={onDismiss} initialFocusRef={initialFocusRef}>
          <StyledDialogContent hidden={false}>
            <HiddenCloseButton onClick={onDismiss} />
            {children}
          </StyledDialogContent>
        </StyledDialogOverlay>
      )
  )
}