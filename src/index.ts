import { startStream, reply } from './twitter'
// import { transfer, resetFaucet, getAssertion, getTokenBalance, getEthBalance, getWalletEthBalance, getWalletAddress, getFaucetAddress, arbWallet } from './arb'
import { ethers } from 'ethers'
import { generateResponse } from './Distribution'

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

    const { id: userId }  = tweet.user;

 
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
    return tweetText.includes("gimme") && tweetText.includes("tokens")
}

// async function debugPrint() {
//     console.log("Wallet Address:", await getWalletAddress())
//     console.log("Wallet Eth Balance (For making txes):", ethers.utils.formatEther(await getWalletEthBalance()))
//     console.log()
//     console.log("Faucet Address:", getFaucetAddress())
//     console.log("Faucet Eth Balance:", ethers.utils.formatEther(await getEthBalance()))
//     console.log("Faucet Token Balance:", ethers.utils.formatEther(await getTokenBalance()))
// }

// async function send(address: string) {
//         const tx = await transfer(address)
//         const receipt = await tx.wait()
//         const { transactionHash } = receipt

//         const assertionTxHash = await getAssertion(transactionHash)

//         console.log(`Funds sent! https://ropsten.etherscan.io/tx/${assertionTxHash}`)
// }

// debugPrint()
// send("0x38299D74a169e68df4Da85Fb12c6Fd22246aDD9F")
