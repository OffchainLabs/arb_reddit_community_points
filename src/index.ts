import { startStream, reply } from './twitter'
import { sendEther } from './arb'


startStream( async (tweet)=> {

    if (!isFaucetRequest(tweet.text))return

    const address = extractAddress(tweet.text)
    if (!address){
        return reply("Missing Address!", tweet)
    }

    const tx = await sendEther(address)
    const receipt = await tx.wait()
    const { transactionHash } = receipt

    reply(`Funds sent! https://etherscan.io/tx/${transactionHash}`, tweet)


})

const extractAddress = (str: string): string=> {
    return str
        .split(" ")
        .filter((subStr)=> subStr.startsWith("0x") && subStr.length == 42)
        [0] || ""
}

const isFaucetRequest = (tweetText): boolean=>{
    // TODO
    return tweetText.includes("arb me up")
}
