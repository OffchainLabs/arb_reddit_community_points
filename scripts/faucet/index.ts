import { startStream, reply } from './twitter'
import { ethers } from 'ethers'
import { generateResponse } from '../contracts_lib'

startStream( async (tweet)=> {
    console.info(tweet && `incoming tweet: ${tweet.text}`);

    if (!isFaucetRequest(tweet.text)){
        console.info('not a faucet request')
        return
    }

    const address = extractAddress(tweet.text)
    if (!address){
        console.info('no address')
        return reply("Missing Address!", tweet)
    }


    const response = await generateResponse(address)


    reply(response, tweet)


})

const extractAddress = (str: string): string=> {
    return str
        .split(" ")
        .filter((subStr)=> subStr.startsWith("0x") && subStr.length == 42)
        [0] || ""
}

const isFaucetRequest = (tweetText): boolean=>{
    const lcaseTweet =  tweetText.toLowerCase()
    return lcaseTweet.includes("points")
}
