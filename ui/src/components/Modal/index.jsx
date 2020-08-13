import Modal from './RawModal'
import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import Carousel from './WelcomeCarousel'

const ModalContainer = styled.div`
  display: flex;
  align-items: center;
  width: 80%;
  margin: auto;
  *:focus {
    outline: none !important;
  }
  user-select: none;
`

function WelcomeModal({shouldOpenModalCache, setShouldOpenModalCache}) {
  const [isOpen, setModalIsOpen] = useState(false)
  const [delay, setDelay] = useState(1500)

  useEffect(() => {    
    shouldOpenModalCache &&
      window.setTimeout(() => {
        setModalIsOpen(true)
      }, delay)
      setDelay(0)
  }, [shouldOpenModalCache])

  const onDismiss = useCallback(() => {
    setModalIsOpen(false)
    shouldOpenModalCache && setShouldOpenModalCache(false)
  }, [setShouldOpenModalCache, shouldOpenModalCache])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <ModalContainer>
        <Carousel />
      </ModalContainer>
    </Modal>
  )
}

export default WelcomeModal