import React, { useState, useRef, useEffect } from 'react'
import Carousel from 'react-elastic-carousel'
import ImageSlide from './ImageSlide'
import WrongNetworkGif from '../../assets/gifs/wrong-network.gif'
import TransferGif from '../../assets/gifs/transfer.gif'
import Withdraw from '../../assets/gifs/withdraw.gif'
import ActionsGif from '../../assets/gifs/actions.gif'
import TwitterImage from '../../assets/images/twitter-share.png'
import LogoHandshake from '../../assets/images/logo-handshake.png'

import { Link } from '@material-ui/core'
import TweetButton from './TweetButton'
import styled from 'styled-components'

const TweetSpan = styled.span`
  * {
    display: inline;
    position: relative;
  }
`

const carouselContainerStyle = { height: "80%" }
const smallFontStyle = { fontSize: '15px', lineHeight: '20px' }
const noBorderImgStyle = { borderStyle: 'none' }

function WelcomeCarousel() {
  const carouselRef = useRef(null)

  const [autoPlayEnabled, setAutoPlay] = useState(true)
  const disableAutoPlay = () => setAutoPlay(false)

  function handleArrowPress(e) {
    e.stopPropagation()
    switch (e.keyCode) {
      case 37:
        carouselRef.current.slidePrev()
        disableAutoPlay()
        break
      case 39:
        carouselRef.current.slideNext()
        disableAutoPlay()
        break
      default:
        break
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleArrowPress)
    return () => {
      document.removeEventListener('keydown', handleArrowPress)
    }
  }, [handleArrowPress])

  const config = {
    enableAutoPlay: autoPlayEnabled,
    autoPlaySpeed: 7000,
    itmesToShow: 1
  }
  return (
    <Carousel
      onNextStart={disableAutoPlay}
      onPrevStart={disableAutoPlay}
      {...config}
      ref={carouselRef}
      style={carouselContainerStyle}
    >
      <ImageSlide
        text={
          <span>
            {' '}
            Welcome to Arb Community Points, a layer 2 implementation of Reddit Community Points using Arbitrum rollup technology!
            <br />
            <br />
            Once you get some funds on the rollup chain, you can use it just like you would layer 1 points.
            <br />
            <br />
            Let’s get started!
          </span>
        }
        imageUrl={LogoHandshake}
        imageStyle={noBorderImgStyle}
      />
      <ImageSlide
        text={
          <span>
            First, make sure you have{' '}
            <Link target="_blank" href="https://metamask.io/download.html">
              MetaMask installed
            </Link>{' '}
            and that you are connected to the Arbitrum network.
            <br/>
            <br/>
            For that, you will need to add an Arbitrum RPC provider to Metamask.
          </span>
        }
        imageUrl={WrongNetworkGif}
      />
      <ImageSlide
        text={
          <span>
            From the main screen you are able to view your balance and transfer your points to other addresses.
            Make sure you are logged into your correct Metamask account holding points.
          </span>
        }
        imageUrl={TransferGif}
      />
      <ImageSlide
        text={
          <TweetSpan>
            <span>If you don't have any points,</span> <TweetButton />{' '}
            <span>at us and we’ll send some test tokens directly to you on the layer 2 chain.</span>
          </TweetSpan>
        }
        imageUrl={TwitterImage}
      />
      <ImageSlide
        text={
          <span>
              You can also use our Faucet that will be released soon.
          </span>
        }
        imageUrl={Withdraw}
        // textStyle={smallFontStyle}
      />
      <ImageSlide
        text={
          <span>
            You can also claim tokens from your Reddit account depending on the distribution round. 
            You can read more about this <Link target="_blank" href="https://www.google.com">here</Link>.
          </span>
        }
        imageUrl={ActionsGif}
      />
      <ImageSlide
        text={
          <span>
            For more info, checkout our{' '}
            <Link href="https://medium.com/offchainlabs" target="_blank">
              blog
            </Link>{' '}
            and our{' '}
            <Link href="https://developer.offchainlabs.com/docs/Developer_Quickstart/" target="_blank">
              docs
            </Link>
            .
            <br /> <br />
            Happy swapping!
          </span>
        }
        imageUrl={LogoHandshake}
        imageStyle={noBorderImgStyle}
      />
    </Carousel>
  )
}

export default WelcomeCarousel