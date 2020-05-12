import { startStream, reply } from './twitter'
import { transfer, resetFaucet, getAssertion } from './arb'
import { ethers } from 'ethers'


startStream( async (tweet)=> {
    console.info(tweet && `incoming tweet: ${tweet.text}`);

    if (!isFaucetRequest(tweet.text))return

    const address = extractAddress(tweet.text)
    if (!address){
        console.info('no address')
        return reply("Missing Address!", tweet)
    }

    const tx = await transfer(address)
    const receipt = await tx.wait()
    const { transactionHash } = receipt

    const assertionTxHash = await getAssertion(transactionHash)

    // TODO: transactionHash is the arbitrum transaction hash so the etherscan link wouldn't be valid
    // What would be good to put here? If we wanted we could get the transaction of the assertion that
    // processed the transfer or the hash of the message batch that included it
    reply(`Funds sent! https://ropsten.etherscan.io/tx/${assertionTxHash}`, tweet)


})

const extractAddress = (str: string): string=> {
    return str
        .split(" ")
        .filter((subStr)=> subStr.startsWith("0x") && subStr.length == 42)
        [0] || ""
}

const isFaucetRequest = (tweetText): boolean=>{
    return tweetText.includes("gimmie") && tweetText.includes("tokens")
}
