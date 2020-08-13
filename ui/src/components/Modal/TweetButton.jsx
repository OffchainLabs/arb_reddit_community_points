import React from 'react'
import { useWeb3Context } from 'web3-react'
import { TwitterShareButton } from 'react-twitter-embed'

const TweetButton = () => {
  const { account } = useWeb3Context()
  return (
    <TwitterShareButton
      options={{
        text: `@Arbi_Swap hey @OffChainLabs, gimmie some Ropsten test tokens plz! ${account || '0xyouraddresshere'} `,
        size: 'small'
      }}
      url={'.'}
      placeholder={'Tweet'}
    />
  )
}

export default TweetButton
